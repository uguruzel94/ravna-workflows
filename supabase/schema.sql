-- Enums
CREATE TYPE prospect_status AS ENUM (
  'cold_ready',
  'cold_sent',
  'replied',
  'audited',
  'proposal_sent',
  'won',
  'lost',
  'paused',
  'discarded'
);

CREATE TYPE interaction_type AS ENUM (
  'email_sent',
  'email_reply',
  'phone_call',
  'meeting',
  'proposal_sent',
  'contract_signed'
);

CREATE TYPE milestone_status AS ENUM (
  'pending',
  'in_progress',
  'completed',
  'blocked',
  'deferred'
);

CREATE TYPE newsletter_status AS ENUM (
  'draft',
  'scheduled',
  'sent',
  'archived'
);

-- Tables
CREATE TABLE prospects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  url TEXT UNIQUE,
  city TEXT,
  industry TEXT,
  ai_opportunities JSONB,
  score INTEGER,
  email_draft TEXT,
  status prospect_status DEFAULT 'cold_ready',
  next_follow_up TIMESTAMP,
  search_keyword TEXT,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

CREATE TABLE interactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  prospect_id UUID NOT NULL REFERENCES prospects(id),
  type interaction_type,
  content TEXT,
  sent_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

CREATE TABLE clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  contact_email TEXT,
  contact_name TEXT,
  city TEXT,
  industry TEXT,
  company_size TEXT,
  ai_opportunities JSONB,
  contract_value NUMERIC,
  contract_start_date DATE,
  contract_end_date DATE,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

CREATE TABLE project_milestones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES clients(id),
  title TEXT NOT NULL,
  description TEXT,
  status milestone_status DEFAULT 'pending',
  due_date DATE,
  completed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

CREATE TABLE newsletter_issues (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  content TEXT,
  status newsletter_status DEFAULT 'draft',
  issue_number INTEGER,
  published_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

CREATE TABLE subscribers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE,
  name TEXT,
  subscribed_at TIMESTAMP DEFAULT now(),
  unsubscribed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

CREATE TABLE curriculum_modules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  content TEXT,
  tags TEXT[],
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

CREATE TABLE client_curricula (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES clients(id),
  modules UUID[] NOT NULL,
  status TEXT DEFAULT 'draft',
  completed_modules UUID[] DEFAULT '{}',
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

CREATE TABLE pipeline_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  report_date DATE,
  content JSONB,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

-- Indexes
CREATE INDEX idx_prospects_status ON prospects(status);
CREATE INDEX idx_prospects_city ON prospects(city);
CREATE INDEX idx_prospects_url ON prospects(url);
CREATE INDEX idx_interactions_prospect_id ON interactions(prospect_id);
CREATE INDEX idx_clients_city ON clients(city);
CREATE INDEX idx_project_milestones_client_id ON project_milestones(client_id);
CREATE INDEX idx_newsletter_status ON newsletter_issues(status);
