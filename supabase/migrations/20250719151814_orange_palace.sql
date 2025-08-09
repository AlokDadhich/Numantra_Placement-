/*
  # Create Numantra Placement Database Schema

  1. New Tables
    - `biodata_master`
      - `sl_no` (serial, primary key)
      - `name` (text, required)
      - `mobile_number` (text, required)
      - `email_id` (text, required, unique)
      - `designation` (text)
      - `qualification` (text, required)
      - `year` (integer, required)
      - `highest_qualification` (text)
      - `highest_year` (integer)
      - `dob` (date)
      - `age` (integer)
      - `location` (text)
      - `married` (text)
      - `gender` (text)
      - `exp_1` (text)
      - `exp_designation` (text)
      - `exp_from_to` (text)
      - `exp_2` (text)
      - `exp_3` (text)
      - `total_exp` (numeric)
      - `current_ctc` (bigint)
      - `expected_ctc` (bigint)
      - `ref` (text)
      - `remark` (text)
      - `resume_url` (text)
      - `submission_date` (timestamptz, default: now())

    - `job_master`
      - `sl_no` (serial, primary key)
      - `company` (text, required)
      - `qualification` (text)
      - `location` (text)
      - `timing` (text)
      - `posted` (text)
      - `salary_band` (text)
      - `email` (text)
      - `mobile` (text)
      - `target` (text)
      - `created_at` (timestamptz, default: now())

  2. Security
    - Enable RLS on both tables
    - Add policies for public read access to job_master
    - Add policies for public insert access to biodata_master
    - Add policies for authenticated admin access
*/

-- Create biodata_master table
CREATE TABLE IF NOT EXISTS biodata_master (
  sl_no SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  mobile_number TEXT NOT NULL,
  email_id TEXT NOT NULL UNIQUE,
  designation TEXT,
  qualification TEXT NOT NULL,
  year INTEGER NOT NULL,
  highest_qualification TEXT,
  highest_year INTEGER,
  dob DATE,
  age INTEGER,
  location TEXT,
  married TEXT,
  gender TEXT,
  exp_1 TEXT,
  exp_designation TEXT,
  exp_from_to TEXT,
  exp_2 TEXT,
  exp_3 TEXT,
  total_exp NUMERIC,
  current_ctc BIGINT,
  expected_ctc BIGINT,
  ref TEXT,
  remark TEXT,
  resume_url TEXT,
  submission_date TIMESTAMPTZ DEFAULT NOW()
);

-- Create job_master table
CREATE TABLE IF NOT EXISTS job_master (
  sl_no SERIAL PRIMARY KEY,
  company TEXT NOT NULL,
  qualification TEXT,
  location TEXT,
  timing TEXT,
  posted TEXT,
  salary_band TEXT,
  email TEXT,
  mobile TEXT,
  target TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE biodata_master ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_master ENABLE ROW LEVEL SECURITY;

-- Create policies for biodata_master
-- Allow public to insert (student registration)
CREATE POLICY "Allow public insert on biodata_master"
  ON biodata_master
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- Allow authenticated users to read all biodata (admin access)
CREATE POLICY "Allow authenticated read on biodata_master"
  ON biodata_master
  FOR SELECT
  TO authenticated
  USING (true);

-- Create policies for job_master
-- Allow public to read job openings
CREATE POLICY "Allow public read on job_master"
  ON job_master
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- Allow authenticated users to manage job openings (admin access)
CREATE POLICY "Allow authenticated insert on job_master"
  ON job_master
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Allow authenticated update on job_master"
  ON job_master
  FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated delete on job_master"
  ON job_master
  FOR DELETE
  TO authenticated
  USING (true);

-- Create storage bucket for resumes
INSERT INTO storage.buckets (id, name, public) 
VALUES ('resumes', 'resumes', false)
ON CONFLICT (id) DO NOTHING;

-- Create storage policy for resume uploads
CREATE POLICY "Allow public upload to resumes bucket"
  ON storage.objects
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (bucket_id = 'resumes');

-- Create storage policy for resume downloads (admin only)
CREATE POLICY "Allow authenticated download from resumes bucket"
  ON storage.objects
  FOR SELECT
  TO authenticated
  USING (bucket_id = 'resumes');