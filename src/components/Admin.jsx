import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { 
  Users, 
  Briefcase, 
  Download, 
  Plus, 
  Edit, 
  Trash2, 
  Search,
  Eye,
  FileText,
  Save,
  X
} from 'lucide-react';
import { 
  getBiodataEntries, 
  getJobOpeningsAdmin, 
  createJobOpening, 
  updateJobOpening, 
  deleteJobOpening 
} from '../lib/supabase';

const Admin = () => {
  const [activeTab, setActiveTab] = useState('submissions');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loginCredentials, setLoginCredentials] = useState({ username: '', password: '' });
  const [submissions, setSubmissions] = useState([]);
  const [jobOpenings, setJobOpenings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingJob, setEditingJob] = useState(null);
  const [showJobForm, setShowJobForm] = useState(false);

  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  useEffect(() => {
    if (isAuthenticated) {
      loadData();
    }
  }, [isAuthenticated, activeTab]);

  const handleLogin = (e) => {
    e.preventDefault();
    if (loginCredentials.username === 'admin' && loginCredentials.password === 'numantra123') {
      setIsAuthenticated(true);
    } else {
      alert('Invalid credentials');
    }
  };

  const loadData = async () => {
    setLoading(true);
    if (activeTab === 'submissions') {
      const { data } = await getBiodataEntries(loginCredentials);
      setSubmissions(data || []);
    } else {
      const { data } = await getJobOpeningsAdmin(loginCredentials);
      setJobOpenings(data || []);
    }
    setLoading(false);
  };

  const downloadExcel = async () => {
    try {
      const response = await fetch('/api/download-excel');
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'Master.xlsx';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Download failed:', error);
      alert('Download failed. Please try again.');
    }
  };

  const onSubmitJob = async (data) => {
    try {
      if (editingJob) {
        await updateJobOpening(editingJob.sl_no, data, loginCredentials);
      } else {
        await createJobOpening(data, loginCredentials);
      }
      reset();
      setEditingJob(null);
      setShowJobForm(false);
      loadData();
    } catch (error) {
      alert('Failed to save job opening');
    }
  };

  const handleEditJob = (job) => {
    setEditingJob(job);
    setShowJobForm(true);
    reset(job);
  };

  const handleDeleteJob = async (id) => {
    if (window.confirm('Are you sure you want to delete this job opening?')) {
      await deleteJobOpening(id, loginCredentials);
      loadData();
    }
  };

  const filteredSubmissions = submissions.filter(submission =>
    submission.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    submission.email_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    submission.mobile_number?.includes(searchTerm)
  );

  const filteredJobOpenings = jobOpenings.filter(job =>
    job.company?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    job.location?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-teal-100 rounded-xl mb-4">
              <Users className="h-6 w-6 text-teal-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Admin Login</h2>
            <p className="text-gray-600">Enter your credentials to access the admin panel</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Username</label>
              <input
                type="text"
                value={loginCredentials.username}
                onChange={(e) => setLoginCredentials(prev => ({ ...prev, username: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
              <input
                type="password"
                value={loginCredentials.password}
                onChange={(e) => setLoginCredentials(prev => ({ ...prev, password: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full bg-teal-600 text-white py-3 rounded-lg font-semibold hover:bg-teal-700 transition-colors"
            >
              Login
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-gray-500">
            
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
          <p className="text-gray-600">Manage student registrations and job openings</p>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-2xl shadow-lg">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              <button
                onClick={() => setActiveTab('submissions')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'submissions'
                    ? 'border-teal-500 text-teal-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Users className="h-5 w-5 inline mr-2" />
                Student Submissions
              </button>
              <button
                onClick={() => setActiveTab('jobs')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'jobs'
                    ? 'border-teal-500 text-teal-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Briefcase className="h-5 w-5 inline mr-2" />
                Job Openings
              </button>
            </nav>
          </div>

          <div className="p-6">
            {/* Search and Actions */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder={`Search ${activeTab === 'submissions' ? 'submissions' : 'job openings'}...`}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                />
              </div>

              <div className="flex gap-3">
                {activeTab === 'submissions' ? (
                  <button
                    onClick={downloadExcel}
                    className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download Excel
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      setShowJobForm(true);
                      setEditingJob(null);
                      reset();
                    }}
                    className="inline-flex items-center px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Job Opening
                  </button>
                )}
              </div>
            </div>

            {/* Content */}
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
              </div>
            ) : activeTab === 'submissions' ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Email
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Mobile
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Qualification
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Submitted
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Resume
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
  {filteredSubmissions.map((submission) => (
    <tr key={submission.sl_no} className="hover:bg-gray-50">
      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
        {submission.name}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        {submission.email_id}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        {submission.mobile_number}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        {submission.qualification}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        {new Date(submission.submission_date).toLocaleDateString()}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        {submission.resume_url ? (
          <a
            href={submission.resume_url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center text-teal-600 hover:text-teal-900"
          >
            <FileText className="h-4 w-4 mr-1" />
            View
          </a>
        ) : (
          'No resume'
        )}
      </td>
    </tr>
  ))}
</tbody>

                </table>

                {filteredSubmissions.length === 0 && (
                  <div className="text-center py-12">
                    <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">No submissions found</p>
                  </div>
                )}
              </div>
            ) : (
              <div>
                {/* Job Form Modal */}
                {showJobForm && (
                  <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl max-w-2xl w-full max-h-screen overflow-y-auto">
                      <div className="p-6">
                        <div className="flex justify-between items-center mb-6">
                          <h3 className="text-xl font-semibold text-gray-900">
                            {editingJob ? 'Edit Job Opening' : 'Add New Job Opening'}
                          </h3>
                          <button
                            onClick={() => {
                              setShowJobForm(false);
                              setEditingJob(null);
                              reset();
                            }}
                            className="text-gray-400 hover:text-gray-600"
                          >
                            <X className="h-6 w-6" />
                          </button>
                        </div>

                        <form onSubmit={handleSubmit(onSubmitJob)} className="space-y-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Company *
                              </label>
                              <input
                                type="text"
                                {...register('company', { required: 'Company is required' })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                              />
                              {errors.company && <p className="text-sm text-red-600">{errors.company.message}</p>}
                            </div>

                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Qualification
                              </label>
                              <input
                                type="text"
                                {...register('qualification')}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                              />
                            </div>

                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Location
                              </label>
                              <input
                                type="text"
                                {...register('location')}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                              />
                            </div>

                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Timing
                              </label>
                              <input
                                type="text"
                                {...register('timing')}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                              />
                            </div>

                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Posted By
                              </label>
                              <input
                                type="text"
                                {...register('posted')}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                              />
                            </div>

                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Salary Band
                              </label>
                              <input
                                type="text"
                                {...register('salary_band')}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                              />
                            </div>

                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Email
                              </label>
                              <input
                                type="email"
                                {...register('email')}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                              />
                            </div>

                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Mobile
                              </label>
                              <input
                                type="text"
                                {...register('mobile')}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                              />
                            </div>
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Target
                            </label>
                            <input
                              type="text"
                              {...register('target')}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                              placeholder="e.g., 2024-26 batch, 6-12 month"
                            />
                          </div>

                          <div className="flex justify-end space-x-3 pt-4">
                            <button
                              type="button"
                              onClick={() => {
                                setShowJobForm(false);
                                setEditingJob(null);
                                reset();
                              }}
                              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                            >
                              Cancel
                            </button>
                            <button
                              type="submit"
                              className="inline-flex items-center px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
                            >
                              <Save className="h-4 w-4 mr-2" />
                              {editingJob ? 'Update' : 'Create'}
                            </button>
                          </div>
                        </form>
                      </div>
                    </div>
                  </div>
                )}

                {/* Jobs Table */}
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Company
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Location
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Qualification
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Salary
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Posted
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredJobOpenings.map((job) => (
                        <tr key={job.sl_no} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {job.company}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {job.location || '-'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {job.qualification || '-'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {job.salary_band || '-'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(job.created_at).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <div className="flex justify-end space-x-2">
                              <button
                                onClick={() => handleEditJob(job)}
                                className="text-indigo-600 hover:text-indigo-900"
                              >
                                <Edit className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteJob(job.sl_no)}
                                className="text-red-600 hover:text-red-900"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  {filteredJobOpenings.length === 0 && (
                    <div className="text-center py-12">
                      <Briefcase className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500">No job openings found</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Admin;