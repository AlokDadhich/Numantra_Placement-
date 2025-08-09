import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'your-supabase-url';
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'your-supabase-anon-key';

export const supabase = createClient(supabaseUrl, supabaseKey);

// Helper function to ensure bucket exists
const ensureBucketExists = async () => {
  try {
    // First, try to list buckets to see if 'resumes' exists
    const { data: buckets, error: listError } = await supabase
      .storage
      .listBuckets();
    
    if (listError) {
      console.error('Error listing buckets:', listError);
      return false;
    }

    // Check if resumes bucket exists
    const resumesBucket = buckets.find(bucket => bucket.name === 'resumes');
    
    if (!resumesBucket) {
      console.log('Resumes bucket not found, attempting to create...');
      
      // Create bucket if it doesn't exist
      const { data, error: createError } = await supabase
        .storage
        .createBucket('resumes', {
          public: true,
          allowedMimeTypes: ['application/pdf'],
          fileSizeLimit: 5242880 // 5MB
        });
      
      if (createError) {
        console.error('Failed to create resumes bucket:', createError);
        return false;
      }
      console.log('✅ Resumes bucket created successfully');
    } else {
      console.log('✅ Resumes bucket already exists');
    }
    
    return true;
  } catch (error) {
    console.error('Error in ensureBucketExists:', error);
    return false;
  }
};

// Database helpers
export const submitBiodata = async (formData, resumeFile) => {
  try {
    let resumeUrl = null;

    if (resumeFile) {
      // Ensure bucket exists first
      const bucketExists = await ensureBucketExists();
      if (!bucketExists) {
        throw new Error('Unable to create or access resume storage bucket');
      }

      const fileName = `${formData.email_id}_${Date.now()}.pdf`;

      console.log('Attempting to upload file:', fileName);

      // Upload resume
      const { data: uploadData, error: uploadError } = await supabase
        .storage
        .from('resumes')
        .upload(fileName, resumeFile, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        console.error('Resume upload error:', uploadError);
        throw new Error(`Upload failed: ${uploadError.message}`);
      }

      console.log('✅ File uploaded successfully:', uploadData);

      // Get public URL
      const { data: publicData } = supabase
        .storage
        .from('resumes')
        .getPublicUrl(fileName);

      resumeUrl = publicData.publicUrl;
      console.log('✅ Public URL generated:', resumeUrl);
    }

    // Insert biodata
    const { data, error } = await supabase
      .from('biodata_master')
      .insert([{
        ...formData,
        resume_url: resumeUrl,
        submission_date: new Date().toISOString()
      }])
      .select();

    if (error) throw error;
    return { data, error: null };

  } catch (error) {
    console.error('Submit biodata error:', error);
    return { data: null, error: error.message };
  }
};

// Helper function to get resume URL with proper error handling and bucket verification
export const getResumeUrl = async (fileName) => {
  try {
    // First ensure bucket exists
    const bucketExists = await ensureBucketExists();
    if (!bucketExists) {
      console.error('Resume bucket does not exist and could not be created');
      return null;
    }

    // Check if the file actually exists in the bucket
    const fileExists = await checkResumeExists(fileName);
    if (!fileExists) {
      console.error('Resume file does not exist:', fileName);
      return null;
    }

    const { data } = supabase
      .storage
      .from('resumes')
      .getPublicUrl(fileName);
    
    return data.publicUrl;
  } catch (error) {
    console.error('Error getting resume URL:', error);
    return null;
  }
};

// Helper function to check if resume exists
export const checkResumeExists = async (fileName) => {
  try {
    const { data, error } = await supabase
      .storage
      .from('resumes')
      .list('', {
        limit: 1000,
        search: fileName
      });
    
    if (error) {
      console.error('Error checking resume existence:', error);
      return false;
    }
    
    return data && data.length > 0;
  } catch (error) {
    console.error('Error in checkResumeExists:', error);
    return false;
  }
};

export const getJobOpenings = async () => {
  try {
    const response = await fetch('/api/job-openings');
    const result = await response.json();

    if (!response.ok) throw new Error(result.error);
    return { data: result.data, error: null };
  } catch (error) {
    return { data: null, error: error.message };
  }
};

export const getJobOpeningsAdmin = async (credentials) => {
  try {
    const response = await fetch('/api/admin/job-openings-data', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials)
    });

    const result = await response.json();
    if (!response.ok) throw new Error(result.error);
    return { data: result.data, error: null };
  } catch (error) {
    return { data: null, error: error.message };
  }
};

export const getBiodataEntries = async (credentials) => {
  try {
    const response = await fetch('/api/admin/biodata-data', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials)
    });

    const result = await response.json();
    if (!response.ok) throw new Error(result.error);
    return { data: result.data, error: null };
  } catch (error) {
    return { data: null, error: error.message };
  }
};

export const createJobOpening = async (jobData, credentials) => {
  try {
    const response = await fetch('/api/admin/create-job', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...credentials, jobData })
    });

    const result = await response.json();
    if (!response.ok) throw new Error(result.error);
    return { data: result.data, error: null };
  } catch (error) {
    return { data: null, error: error.message };
  }
};

export const updateJobOpening = async (id, jobData, credentials) => {
  try {
    const response = await fetch(`/api/admin/update-job/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...credentials, jobData })
    });

    const result = await response.json();
    if (!response.ok) throw new Error(result.error);
    return { data: result.data, error: null };
  } catch (error) {
    return { data: null, error: error.message };
  }
};

export const deleteJobOpening = async (id, credentials) => {
  try {
    const response = await fetch(`/api/admin/delete-job/${id}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials)
    });

    const result = await response.json();
    if (!response.ok) throw new Error(result.error);
    return { error: null };
  } catch (error) {
    return { error: error.message };
  }
};