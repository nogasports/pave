import React, { useState, useEffect } from 'react';
import { useParams, useLocation, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Upload, FileText } from 'lucide-react';
import { JobPosting, getJobPostings } from '../../lib/firebase/recruitment';
import { addJobApplication } from '../../lib/firebase/recruitment';
import { uploadFile, getDownloadURL } from '../../lib/firebase/storage';
import { wrapFirebaseOperation } from '../../lib/utils/errorHandling';

const JobApplication: React.FC = () => {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [job, setJob] = useState<JobPosting | null>(location.state?.job || null);
  const [loading, setLoading] = useState(!location.state?.job);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    resume: null as File | null,
    coverLetter: '',
    experience: 0,
    currentCompany: '',
    currentPosition: '',
    noticePeriod: '',
    expectedSalary: 0,
    executiveSummary: '',
    education: '',
    workExperience: '',
  });

  useEffect(() => {
    if (!job && id) {
      loadJob();
    }
  }, [id]);

  const loadJob = async () => {
    try {
      const jobs = await wrapFirebaseOperation(
        () => getJobPostings(),
        'Error loading job posting'
      );
      const jobPosting = jobs.find(j => j.id === id);
      if (!jobPosting) {
        throw new Error('Job posting not found');
      }
      setJob(jobPosting);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load job posting');
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'resume' | 'coverLetter') => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        setError(`${type === 'resume' ? 'Resume' : 'Cover Letter'} must be less than 5MB`);
        return;
      }
      setFormData(prev => ({ ...prev, [type]: file }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!job?.id) return;
    
    setSubmitting(true);
    setError(null);

    try {
      // Upload files first
      const [resumeUrl] = await Promise.all([
        formData.resume ? uploadFile(
          `applications/${job.id}/${formData.email}/resume/${formData.resume.name}`,
          formData.resume
        ) : Promise.reject('Resume is required')
      ]);

      // Submit application
      await addJobApplication({
        jobPostingId: job.id,
        ...formData,
        resumeUrl,
        status: 'New',
      });

      // Redirect to success page
      navigate(`/careers/${job.id}/success`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit application');
      setSubmitting(false);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div className="text-red-600">{error}</div>;
  if (!job) return <div>Job posting not found</div>;

  return (
    <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
      <div className="mb-8">
        <Link 
          to={`/careers/${job.id}`}
          className="flex items-center text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="h-5 w-5 mr-2" />
          Back to Job Details
        </Link>
      </div>

      <div className="bg-white shadow-lg rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h1 className="text-2xl font-bold text-gray-900">Apply for {job.title}</h1>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3">
              {error}
            </div>
          )}

          {/* Personal Information */}
          <div>
            <h2 className="text-lg font-medium text-gray-900 mb-4">Personal Information</h2>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
                  First Name
                </label>
                <input
                  type="text"
                  id="firstName"
                  value={formData.firstName}
                  onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
                  className="input mt-1"
                  required
                />
              </div>

              <div>
                <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">
                  Last Name
                </label>
                <input
                  type="text"
                  id="lastName"
                  value={formData.lastName}
                  onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
                  className="input mt-1"
                  required
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  className="input mt-1"
                  required
                />
              </div>

              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                  Phone
                </label>
                <input
                  type="tel"
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                  className="input mt-1"
                  required
                />
              </div>
            </div>
          </div>

          {/* Professional Summary */}
          <div>
            <h2 className="text-lg font-medium text-gray-900 mb-4">Professional Summary</h2>
            <div className="space-y-4">
              <div>
                <label htmlFor="executiveSummary" className="block text-sm font-medium text-gray-700">
                  Executive Summary
                </label>
                <textarea
                  id="executiveSummary"
                  value={formData.executiveSummary}
                  onChange={(e) => setFormData(prev => ({ ...prev, executiveSummary: e.target.value }))}
                  className="input mt-1"
                  rows={4}
                  required
                />
              </div>

              <div>
                <label htmlFor="experience" className="block text-sm font-medium text-gray-700">
                  Years of Experience
                </label>
                <input
                  type="number"
                  id="experience"
                  value={formData.experience}
                  onChange={(e) => setFormData(prev => ({ ...prev, experience: Number(e.target.value) }))}
                  className="input mt-1"
                  min="0"
                  step="0.5"
                  required
                />
              </div>
            </div>
          </div>

          {/* Current Employment */}
          <div>
            <h2 className="text-lg font-medium text-gray-900 mb-4">Current Employment</h2>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <label htmlFor="currentCompany" className="block text-sm font-medium text-gray-700">
                  Current Company
                </label>
                <input
                  type="text"
                  id="currentCompany"
                  value={formData.currentCompany}
                  onChange={(e) => setFormData(prev => ({ ...prev, currentCompany: e.target.value }))}
                  className="input mt-1"
                />
              </div>

              <div>
                <label htmlFor="currentPosition" className="block text-sm font-medium text-gray-700">
                  Current Position
                </label>
                <input
                  type="text"
                  id="currentPosition"
                  value={formData.currentPosition}
                  onChange={(e) => setFormData(prev => ({ ...prev, currentPosition: e.target.value }))}
                  className="input mt-1"
                />
              </div>

              <div>
                <label htmlFor="noticePeriod" className="block text-sm font-medium text-gray-700">
                  Notice Period
                </label>
                <input
                  type="text"
                  id="noticePeriod"
                  value={formData.noticePeriod}
                  onChange={(e) => setFormData(prev => ({ ...prev, noticePeriod: e.target.value }))}
                  className="input mt-1"
                  placeholder="e.g., 30 days"
                />
              </div>

              <div>
                <label htmlFor="expectedSalary" className="block text-sm font-medium text-gray-700">
                  Expected Salary ({job.salary?.currency || 'ETB'})
                </label>
                <input
                  type="number"
                  id="expectedSalary"
                  value={formData.expectedSalary}
                  onChange={(e) => setFormData(prev => ({ ...prev, expectedSalary: Number(e.target.value) }))}
                  className="input mt-1"
                  min="0"
                  required
                />
              </div>
            </div>
          </div>

          {/* Education & Experience */}
          <div>
            <h2 className="text-lg font-medium text-gray-900 mb-4">Education & Experience</h2>
            <div className="space-y-4">
              <div>
                <label htmlFor="education" className="block text-sm font-medium text-gray-700">
                  Education
                </label>
                <textarea
                  id="education"
                  value={formData.education}
                  onChange={(e) => setFormData(prev => ({ ...prev, education: e.target.value }))}
                  className="input mt-1"
                  rows={4}
                  required
                  placeholder="List your educational background, including degrees, institutions, and graduation dates"
                />
              </div>

              <div>
                <label htmlFor="workExperience" className="block text-sm font-medium text-gray-700">
                  Work Experience
                </label>
                <textarea
                  id="workExperience"
                  value={formData.workExperience}
                  onChange={(e) => setFormData(prev => ({ ...prev, workExperience: e.target.value }))}
                  className="input mt-1"
                  rows={6}
                  required
                  placeholder="Describe your relevant work experience, including company names, positions, dates, and key achievements"
                />
              </div>
            </div>
          </div>

          {/* Documents */}
          <div>
            <h2 className="text-lg font-medium text-gray-900 mb-4">Documents</h2>
            <div className="space-y-4">
              <div>
                <label htmlFor="resume" className="block text-sm font-medium text-gray-700">
                  Resume
                </label>
                <div className="mt-1 flex items-center">
                  <input
                    type="file"
                    id="resume"
                    accept=".pdf,.doc,.docx"
                    onChange={(e) => handleFileChange(e, 'resume')}
                    className="hidden"
                  />
                  <label
                    htmlFor="resume"
                    className="btn btn-secondary flex items-center cursor-pointer"
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    {formData.resume ? formData.resume.name : 'Upload Resume'}
                  </label>
                  {formData.resume && (
                    <span className="ml-2 text-sm text-gray-500">
                      {(formData.resume.size / 1024 / 1024).toFixed(2)} MB
                    </span>
                  )}
                </div>
                <p className="mt-1 text-sm text-gray-500">
                  PDF or Word document, max 5MB
                </p>
              </div>

              <div>
                <label htmlFor="coverLetter" className="block text-sm font-medium text-gray-700">
                  Cover Letter
                </label>
                <textarea
                  id="coverLetter"
                  value={formData.coverLetter}
                  onChange={(e) => setFormData(prev => ({ ...prev, coverLetter: e.target.value }))}
                  className="input mt-1"
                  rows={4}
                  placeholder="Optional: Include a cover letter"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-3">
            <Link
              to={`/careers/${job.id}`}
              className="btn btn-secondary"
            >
              Cancel
            </Link>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={submitting}
            >
              {submitting ? 'Submitting...' : 'Submit Application'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default JobApplication;