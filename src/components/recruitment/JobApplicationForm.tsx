import React, { useState } from 'react';
import { FileText } from 'lucide-react';
import { JobPosting, JobApplication, addJobApplication } from '../../lib/firebase/recruitment';

interface JobApplicationFormProps {
  job: JobPosting;
  onClose: () => void;
}

const JobApplicationForm: React.FC<JobApplicationFormProps> = ({ job, onClose }) => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    resumeUrl: '',
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

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await addJobApplication({
        jobPostingId: job.id!,
        ...formData,
        status: 'New',
      } as JobApplication);
      
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit application');
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-none shadow-lg max-w-2xl w-full mx-4 my-8 overflow-y-auto max-h-[90vh]">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center">
            <FileText className="h-6 w-6 text-brand-600 mr-2" />
            <h2 className="text-lg font-medium text-gray-900">Apply for {job.title}</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500"
          >
            ×
          </button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 mb-6">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Personal Information */}
          <div>
            <h3 className="text-lg font-medium text-gray-900">Personal Information</h3>
            <div className="mt-4 grid grid-cols-1 gap-6 sm:grid-cols-2">
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

          {/* Executive Summary */}
          <div>
            <h3 className="text-lg font-medium text-gray-900">Executive Summary</h3>
            <div className="mt-4">
              <textarea
                id="executiveSummary"
                value={formData.executiveSummary}
                onChange={(e) => setFormData(prev => ({ ...prev, executiveSummary: e.target.value }))}
                className="input mt-1"
                rows={4}
                required
                placeholder="Briefly describe your professional background and why you're interested in this position"
              />
            </div>
          </div>

          {/* Education */}
          <div>
            <h3 className="text-lg font-medium text-gray-900">Education</h3>
            <div className="mt-4">
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
          </div>

          {/* Work Experience */}
          <div>
            <h3 className="text-lg font-medium text-gray-900">Work Experience</h3>
            <div className="mt-4">
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

          {/* Current Employment */}
          <div>
            <h3 className="text-lg font-medium text-gray-900">Current Employment</h3>
            <div className="mt-4 grid grid-cols-1 gap-6 sm:grid-cols-2">
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
            </div>
          </div>

          {/* Resume and Cover Letter */}
          <div>
            <h3 className="text-lg font-medium text-gray-900">Documents</h3>
            <div className="mt-4 space-y-4">
              <div>
                <label htmlFor="resumeUrl" className="block text-sm font-medium text-gray-700">
                  Resume URL
                </label>
                <input
                  type="url"
                  id="resumeUrl"
                  value={formData.resumeUrl}
                  onChange={(e) => setFormData(prev => ({ ...prev, resumeUrl: e.target.value }))}
                  className="input mt-1"
                  required
                  placeholder="Link to your resume (Google Drive, Dropbox, etc.)"
                />
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

          {/* Expected Salary */}
          <div>
            <h3 className="text-lg font-medium text-gray-900">Compensation</h3>
            <div className="mt-4">
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

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="btn btn-secondary"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? 'Submitting...' : 'Submit Application'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default JobApplicationForm;