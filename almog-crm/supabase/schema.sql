-- ─────────────────────────────────────────────────────────────────
-- ALMOG CRM — Complete Supabase Schema
-- Run in: Supabase SQL Editor → New Query → Paste → Run
-- ─────────────────────────────────────────────────────────────────

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ─── LEADS ───────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS leads (
  id                     UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at             TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at             TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Contact
  name                   TEXT NOT NULL,
  phone                  TEXT NOT NULL,
  email                  TEXT,
  id_number              TEXT,          -- ת"ז
  city                   TEXT,          -- עיר

  -- Pipeline
  status                 TEXT NOT NULL DEFAULT 'new'
                           CHECK (status IN (
                             'new','questionnaire_done','docs_pending','in_review',
                             'ready_to_submit','submitted','waiting_result',
                             'refund_received','closed'
                           )),
  source                 TEXT NOT NULL DEFAULT 'questionnaire'
                           CHECK (source IN (
                             'questionnaire','whatsapp','referral','manual',
                             'instagram','facebook','google','other'
                           )),
  score                  INTEGER DEFAULT 0 CHECK (score BETWEEN 0 AND 10),
  score_label            TEXT CHECK (score_label IN ('hot','warm','cold')),

  -- Financial
  estimated_refund_min   INTEGER,
  estimated_refund_max   INTEGER,
  actual_refund_amount   INTEGER,       -- סכום החזר בפועל

  -- Operational
  bank_update_status     TEXT DEFAULT 'לא עודכן',
  partner                TEXT,          -- שת"פ
  last_contact_date      DATE,
  next_followup_date     DATE,          -- תאריך מעקב הבא

  notes                  TEXT DEFAULT '',
  assigned_to            TEXT
);

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$;

DROP TRIGGER IF EXISTS leads_updated_at ON leads;
CREATE TRIGGER leads_updated_at
  BEFORE UPDATE ON leads
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ─── QUESTIONNAIRE RESPONSES ─────────────────────────────────────
CREATE TABLE IF NOT EXISTS questionnaire_responses (
  id                     UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  lead_id                UUID NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
  created_at             TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Employment
  employment_type        TEXT NOT NULL,
  years_to_check         INTEGER[] NOT NULL DEFAULT '{}',
  changed_employer       BOOLEAN DEFAULT FALSE,
  num_employers          INTEGER,
  parallel_jobs          BOOLEAN DEFAULT FALSE,

  -- Leave
  maternity_leave        BOOLEAN DEFAULT FALSE,
  military_reserve       BOOLEAN DEFAULT FALSE,
  unemployment           BOOLEAN DEFAULT FALSE,
  unpaid_leave           BOOLEAN DEFAULT FALSE,

  -- Personal
  num_children           INTEGER DEFAULT 0,
  youngest_child_age     TEXT,
  academic_degree        BOOLEAN DEFAULT FALSE,
  periphery_resident     BOOLEAN,

  -- Financial
  donations              BOOLEAN DEFAULT FALSE,
  donation_amount        TEXT,
  self_deposits          BOOLEAN DEFAULT FALSE,
  income_range           TEXT NOT NULL DEFAULT '',
  previous_tax_return    BOOLEAN DEFAULT FALSE,

  -- Docs
  can_upload_docs        BOOLEAN DEFAULT FALSE,

  raw_data               JSONB DEFAULT '{}'
);

-- ─── LEAD NOTES ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS lead_notes (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  lead_id    UUID NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  content    TEXT NOT NULL,
  author     TEXT NOT NULL DEFAULT 'אלמוג'
);

-- ─── TASKS ───────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS tasks (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  lead_id    UUID NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  due_date   DATE,
  title      TEXT NOT NULL,
  done       BOOLEAN DEFAULT FALSE
);

-- ─── DOCUMENTS ───────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS documents (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  lead_id     UUID NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
  name        TEXT NOT NULL,
  required    BOOLEAN DEFAULT TRUE,
  received    BOOLEAN DEFAULT FALSE,
  received_at TIMESTAMPTZ
);

-- ─── DISABLE RLS (MVP — service key from API routes only) ────────
ALTER TABLE leads                  DISABLE ROW LEVEL SECURITY;
ALTER TABLE questionnaire_responses DISABLE ROW LEVEL SECURITY;
ALTER TABLE lead_notes             DISABLE ROW LEVEL SECURITY;
ALTER TABLE tasks                  DISABLE ROW LEVEL SECURITY;
ALTER TABLE documents              DISABLE ROW LEVEL SECURITY;

-- ─── INDEXES ─────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_leads_status          ON leads(status);
CREATE INDEX IF NOT EXISTS idx_leads_created_at      ON leads(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_leads_phone           ON leads(phone);
CREATE INDEX IF NOT EXISTS idx_leads_followup        ON leads(next_followup_date);
CREATE INDEX IF NOT EXISTS idx_q_lead_id             ON questionnaire_responses(lead_id);
CREATE INDEX IF NOT EXISTS idx_notes_lead_id         ON lead_notes(lead_id);
CREATE INDEX IF NOT EXISTS idx_tasks_lead_id         ON tasks(lead_id);
CREATE INDEX IF NOT EXISTS idx_docs_lead_id          ON documents(lead_id);

-- ─── HELPFUL VIEWS ───────────────────────────────────────────────
CREATE OR REPLACE VIEW leads_summary AS
SELECT
  l.id, l.created_at, l.name, l.phone, l.city,
  l.status, l.source, l.score, l.score_label,
  l.estimated_refund_min, l.estimated_refund_max,
  l.actual_refund_amount, l.bank_update_status,
  l.next_followup_date, l.notes,
  (SELECT COUNT(*) FROM lead_notes  WHERE lead_id = l.id) AS notes_count,
  (SELECT COUNT(*) FROM tasks       WHERE lead_id = l.id AND done = FALSE) AS open_tasks,
  (SELECT COUNT(*) FROM documents   WHERE lead_id = l.id AND received = FALSE AND required = TRUE) AS missing_docs
FROM leads l
ORDER BY l.created_at DESC;
