import express from 'express';
import cors from 'cors';
import multer from 'multer';
import nodemailer from 'nodemailer';
import ExcelJS from 'exceljs';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const app = express();
const PORT = 3000;

// Supabase configuration
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

let supabase = null;

// Initialize Supabase only if credentials are available
if (supabaseUrl && supabaseKey) {
  try {
    supabase = createClient(supabaseUrl, supabaseKey);
    console.log('✅ Supabase client initialized successfully');
  } catch (error) {
    console.error('❌ Failed to initialize Supabase client:', error.message);
  }
} else {
  console.warn('⚠️  Supabase credentials not found. Some features may not work.');
  console.warn('   Please create a .env file with VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY');
}

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('dist'));

// Multer configuration for file uploads
const storage = multer.memoryStorage();
const upload = multer({ 
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed'));
    }
  }
});

// Email configuration
const transporter = nodemailer.createTransport({
  host: process.env.NODEMAILER_HOST || 'localhost',
  port: process.env.NODEMAILER_PORT || 1025,
  secure: false,
  auth: false
});

// Routes

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Numantra Placement API is running' });
});

// Admin authentication and data endpoints
app.post('/api/admin/job-openings-data', async (req, res) => {
  try {
    if (!supabase) {
      return res.status(500).json({ error: 'Supabase not configured. Please check environment variables.' });
    }

    const { username, password } = req.body;
    
    // Authenticate admin credentials
    if (username !== 'admin' || password !== 'numantra123') {
      return res.status(401).json({ error: 'Invalid admin credentials' });
    }

    // Fetch job openings using service key (bypasses RLS)
    const { data, error } = await supabase
      .from('job_master')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    
    res.json({ data, error: null });
  } catch (error) {
    console.error('Admin job openings fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch job openings' });
  }
});

app.post('/api/admin/biodata-data', async (req, res) => {
  try {
    // Ensure Supabase client is configured
    if (!supabase) {
      console.error('❌ Supabase client not configured.');
      return res.status(500).json({
        error: 'Supabase client not initialized. Check environment variables.',
        data: []
      });
    }

    const { username, password } = req.body;

    // Admin authentication
    if (username !== 'admin' || password !== 'numantra123') {
      console.warn('⚠️ Unauthorized biodata fetch attempt');
      return res.status(401).json({
        error: 'Invalid admin credentials',
        data: []
      });
    }

    // Fetch biodata entries
    const { data, error } = await supabase
      .from('biodata_master')
      .select('*')
      .order('submission_date', { ascending: false });

    if (error) {
      console.error('❌ Supabase biodata fetch error:', error.message);
      return res.status(500).json({
        error: 'Database error while fetching biodata entries',
        data: []
      });
    }

    // Debug log
    console.log(`✅ Fetched ${data.length} biodata entries`);

    // Optionally log resume URL for inspection
    data.forEach(entry => {
      console.log(`📄 ${entry.email_id} → Resume URL: ${entry.resume_url || 'Not uploaded'}`);
    });

    res.status(200).json({ data, error: null });

  } catch (error) {
    console.error('❌ Server biodata fetch error:', error.message);
    res.status(500).json({
      error: 'Unexpected server error while fetching biodata',
      data: []
    });
  }
});


app.post('/api/admin/create-job', async (req, res) => {
  try {
    if (!supabase) {
      return res.status(500).json({ error: 'Supabase not configured. Please check environment variables.' });
    }

    const { username, password, jobData } = req.body;
    
    // Authenticate admin credentials
    if (username !== 'admin' || password !== 'numantra123') {
      return res.status(401).json({ error: 'Invalid admin credentials' });
    }

    // Create job opening using service key (bypasses RLS)
    const { data, error } = await supabase
      .from('job_master')
      .insert([{
        ...jobData,
        created_at: new Date().toISOString()
      }])
      .select();

    if (error) throw error;
    
    res.json({ data, error: null });
  } catch (error) {
    console.error('Admin job creation error:', error);
    res.status(500).json({ error: 'Failed to create job opening' });
  }
});

app.put('/api/admin/update-job/:id', async (req, res) => {
  try {
    if (!supabase) {
      return res.status(500).json({ error: 'Supabase not configured. Please check environment variables.' });
    }

    const { username, password, jobData } = req.body;
    const { id } = req.params;
    
    // Authenticate admin credentials
    if (username !== 'admin' || password !== 'numantra123') {
      return res.status(401).json({ error: 'Invalid admin credentials' });
    }

    // Update job opening using service key (bypasses RLS)
    const { data, error } = await supabase
      .from('job_master')
      .update(jobData)
      .eq('sl_no', id)
      .select();

    if (error) throw error;
    
    res.json({ data, error: null });
  } catch (error) {
    console.error('Admin job update error:', error);
    res.status(500).json({ error: 'Failed to update job opening' });
  }
});

