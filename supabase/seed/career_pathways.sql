-- Seed data for career_pathways and career_subject_requirements tables

-- Truncate existing data first to avoid duplicates on re-runs
DELETE FROM public.career_subject_requirements;
DELETE FROM public.career_pathways;

-- Insert Career Pathways
INSERT INTO public.career_pathways (slug, title, description, icon, order_index) VALUES
('software-engineer', 'Software Engineer', 'Design, develop, and maintain software systems and applications', 'code', 10),
('data-scientist', 'Data Scientist', 'Extract insights and knowledge from structured and unstructured data', 'chart-pie', 20),
('medical-doctor', 'Medical Doctor', 'Diagnose and treat illnesses, injuries, and other health conditions', 'medical', 30),
('educator', 'Educator', 'Teach students and develop curriculum for educational institutions', 'book-open', 40);

-- Insert Career Subject Requirements
-- First, we need to get the IDs for both careers and subjects

-- Software Engineer Requirements
DO $$
DECLARE
  career_id uuid;
  computer_science_id uuid;
  programming_id uuid;
  mathematics_id uuid;
  databases_id uuid;
  web_dev_id uuid;
  software_eng_id uuid;
  cloud_id uuid;
  mobile_id uuid;
  machine_learning_id uuid;
BEGIN
  -- Get Career ID
  SELECT id INTO career_id FROM public.career_pathways WHERE slug = 'software-engineer';
  
  -- Get Subject IDs - using LIKE with subject names since slugs might differ
  SELECT id INTO computer_science_id FROM public.subjects WHERE name ILIKE '%computer science%' OR slug ILIKE '%computer-science%' LIMIT 1;
  SELECT id INTO programming_id FROM public.subjects WHERE name ILIKE '%programming%' OR slug ILIKE '%programming%' LIMIT 1;
  SELECT id INTO mathematics_id FROM public.subjects WHERE name ILIKE '%math%' OR slug ILIKE '%math%' LIMIT 1;
  SELECT id INTO databases_id FROM public.subjects WHERE name ILIKE '%database%' OR slug ILIKE '%database%' LIMIT 1;
  SELECT id INTO web_dev_id FROM public.subjects WHERE name ILIKE '%web%' OR slug ILIKE '%web%' LIMIT 1;
  SELECT id INTO software_eng_id FROM public.subjects WHERE name ILIKE '%software%' OR slug ILIKE '%software%' LIMIT 1;
  SELECT id INTO cloud_id FROM public.subjects WHERE name ILIKE '%cloud%' OR slug ILIKE '%cloud%' LIMIT 1;
  SELECT id INTO mobile_id FROM public.subjects WHERE name ILIKE '%mobile%' OR slug ILIKE '%mobile%' LIMIT 1;
  SELECT id INTO machine_learning_id FROM public.subjects WHERE name ILIKE '%machine%' OR slug ILIKE '%machine%' LIMIT 1;
  
  -- Insert must learn subjects
  IF computer_science_id IS NOT NULL THEN
    INSERT INTO public.career_subject_requirements (career_id, subject_id, requirement_type, order_index)
    VALUES (career_id, computer_science_id, 'must', 10);
  END IF;
  
  IF programming_id IS NOT NULL THEN
    INSERT INTO public.career_subject_requirements (career_id, subject_id, requirement_type, order_index)
    VALUES (career_id, programming_id, 'must', 20);
  END IF;
  
  IF mathematics_id IS NOT NULL THEN
    INSERT INTO public.career_subject_requirements (career_id, subject_id, requirement_type, order_index)
    VALUES (career_id, mathematics_id, 'must', 30);
  END IF;
  
  -- Insert should learn subjects
  IF databases_id IS NOT NULL THEN
    INSERT INTO public.career_subject_requirements (career_id, subject_id, requirement_type, order_index)
    VALUES (career_id, databases_id, 'should', 10);
  END IF;
  
  IF web_dev_id IS NOT NULL THEN
    INSERT INTO public.career_subject_requirements (career_id, subject_id, requirement_type, order_index)
    VALUES (career_id, web_dev_id, 'should', 20);
  END IF;
  
  IF software_eng_id IS NOT NULL THEN
    INSERT INTO public.career_subject_requirements (career_id, subject_id, requirement_type, order_index)
    VALUES (career_id, software_eng_id, 'should', 30);
  END IF;
  
  -- Insert can learn subjects
  IF cloud_id IS NOT NULL THEN
    INSERT INTO public.career_subject_requirements (career_id, subject_id, requirement_type, order_index)
    VALUES (career_id, cloud_id, 'can', 10);
  END IF;
  
  IF mobile_id IS NOT NULL THEN
    INSERT INTO public.career_subject_requirements (career_id, subject_id, requirement_type, order_index)
    VALUES (career_id, mobile_id, 'can', 20);
  END IF;
  
  IF machine_learning_id IS NOT NULL THEN
    INSERT INTO public.career_subject_requirements (career_id, subject_id, requirement_type, order_index)
    VALUES (career_id, machine_learning_id, 'can', 30);
  END IF;
