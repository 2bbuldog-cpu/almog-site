/*
  Supabase Database Schema (SQL)
  Run this in your Supabase SQL editor.

  -- Enable UUID extension
  create extension if not exists "uuid-ossp";

  -- Leads table
  create table leads (
    id uuid primary key default uuid_generate_v4(),
    full_name text not null,
    phone text not null,
    email text,
    source text default 'website',
    status text default 'new' check (status in ('new','contacted','waiting_docs','under_review','submitted','completed','lost')),
    qualification_score integer default 0,
    created_at timestamptz default now(),
    updated_at timestamptz default now()
  );

  -- Questionnaire responses
  create table questionnaire_responses (
    id uuid primary key default uuid_generate_v4(),
    lead_id uuid references leads(id) on delete cascade,
    years integer[],
    employment_type text,
    changed_jobs boolean,
    changed_jobs_count integer,
    children_count integer default 0,
    maternity_leave boolean default false,
    academic_degree boolean default false,
    degree_year integer,
    donations boolean default false,
    donations_amount integer,
    city text,
    special_points text[],
    income_range text,
    created_at timestamptz default now()
  );

  -- Lead notes
  create table lead_notes (
    id uuid primary key default uuid_generate_v4(),
    lead_id uuid references leads(id) on delete cascade,
    content text not null,
    created_at timestamptz default now(),
    created_by text default 'almog'
  );

  -- Tasks
  create table tasks (
    id uuid primary key default uuid_generate_v4(),
    lead_id uuid references leads(id) on delete cascade,
    title text not null,
    due_date date,
    completed boolean default false,
    priority text default 'medium' check (priority in ('low','medium','high')),
    created_at timestamptz default now()
  );

  -- Documents checklist
  create table document_checklist (
    id uuid primary key default uuid_generate_v4(),
    lead_id uuid references leads(id) on delete cascade,
    doc_name text not null,
    required boolean default true,
    received boolean default false,
    notes text
  );

  -- Update trigger for leads.updated_at
  create or replace function update_updated_at()
  returns trigger as $$
  begin
    new.updated_at = now();
    return new;
  end;
  $$ language plpgsql;

  create trigger leads_updated_at
    before update on leads
    for each row execute function update_updated_at();

  -- RLS policies
  alter table leads enable row level security;
  alter table questionnaire_responses enable row level security;
  alter table lead_notes enable row level security;
  alter table tasks enable row level security;
  alter table document_checklist enable row level security;

  -- Allow anon to insert leads (for questionnaire)
  create policy "Anyone can create leads"
    on leads for insert with check (true);
  create policy "Anyone can create questionnaire responses"
    on questionnaire_responses for insert with check (true);

  -- Authenticated users can read/update everything
  create policy "Auth users read leads"
    on leads for select using (auth.role() = 'authenticated');
  create policy "Auth users update leads"
    on leads for update using (auth.role() = 'authenticated');
  create policy "Auth users read responses"
    on questionnaire_responses for select using (auth.role() = 'authenticated');
  create policy "Auth users manage notes"
    on lead_notes for all using (auth.role() = 'authenticated');
  create policy "Auth users manage tasks"
    on tasks for all using (auth.role() = 'authenticated');
  create policy "Auth users manage docs"
    on document_checklist for all using (auth.role() = 'authenticated');
*/

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      leads: {
        Row: {
          id: string
          full_name: string
          phone: string
          email: string | null
          source: string
          status: 'new' | 'contacted' | 'waiting_docs' | 'under_review' | 'submitted' | 'completed' | 'lost'
          qualification_score: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          full_name: string
          phone: string
          email?: string | null
          source?: string
          status?: 'new' | 'contacted' | 'waiting_docs' | 'under_review' | 'submitted' | 'completed' | 'lost'
          qualification_score?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          full_name?: string
          phone?: string
          email?: string | null
          source?: string
          status?: 'new' | 'contacted' | 'waiting_docs' | 'under_review' | 'submitted' | 'completed' | 'lost'
          qualification_score?: number
          updated_at?: string
        }
      }
      questionnaire_responses: {
        Row: {
          id: string
          lead_id: string
          years: number[] | null
          employment_type: string | null
          changed_jobs: boolean | null
          changed_jobs_count: number | null
          children_count: number
          maternity_leave: boolean
          academic_degree: boolean
          degree_year: number | null
          donations: boolean
          donations_amount: number | null
          city: string | null
          special_points: string[] | null
          income_range: string | null
          created_at: string
        }
        Insert: {
          id?: string
          lead_id: string
          years?: number[] | null
          employment_type?: string | null
          changed_jobs?: boolean | null
          changed_jobs_count?: number | null
          children_count?: number
          maternity_leave?: boolean
          academic_degree?: boolean
          degree_year?: number | null
          donations?: boolean
          donations_amount?: number | null
          city?: string | null
          special_points?: string[] | null
          income_range?: string | null
        }
        Update: Partial<Database['public']['Tables']['questionnaire_responses']['Insert']>
      }
      lead_notes: {
        Row: {
          id: string
          lead_id: string
          content: string
          created_at: string
          created_by: string
        }
        Insert: {
          id?: string
          lead_id: string
          content: string
          created_by?: string
        }
        Update: Partial<Database['public']['Tables']['lead_notes']['Insert']>
      }
      tasks: {
        Row: {
          id: string
          lead_id: string | null
          title: string
          due_date: string | null
          completed: boolean
          priority: 'low' | 'medium' | 'high'
          created_at: string
        }
        Insert: {
          id?: string
          lead_id?: string | null
          title: string
          due_date?: string | null
          completed?: boolean
          priority?: 'low' | 'medium' | 'high'
        }
        Update: Partial<Database['public']['Tables']['tasks']['Insert']>
      }
      document_checklist: {
        Row: {
          id: string
          lead_id: string
          doc_name: string
          required: boolean
          received: boolean
          notes: string | null
        }
        Insert: {
          id?: string
          lead_id: string
          doc_name: string
          required?: boolean
          received?: boolean
          notes?: string | null
        }
        Update: Partial<Database['public']['Tables']['document_checklist']['Insert']>
      }
    }
  }
}
