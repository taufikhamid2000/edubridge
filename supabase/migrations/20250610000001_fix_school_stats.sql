-- Create school_stats_history table if it doesn't exist
CREATE TABLE IF NOT EXISTS school_stats_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    recorded_at TIMESTAMPTZ NOT NULL,
    schools_count INTEGER NOT NULL,
    students_count INTEGER NOT NULL,
    average_participation NUMERIC(5,2) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS school_stats_history_recorded_at_idx ON school_stats_history (recorded_at);
CREATE INDEX IF NOT EXISTS school_stats_school_id_idx ON school_stats (school_id);
CREATE INDEX IF NOT EXISTS school_stats_average_score_idx ON school_stats (average_score);
CREATE INDEX IF NOT EXISTS school_stats_participation_rate_idx ON school_stats (participation_rate);

-- Add missing columns to school_stats table if they don't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name='school_stats' AND column_name='active_students'
    ) THEN
        ALTER TABLE school_stats ADD COLUMN active_students INTEGER NOT NULL DEFAULT 0;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name='school_stats' AND column_name='total_quizzes_taken'
    ) THEN
        ALTER TABLE school_stats ADD COLUMN total_quizzes_taken INTEGER NOT NULL DEFAULT 0;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name='school_stats' AND column_name='total_questions_answered'
    ) THEN
        ALTER TABLE school_stats ADD COLUMN total_questions_answered INTEGER NOT NULL DEFAULT 0;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name='school_stats' AND column_name='correct_answers'
    ) THEN
        ALTER TABLE school_stats ADD COLUMN correct_answers INTEGER NOT NULL DEFAULT 0;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name='school_stats' AND column_name='last_calculated_at'
    ) THEN
        ALTER TABLE school_stats ADD COLUMN last_calculated_at TIMESTAMPTZ NOT NULL DEFAULT NOW();
    END IF;
END $$;

-- Create a function to calculate and update school stats
CREATE OR REPLACE FUNCTION update_school_stats()
RETURNS void AS $$
DECLARE
    last_history_entry RECORD;
BEGIN
    -- First, ensure every school has a stats entry
    INSERT INTO school_stats (school_id)
    SELECT id FROM schools s
    WHERE NOT EXISTS (
        SELECT 1 FROM school_stats ss WHERE ss.school_id = s.id
    );

    -- Get the last history entry for comparison
    SELECT * INTO last_history_entry
    FROM school_stats_history
    ORDER BY recorded_at DESC
    LIMIT 1;

    -- Update stats for all schools
    WITH quiz_stats AS (
        SELECT 
            s.id as school_id,
            COUNT(DISTINCT qa.user_id) as active_students,
            COUNT(DISTINCT qa.id) as total_quizzes_taken,
            SUM(qa.correct_answers) as correct_answers,
            SUM(qa.total_questions) as total_questions_answered,
            -- Only count attempts within the last 30 days for active student count
            COUNT(DISTINCT CASE 
                WHEN qa.created_at >= NOW() - INTERVAL '30 days' 
                THEN qa.user_id 
            END) as recent_active_students
        FROM schools s
        LEFT JOIN user_profiles up ON up.school_id = s.id AND up.school_role = 'student'
        LEFT JOIN quiz_attempts qa ON qa.user_id = up.id
        GROUP BY s.id
    ),
    school_summary AS (
        SELECT 
            s.id as school_id,
            COALESCE(qs.total_quizzes_taken, 0) as total_quizzes_taken,
            COALESCE(qs.total_questions_answered, 0) as total_questions_answered,
            COALESCE(qs.correct_answers, 0) as correct_answers,
            COALESCE(qs.active_students, 0) as active_students,
            COALESCE(qs.recent_active_students, 0) as recent_active_students,
            s.total_students
        FROM schools s
        LEFT JOIN quiz_stats qs ON qs.school_id = s.id
    )
    UPDATE school_stats ss
    SET 
        average_score = CASE 
            WHEN summary.total_questions_answered > 0 
            THEN (summary.correct_answers::float / summary.total_questions_answered * 100)
            ELSE 0 
        END,
        participation_rate = CASE 
            WHEN summary.total_students > 0 
            THEN (summary.recent_active_students::float / summary.total_students * 100)
            ELSE 0 
        END,
        total_quizzes_taken = summary.total_quizzes_taken,
        total_questions_answered = summary.total_questions_answered,
        correct_answers = summary.correct_answers,
        active_students = summary.active_students,
        last_calculated_at = NOW()
    FROM school_summary summary
    WHERE ss.school_id = summary.school_id;

    -- Log stats history if there are significant changes
    IF NOT EXISTS (
        SELECT 1 FROM school_stats_history 
        WHERE recorded_at >= NOW() - INTERVAL '24 hours'
    ) OR (
        -- Check if there are significant changes from last history entry
        SELECT COUNT(*) > 0
        FROM (
            SELECT 
                COUNT(*) as total_schools,
                SUM(total_students) as total_students,
                AVG(participation_rate) as avg_participation
            FROM schools s
            JOIN school_stats ss ON ss.school_id = s.id
        ) current_stats
        WHERE ABS(current_stats.total_schools - last_history_entry.schools_count) > 0
           OR ABS(current_stats.total_students - last_history_entry.students_count) > 100
           OR ABS(current_stats.avg_participation - last_history_entry.average_participation) > 5
    ) THEN
        INSERT INTO school_stats_history (
            recorded_at,
            schools_count,
            students_count,
            average_participation
        )
        SELECT
            NOW(),
            COUNT(*),
            SUM(s.total_students),
            AVG(ss.participation_rate)
        FROM schools s
        JOIN school_stats ss ON ss.school_id = s.id;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Create a trigger to update stats when quiz attempts change
CREATE OR REPLACE FUNCTION trigger_update_school_stats()
RETURNS TRIGGER AS $$
BEGIN
    -- Only update stats if it's been more than 5 minutes since last update
    IF NOT EXISTS (
        SELECT 1 FROM school_stats
        WHERE last_calculated_at >= NOW() - INTERVAL '5 minutes'
    ) THEN
        PERFORM update_school_stats();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_school_stats_on_quiz_attempt ON quiz_attempts;
CREATE TRIGGER update_school_stats_on_quiz_attempt
AFTER INSERT OR UPDATE OR DELETE ON quiz_attempts
FOR EACH STATEMENT
EXECUTE FUNCTION trigger_update_school_stats();

-- Initial update of all school stats
SELECT update_school_stats();
