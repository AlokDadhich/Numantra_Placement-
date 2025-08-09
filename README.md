# Numantra Placement Management System

A comprehensive placement management platform designed to streamline student/employee registration and job opening management. Built with React, TailwindCSS, Express.js, and Supabase.

## Features

### For Students/Candidates
- **Elegant Registration Form**: Comprehensive biodata collection with validation
- **Resume Upload**: PDF upload with file validation (max 5MB)
- **Job Openings**: Browse current opportunities from partner companies
- **Email Notifications**: Automatic confirmation emails upon registration

### For Administrators
- **Secure Admin Panel**: Protected dashboard with authentication
- **Student Management**: View, search, and manage student submissions
- **Excel Export**: Download complete biodata data as Master.xlsx
- **Job Management**: Create, edit, and delete job openings
- **Resume Access**: View and download submitted resumes

## Tech Stack

- **Frontend**: React, TailwindCSS, React Router, React Hook Form
- **Backend**: Express.js, Node.js
- **Database**: Supabase (PostgreSQL)
- **File Storage**: Supabase Storage
- **Email**: Nodemailer (configurable SMTP)
- **Excel**: ExcelJS for data export

## Database Schema

### biodata_master Table
- Complete student/candidate information
- Personal details, education, experience
- CTC preferences and references
- Resume URL and submission tracking

### job_master Table
- Company job openings
- Qualification requirements, location, timing
- Salary bands and contact information
- Posted by and target candidate details

## Local Development Setup

### Prerequisites
- Node.js 16+
- Supabase account
- MailHog (optional, for email testing)

### Installation

1. **Clone/Extract Project**
```bash
# If using git
git clone <repository-url>
cd numantra-placement

# Or extract the project folder
```

2. **Install Dependencies**
```bash
npm install
```

3. **Environment Configuration**
```bash
# Copy the example environment file
cp .env.example .env

# Edit .env with your Supabase credentials
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_KEY=your-supabase-service-key
```

4. **Supabase Setup**

Create a new Supabase project and run the migration:

```sql
-- Copy the contents of supabase/migrations/create_tables.sql
-- and run it in your Supabase SQL editor
```

This will create:
- `biodata_master` table with all student fields
- `job_master` table for job openings
- `resumes` storage bucket for file uploads
- Appropriate RLS policies for security

5. **Start Development Servers**

The application is configured to run on port 5555:

```bash
# Start both frontend and backend concurrently
npm run start
```

The app will be available at `http://localhost:5555`

### Email Testing (Optional)

For local email testing, install MailHog:

```bash
# Install MailHog
brew install mailhog  # macOS
# or download from: https://github.com/mailhog/MailHog/releases

# Start MailHog
mailhog
```

- SMTP server: `localhost:1025`
- Web interface: `http://localhost:8025`

## Usage

### Student Registration
1. Navigate to `http://localhost:5555`
2. Click "Register Now"
3. Fill in the comprehensive registration form
4. Upload PDF resume (max 5MB)
5. Submit and receive confirmation

### Admin Access
1. Navigate to `http://localhost:5555/admin`
2. Login credentials:
   - Username: `admin`
   - Password: `numantra123`
3. Access student submissions and job management

### Admin Features
- **Submissions Tab**: View all student registrations, download Excel, access resumes
- **Job Openings Tab**: Create/edit/delete job openings
- **Excel Export**: Download Master.xlsx with all biodata
- **Search**: Filter submissions and jobs by various criteria

## File Structure

```
numantra-placement/
├── src/
│   ├── components/          # React components
│   │   ├── Header.jsx      # Navigation header
│   │   ├── Home.jsx        # Homepage
│   │   ├── Form.jsx        # Registration form
│   │   ├── Openings.jsx    # Job openings display
│   │   ├── Success.jsx     # Success confirmation
│   │   └── Admin.jsx       # Admin dashboard
│   ├── lib/
│   │   └── supabase.js     # Supabase client & helpers
│   └── App.tsx             # Main app with routing
├── server/
│   └── server.js           # Express backend server
├── supabase/
│   └── migrations/         # Database schema
└── package.json            # Dependencies & scripts
```

## API Endpoints

- `GET /api/health` - Health check
- `POST /api/send-email` - Send notification emails
- `GET /api/download-excel` - Download Master.xlsx
- Frontend routes served by Express for SPA

## Key Features

### Form Validation
- Required field validation
- Email format checking
- Phone number validation
- File type and size validation (PDF, max 5MB)
- Age auto-calculation from DOB

### Security
- Row Level Security (RLS) on all tables
- Admin authentication
- File upload restrictions
- Input sanitization

### User Experience
- Responsive design (mobile to desktop)
- Loading states and error handling
- Smooth animations and transitions
- Professional design aesthetic
- Toast notifications for user feedback

## Troubleshooting

### Common Issues

1. **Supabase Connection Error**
   - Verify SUPABASE_URL and keys in .env
   - Check if migration was run successfully
   - Ensure RLS policies are properly configured

2. **File Upload Issues**
   - Confirm resumes bucket exists in Supabase
   - Check storage policies are set correctly
   - Verify file is PDF and under 5MB

3. **Email Not Working**
   - For local development, emails are logged to console
   - If using MailHog, ensure it's running on port 1025
   - Check NODEMAILER configuration in .env

4. **Port 5555 Already in Use**
   ```bash
   # Find and kill process using port 5555
   lsof -ti:5555 | xargs kill -9
   
   # Or use a different port
   npm run dev -- --port 3000
   ```

## Production Deployment

For production deployment:

1. Set up production Supabase project
2. Configure production email service (SendGrid, etc.)
3. Update environment variables
4. Build and deploy:
   ```bash
   npm run build
   npm run preview
   ```

## Support

For issues or questions:
1. Check the troubleshooting section
2. Verify Supabase configuration
3. Review console logs for errors
4. Ensure all dependencies are installed correctly

## License

This project is designed for educational and internal use by Numantra Placement.# Numantra_Placement-
