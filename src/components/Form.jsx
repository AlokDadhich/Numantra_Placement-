import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { Upload, User, BookOpen, Briefcase, Target, CheckCircle, AlertCircle, Mail } from 'lucide-react';
import { getJobOpenings, submitBiodata } from '../lib/supabase';

const Form = () => {
  const navigate = useNavigate();
  const [companies, setCompanies] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  
  // RESUME UPLOAD STATE
  const [resumeFile, setResumeFile] = useState(null);
  const [isUploadingResume, setIsUploadingResume] = useState(false);
  const [resumeUploadSuccess, setResumeUploadSuccess] = useState(false);
  const [resumeUploadError, setResumeUploadError] = useState('');
  const [resumeName, setResumeName] = useState('');
  const [resumeEmail, setResumeEmail] = useState('');
  
  // Form hook for main registration form ONLY
  const { register, handleSubmit, formState: { errors }, watch, setValue } = useForm();

  // Initialize component
  useEffect(() => {
    loadCompanies();
  }, []);

  const loadCompanies = async () => {
    const { data, error } = await getJobOpenings();
    if (data) {
      const uniqueCompanies = [...new Set(data.map(job => job.company))].filter(Boolean);
      setCompanies(uniqueCompanies);
    }
  };

  // RESUME UPLOAD HANDLERS
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 20 * 1024 * 1024) {
        setResumeUploadError('File size must be less than 20MB.');
        return;
      }
      setResumeFile(file);
      setResumeUploadError('');
      setResumeUploadSuccess(false);
    }
  };

  const handleResumeNameChange = (e) => {
    setResumeName(e.target.value);
    setResumeUploadError('');
  };

  const handleResumeEmailChange = (e) => {
    setResumeEmail(e.target.value);
    setResumeUploadError('');
  };

  // FORMSUBMIT EMAIL SUBMISSION
  const handleResumeUpload = async () => {
    if (!resumeFile) {
      setResumeUploadError('Please select a file first.');
      return;
    }

    if (!resumeEmail || !resumeName) {
      setResumeUploadError('Please fill in name and email for file upload.');
      return;
    }

    // Validate email format
    const emailRegex = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;
    if (!emailRegex.test(resumeEmail)) {
      setResumeUploadError('Please enter a valid email address.');
      return;
    }

    setIsUploadingResume(true);
    setResumeUploadError('');

    try {
      const currentDate = new Date().toLocaleString();
      const formData = new FormData();
      
      // FormSubmit required fields
      formData.append('name', resumeName);
      formData.append('email', resumeEmail);
      formData.append('message', `File Submission from ${resumeName}

Candidate Details:
Name: ${resumeName}
Email: ${resumeEmail}
File: ${resumeFile.name}
File Size: ${(resumeFile.size / 1024).toFixed(1)}KB
Submitted: ${currentDate}

Please find the file attached. The candidate is interested in job opportunities.

Best regards,
${resumeName}`);
      
      // Attach the file
      formData.append('attachment', resumeFile);
      
      // FormSubmit optional configurations
      formData.append('_next', window.location.href);
      formData.append('_subject', `File Submission - ${resumeName}`);
      formData.append('_cc', resumeEmail);
      formData.append('_captcha', 'false');
      
      console.log('Sending file via FormSubmit...');
      
      const response = await fetch('https://formsubmit.co/numantraplacement@gmail.com', {
        method: 'POST',
        body: formData
      });

      if (response.ok) {
        console.log('File sent successfully via FormSubmit');
        setResumeUploadSuccess(true);
        setResumeUploadError('');
        
        // Reset form after successful submission
        setTimeout(() => {
          setResumeFile(null);
          setResumeName('');
          setResumeEmail('');
          document.getElementById('resume-file-input').value = '';
        }, 3000);
      } else {
        throw new Error(`FormSubmit failed with status: ${response.status}`);
      }

    } catch (error) {
      console.error('FormSubmit error:', error);
      
      let errorMessage = 'Email sending failed. ';
      
      if (error.message.includes('Failed to fetch')) {
        errorMessage += 'Network error. Please check your internet connection and try again.';
      } else if (error.message.includes('500')) {
        errorMessage += 'Server error. Please try again in a few minutes.';
      } else {
        errorMessage += `${error.message || 'Unknown error occurred'}. Please try again or contact support at numantraplacement@gmail.com.`;
      }
      
      setResumeUploadError(errorMessage);
    } finally {
      setIsUploadingResume(false);
    }
  };

  const calculateAge = (dob) => {
    if (!dob) return '';
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const dobValue = watch('dob');
  useEffect(() => {
    if (dobValue) {
      const age = calculateAge(dobValue);
      setValue('age', age);
    }
  }, [dobValue, setValue]);

  // FORM SUBMISSION TO DATABASE
  const onSubmit = async (data) => {
    setIsSubmitting(true);
    setSubmitError('');

    try {
      // Submit biodata to Supabase
      const { data: result, error } = await submitBiodata(data, null);
      
      if (error) {
        setSubmitError(error);
        setIsSubmitting(false);
        return;
      }

      navigate('/success', { state: { name: data.name } });
    } catch (error) {
      console.error('Form submission error:', error);
      setSubmitError('An error occurred while submitting your registration.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 bg-gray-50">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Job Application Portal</h1>
          <p className="text-gray-600 text-lg">Upload your file and register for placement opportunities</p>
        </div>

        {/* FILE UPLOAD SECTION */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl shadow-xl p-8 border-2 border-blue-100 mb-8">
          <div className="flex items-center mb-6">
            <Upload className="h-7 w-7 text-blue-600 mr-3" />
            <h2 className="text-2xl font-bold text-gray-900">File Upload</h2>
          </div>
          
          <div className="space-y-6">
            {/* NAME AND EMAIL FOR FILE UPLOAD */}
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <User className="h-5 w-5 text-blue-600 mr-2" />
                Your Details
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    value={resumeName}
                    onChange={handleResumeNameChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white"
                    placeholder="Enter your name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    value={resumeEmail}
                    onChange={handleResumeEmailChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white"
                    placeholder="Enter your email"
                  />
                </div>
              </div>
            </div>
            
            {/* FILE UPLOAD SECTION */}
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <Upload className="h-5 w-5 text-blue-600 mr-2" />
                Upload File
              </h3>
              
              <div className="relative">
                <input
                  id="resume-file-input"
                  type="file"
                  onChange={handleFileChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <div className={`flex items-center justify-center w-full h-16 px-6 border-2 border-dashed rounded-xl transition-all duration-200 ${
                  resumeFile 
                    ? 'border-green-400 bg-green-50' 
                    : 'border-blue-300 bg-blue-50 hover:border-blue-500 hover:bg-blue-100'
                }`}>
                  <div className="text-center">
                    <Upload className={`h-6 w-6 mx-auto mb-2 ${resumeFile ? 'text-green-600' : 'text-blue-500'}`} />
                    <p className={`font-medium ${resumeFile ? 'text-green-700' : 'text-gray-700'}`}>
                      {resumeFile ? `✅ ${resumeFile.name}` : 'Click to select file (Max 20MB)'}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">All file formats supported</p>
                  </div>
                </div>
              </div>
            </div>

            {/* FILE UPLOAD BUTTON */}
            {resumeFile && resumeName && resumeEmail && (
              <div className="flex justify-center">
                <button
                  type="button"
                  onClick={handleResumeUpload}
                  disabled={isUploadingResume}
                  className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105 shadow-lg"
                >
                  {isUploadingResume ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                      Sending File...
                    </>
                  ) : (
                    <>
                      <Mail className="h-5 w-5 mr-3" />
                      Send File to HR Team
                    </>
                  )}
                </button>
              </div>
            )}

            {/* File Upload Success */}
            {resumeUploadSuccess && (
              <div className="bg-green-50 border border-green-200 rounded-xl p-6 flex items-start">
                <CheckCircle className="h-6 w-6 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                <div className="flex-grow">
                  <h4 className="text-green-800 font-semibold mb-3">File Sent Successfully!</h4>
                  <div className="text-green-700 text-sm space-y-3">
                    <p className="font-medium">✅ Your file has been emailed to the HR team</p>

                    <p className="text-xs text-green-600 mt-3 font-medium">
                      Your file has been successfully delivered!
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* File Upload Error */}
            {resumeUploadError && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center">
                <AlertCircle className="h-5 w-5 text-red-500 mr-3 flex-shrink-0" />
                <div className="text-red-700">
                  <p className="font-semibold">Upload Failed</p>
                  <p className="text-sm mt-1">{resumeUploadError}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* DIVIDER */}
        <div className="flex items-center my-8">
          <div className="flex-grow h-px bg-gray-300"></div>
          <span className="px-4 text-gray-500 font-medium">OR</span>
          <div className="flex-grow h-px bg-gray-300"></div>
        </div>

        {/* REGISTRATION FORM */}
        <div className="bg-gradient-to-r from-teal-50 to-green-50 rounded-2xl shadow-xl p-8 border-2 border-teal-100">
          <div className="flex items-center mb-6">
            <User className="h-7 w-7 text-teal-600 mr-3" />
            <h2 className="text-2xl font-bold text-gray-900">Registration Form</h2>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            {/* Personal Details */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <div className="flex items-center mb-4">
                <User className="h-5 w-5 text-teal-600 mr-2" />
                <h3 className="text-xl font-semibold text-gray-900">Personal Details</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    {...register('name', { required: 'Name is required' })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-colors"
                    placeholder="Enter your full name"
                  />
                  {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email ID *
                  </label>
                  <input
                    type="email"
                    {...register('email_id', { 
                      required: 'Email is required',
                      pattern: {
                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                        message: 'Invalid email address'
                      }
                    })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-colors"
                    placeholder="Enter your email address"
                  />
                  {errors.email_id && <p className="mt-1 text-sm text-red-600">{errors.email_id.message}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Mobile Number *
                  </label>
                  <input
                    type="tel"
                    {...register('mobile_number', { 
                      required: 'Mobile number is required',
                      pattern: {
                        value: /^[\+]?[1-9][\d]{0,15}$/,
                        message: 'Invalid mobile number'
                      }
                    })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-colors"
                    placeholder="+91-1234567890"
                  />
                  {errors.mobile_number && <p className="mt-1 text-sm text-red-600">{errors.mobile_number.message}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Date of Birth
                  </label>
                  <input
                    type="date"
                    {...register('dob')}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Age
                  </label>
                  <input
                    type="number"
                    {...register('age')}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-colors bg-gray-50"
                    placeholder="Calculated from DOB"
                    readOnly
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Location
                  </label>
                  <input
                    type="text"
                    {...register('location')}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-colors"
                    placeholder="Enter your location"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Marital Status
                  </label>
                  <select
                    {...register('married')}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-colors"
                  >
                    <option value="">Select</option>
                    <option value="Yes">Yes</option>
                    <option value="No">No</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Gender
                  </label>
                  <select
                    {...register('gender')}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-colors"
                  >
                    <option value="">Select</option>
                    <option value="M">Male</option>
                    <option value="F">Female</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Academic Details */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <div className="flex items-center mb-4">
                <BookOpen className="h-5 w-5 text-teal-600 mr-2" />
                <h3 className="text-xl font-semibold text-gray-900">Academic & Professional Details</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Qualification *
                  </label>
                  <input
                    type="text"
                    {...register('qualification', { required: 'Qualification is required' })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-colors"
                    placeholder="e.g., BCOM, Dip in IT"
                  />
                  {errors.qualification && <p className="mt-1 text-sm text-red-600">{errors.qualification.message}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Year *
                  </label>
                  <input
                    type="number"
                    {...register('year', { required: 'Year is required' })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-colors"
                    placeholder="e.g., 2022"
                  />
                  {errors.year && <p className="mt-1 text-sm text-red-600">{errors.year.message}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Highest Qualification
                  </label>
                  <input
                    type="text"
                    {...register('highest_qualification')}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-colors"
                    placeholder="e.g., MBA Marketing, BE-ELE&TEL"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Highest Qualification Year
                  </label>
                  <input
                    type="number"
                    {...register('highest_year')}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-colors"
                    placeholder="e.g., 2025"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Current Designation
                  </label>
                  <input
                    type="text"
                    {...register('designation')}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-colors"
                    placeholder="e.g., Brand Developer, Fresh Engineer"
                  />
                </div>
              </div>
            </div>

            {/* Experience Details */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <div className="flex items-center mb-4">
                <Briefcase className="h-5 w-5 text-teal-600 mr-2" />
                <h3 className="text-xl font-semibold text-gray-900">Experience Details</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Experience 1
                  </label>
                  <input
                    type="text"
                    {...register('exp_1')}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-colors"
                    placeholder="e.g., Sri Krishna Silk Mill"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Designation
                  </label>
                  <input
                    type="text"
                    {...register('exp_designation')}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-colors"
                    placeholder="e.g., Brand Developer"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    From - To
                  </label>
                  <input
                    type="text"
                    {...register('exp_from_to')}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-colors"
                    placeholder="e.g., 2015-till date"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Total Experience (Years)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    {...register('total_exp')}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-colors"
                    placeholder="e.g., 2.5"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Experience 2
                  </label>
                  <input
                    type="text"
                    {...register('exp_2')}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-colors"
                    placeholder="e.g., 2&3 Fechers"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Experience 3
                  </label>
                  <input
                    type="text"
                    {...register('exp_3')}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-colors"
                    placeholder="e.g., Transtec General Trading"
                  />
                </div>
              </div>
            </div>

            {/* Placement Preferences */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <div className="flex items-center mb-4">
                <Target className="h-5 w-5 text-teal-600 mr-2" />
                <h3 className="text-xl font-semibold text-gray-900">Placement Preferences</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Current CTC (Annual)
                  </label>
                  <input
                    type="number"
                    {...register('current_ctc')}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-colors"
                    placeholder="e.g., 456000"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Expected CTC (Annual)
                  </label>
                  <input
                    type="number"
                    {...register('expected_ctc')}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-colors"
                    placeholder="e.g., 600000"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Reference
                  </label>
                  <input
                    type="text"
                    {...register('ref')}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-colors"
                    placeholder="e.g., Abhijit - Parle"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Remarks
                  </label>
                  <textarea
                    {...register('remark')}
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-colors"
                    placeholder="Any additional information..."
                  />
                </div>
              </div>
            </div>

            {/* Form Submission Error */}
            {submitError && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center">
                <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
                <span className="text-red-700">{submitError}</span>
              </div>
            )}

            {/* FORM SUBMIT BUTTON */}
            <div className="flex justify-center">
              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-teal-600 to-green-600 text-white font-semibold rounded-xl hover:from-teal-700 hover:to-green-700 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105 shadow-lg"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Saving to Database...
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-5 w-5 mr-2" />
                    Submit Registration
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Form;