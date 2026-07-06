CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  first_name TEXT NOT NULL DEFAULT '',
  last_name TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS analyses (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  resume_text TEXT NOT NULL,
  job_description TEXT NOT NULL,
  company_name TEXT NOT NULL DEFAULT 'Unknown',
  match_score INTEGER NOT NULL,
  rewritten_bullets JSONB NOT NULL,
  cover_letter TEXT NOT NULL,
  skill_gaps JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