app.delete('/api/admin/delete-job/:id', async (req, res) => {
  try {
    if (!supabase) {
      return res.status(500).json({ error: 'Supabase not configured. Please check environment variables.' });
    }

    const { username, password } = req.body;
    const { id } = req.params;
    
    // Authenticate admin credentials
    if (username !== 'admin' || password !== 'numantra123') {
      return res.status(401).json({ error: 'Invalid admin credentials' });
    }

    // Delete job opening using service key (bypasses RLS)
    const { error } = await supabase
      .from('job_master')
      .delete()
      .eq('sl_no', id);

    if (error) throw error;
    
    res.json({ error: null });
  } catch (error) {
    console.error('Admin job deletion error:', error);
    res.status(500).json({ error: 'Failed to delete job opening' });
  }
});

// Send email notification
app.post('/api/send-email', async (req, res) => {
  try {
    const { to, name, type } = req.body;
    
    let subject, text;
    
    if (type === 'student') {
      subject = 'Registration Confirmation - Numantra Placement';
      text = `Dear ${name},\n\nThank you for registering with Numantra Placement! Your submission has been confirmed.\n\nOur team will review your profile and contact you when suitable opportunities arise.\n\nBest regards,\nNumantra Placement Team`;
    } else {
      subject = 'New Student Registration - Numantra Placement';
      text = `New submission received from ${name} (Email: ${to}).\n\nPlease check the admin panel for details.`;
    }

    // For local development, just log the email
    console.log('📧 Email would be sent:');
    console.log(`To: ${to}`);
    console.log(`Subject: ${subject}`);
    console.log(`Message: ${text}`);
    
    res.json({ success: true, message: 'Email logged to console' });
  } catch (error) {
    console.error('Email error:', error);
    res.status(500).json({ error: 'Failed to send email' });
  }
});

// Download Excel file
app.get('/api/download-excel', async (req, res) => {
  try {
    if (!supabase) {
      return res.status(500).json({ error: 'Supabase not configured. Please check environment variables.' });
    }

    // Note: In production, this should also require admin authentication
    // Fetch biodata entries from Supabase
    const { data: biodataEntries, error } = await supabase
      .from('biodata_master')
      .select('*')
      .order('submission_date', { ascending: false });

    if (error) throw error;

    // Create workbook
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Biodata Master');

    // Add headers
    worksheet.addRow([
      'Sl No', 'Name', 'Mobile Number', 'email id', 'Designation', 
      'Qualification', 'Year', 'Highest qualification', 'Year', 'DOB', 
      'Age', 'Location', 'Married', 'M/F', 'EXP-1', 'Designation', 
      'From to', 'EXP-2', 'EXP-3', 'total exp', 'Current CTC', 
      'Expected ctc', 'Ref', 'Remark', 'Resume URL', 'Submission Date'
    ]);

    // Add data rows
    biodataEntries.forEach((entry, index) => {
      worksheet.addRow([
        index + 1,
        entry.name,
        entry.mobile_number,
        entry.email_id,
        entry.designation,
        entry.qualification,
        entry.year,
        entry.highest_qualification,
        entry.highest_year,
        entry.dob ? new Date(entry.dob).toLocaleDateString() : '',
        entry.age,
        entry.location,
        entry.married,
        entry.gender,
        entry.exp_1,
        entry.exp_designation,
        entry.exp_from_to,
        entry.exp_2,
        entry.exp_3,
        entry.total_exp,
        entry.current_ctc,
        entry.expected_ctc,
        entry.ref,
        entry.remark,
        entry.resume_url,
        entry.submission_date ? new Date(entry.submission_date).toLocaleDateString() : ''
      ]);
    });

    // Style the header row
    const headerRow = worksheet.getRow(1);
    headerRow.font = { bold: true };
    headerRow.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFE0E0E0' }
    };

    // Auto-fit columns
    worksheet.columns.forEach(column => {
      column.width = 15;
    });

    // Set response headers
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=Master.xlsx');

    // Write to response
    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    console.error('Excel generation error:', error);
    res.status(500).json({ error: 'Failed to generate Excel file' });
  }
});

// Public job openings endpoint (for student form dropdown)
app.get('/api/job-openings', async (req, res) => {
  try {
    if (!supabase) {
      return res.json({ data: [], error: 'Supabase not configured' });
    }

    // Fetch only company names for public access
    const { data, error } = await supabase
      .from('job_master')
      .select('company')
      .order('created_at', { ascending: false });

    if (error) throw error;
    
    res.json({ data, error: null });
  } catch (error) {
    console.error('Public job openings fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch job openings' });
  }
});

// Serve React app for all other routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../dist/index.html'));
});

// Error handling middleware
app.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ error: 'File size too large. Maximum 5MB allowed.' });
    }
  }
  res.status(500).json({ error: error.message });
});

app.listen(PORT, () => {
  console.log(`🚀 Numantra Placement server running on http://localhost:${PORT}`);
  console.log(`📊 Admin panel: http://localhost:${PORT}/admin`);
  console.log(`🔐 Admin credentials: admin / numantra123`);
});