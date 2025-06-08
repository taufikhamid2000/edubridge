-- Create a function to get random quizzes
create or replace function get_random_quizzes(limit_count int)
returns table (
  id text,
  title text,
  subject text,
  topic text,
  difficulty text
)
language plpgsql
security definer
as $$
begin
  return query
  select
    q.id::text,
    q.title,
    q.subject,
    q.topic,
    q.difficulty::text
  from quizzes q
  order by random()
  limit limit_count;
end;
$$;