END $$;

-- Data Scientist Requirements
DO $$
DECLARE
  career_id uuid;
  statistics_id uuid;
  mathematics_id uuid;
  programming_id uuid;
  machine_learning_id uuid;
  databases_id uuid;
  data_viz_id uuid;
  deep_learning_id uuid;
  big_data_id uuid;
  nlp_id uuid;
BEGIN
  -- Get Career ID
  SELECT id INTO career_id FROM public.career_pathways WHERE slug = 'data-scientist';
  
  -- Get Subject IDs
  SELECT id INTO statistics_id FROM public.subjects WHERE name ILIKE '%statistic%' OR slug ILIKE '%statistic%' LIMIT 1;
  SELECT id INTO mathematics_id FROM public.subjects WHERE name ILIKE '%math%' OR slug ILIKE '%math%' LIMIT 1;
  SELECT id INTO programming_id FROM public.subjects WHERE name ILIKE '%programming%' OR slug ILIKE '%programming%' LIMIT 1;
  SELECT id INTO machine_learning_id FROM public.subjects WHERE name ILIKE '%machine%' OR slug ILIKE '%machine%' LIMIT 1;
  SELECT id INTO databases_id FROM public.subjects WHERE name ILIKE '%database%' OR slug ILIKE '%database%' LIMIT 1;
  SELECT id INTO data_viz_id FROM public.subjects WHERE name ILIKE '%visualization%' OR slug ILIKE '%visualization%' LIMIT 1;
  SELECT id INTO deep_learning_id FROM public.subjects WHERE name ILIKE '%deep learning%' OR slug ILIKE '%deep-learning%' LIMIT 1;
  SELECT id INTO big_data_id FROM public.subjects WHERE name ILIKE '%big data%' OR slug ILIKE '%big-data%' LIMIT 1;
  SELECT id INTO nlp_id FROM public.subjects WHERE name ILIKE '%language processing%' OR slug ILIKE '%nlp%' LIMIT 1;
  
  -- Insert must learn subjects
  IF statistics_id IS NOT NULL THEN
    INSERT INTO public.career_subject_requirements (career_id, subject_id, requirement_type, order_index)
    VALUES (career_id, statistics_id, 'must', 10);
  END IF;
  
  IF mathematics_id IS NOT NULL THEN
    INSERT INTO public.career_subject_requirements (career_id, subject_id, requirement_type, order_index)
    VALUES (career_id, mathematics_id, 'must', 20);
  END IF;
  
  IF programming_id IS NOT NULL THEN
    INSERT INTO public.career_subject_requirements (career_id, subject_id, requirement_type, order_index)
    VALUES (career_id, programming_id, 'must', 30);
  END IF;
  
  -- Insert should learn subjects
  IF machine_learning_id IS NOT NULL THEN
    INSERT INTO public.career_subject_requirements (career_id, subject_id, requirement_type, order_index)
    VALUES (career_id, machine_learning_id, 'should', 10);
  END IF;
  
  IF databases_id IS NOT NULL THEN
    INSERT INTO public.career_subject_requirements (career_id, subject_id, requirement_type, order_index)
    VALUES (career_id, databases_id, 'should', 20);
  END IF;
  
  IF data_viz_id IS NOT NULL THEN
    INSERT INTO public.career_subject_requirements (career_id, subject_id, requirement_type, order_index)
    VALUES (career_id, data_viz_id, 'should', 30);
  END IF;
  
  -- Insert can learn subjects
  IF deep_learning_id IS NOT NULL THEN
    INSERT INTO public.career_subject_requirements (career_id, subject_id, requirement_type, order_index)
    VALUES (career_id, deep_learning_id, 'can', 10);
  END IF;
  
  IF big_data_id IS NOT NULL THEN
    INSERT INTO public.career_subject_requirements (career_id, subject_id, requirement_type, order_index)
    VALUES (career_id, big_data_id, 'can', 20);
  END IF;
  
  IF nlp_id IS NOT NULL THEN
    INSERT INTO public.career_subject_requirements (career_id, subject_id, requirement_type, order_index)
    VALUES (career_id, nlp_id, 'can', 30);
  END IF;
END $$;

-- Similar patterns for Medical Doctor and Educator would be implemented here
-- This seed file implements just two careers as examples, but could be expanded
