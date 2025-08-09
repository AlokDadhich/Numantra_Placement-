/*
  # Fix RLS Policy for Student Registration

  1. Security Changes
    - Update RLS policy on `biodata_master` table to allow anonymous INSERT operations
    - This enables public student registration form submissions
    - Maintains security by only allowing INSERT, not SELECT/UPDATE/DELETE for anonymous users

  2. Policy Details
    - Anonymous users can only INSERT new biodata records
    - Authenticated users can read all biodata records
    - This ensures students can register while maintaining data privacy
*/

-- Drop existing policies to recreate them properly
DROP POLICY IF EXISTS "Allow public insert on biodata_master" ON biodata_master;
DROP POLICY IF EXISTS "Allow authenticated read on biodata_master" ON biodata_master;

-- Allow anonymous users to insert new biodata records (for student registration)
CREATE POLICY "Allow anonymous insert on biodata_master"
  ON biodata_master
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- Allow authenticated users to read biodata records (for admin access)
CREATE POLICY "Allow authenticated read on biodata_master"
  ON biodata_master
  FOR SELECT
  TO authenticated
  USING (true);

-- Allow authenticated users to update biodata records (for admin editing)
CREATE POLICY "Allow authenticated update on biodata_master"
  ON biodata_master
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Allow authenticated users to delete biodata records (for admin management)
CREATE POLICY "Allow authenticated delete on biodata_master"
  ON biodata_master
  FOR DELETE
  TO authenticated
  USING (true);