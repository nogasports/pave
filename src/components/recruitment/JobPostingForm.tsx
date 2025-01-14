import React, { useState } from 'react';
import { JobPosting, HeadcountRequest } from '../../lib/firebase/recruitment';
import { Department } from '../../lib/firebase/departments';
import { FileText, Plus, Minus } from 'lucide-react';

interface JobPostingFormProps {
  departments: Department[];
  headcountRequests: HeadcountRequest[];
  onSubmit: (data: Omit<JobPosting, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  onCancel: () => void;
}

const JobPostingForm: React.FC<JobPostingFormProps> = ({
  departments,
  headcountRequests,
  onSubmit,
  onCancel,
}) => {
  const [formData, setFormData] = useState({
    headcountRequestId: '',
    title: '',
    departmentId: '',
    type: 'Full-time' as JobPosting['type'],
    description: '',
    requirements: [''],
    responsibilities: [''],
    qualifications: [''],
    experience: '',
    salary: {
      min: 0,
      max: 0,
      currency: 'ETB',
    },
    closingDate: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleArrayChange = (
    field: 'requirements' | 'responsibilities' | 'qualifications',
    index: number,
    value: string
  ) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].map((item, i) => i === index ? value : item)
    }));
  };

  const handleAddItem = (field: 'requirements' | 'responsibilities' | 'qualifications') => {
    setFormData(prev => ({
      ...prev,
      [field]: [...prev[field], '']
    }));
  };

  const handleRemoveItem = (field: 'requirements' | 'responsibilities' | 'qualifications', index: number) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Clean up empty array items
      const cleanData = {
        ...formData,
        requirements: formData.requirements.filter(Boolean),
        responsibilities: formData.responsibilities.filter(Boolean),
        qualifications: formData.qualifications.filter(Boolean),
        closingDate: new Date(formData.closingDate),
        status: 'Draft' as const,
      };

      await onSubmit(cleanData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-none shadow-lg max-w-2xl w-full mx-4 my-8 overflow-y-auto max-h-[90vh]">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center">
            <FileText className="h-6 w-6 text-brand-600 mr-2" />
            <h2 className="text-lg font-medium text-gray-900">Create Job Posting</h2>
          </div>
          <button
            onClick={onCancel}
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
          <div>
            <label htmlFor="headcountRequestId" className="block text-sm font-medium text-gray-700">
              Headcount Request
            </label>
            <select
              id="headcountRequestId"
              value={formData.headcountRequestId}
              onChange={(e) => {
                const request = headcountRequests.find(r => r.id === e.target.value);
                setFormData(prev => ({
                  ...prev,
                  headcountRequestId: e.target.value,
                  departmentId: request?.departmentId || '',
                  title: request?.position || '',
                }));
              }}
              className="input mt-1"
            >
              <option value="">Select approved request...</option>
              {headcountRequests.map(request => (
                <option key={request.id} value={request.id}>
                  {request.position} - {departments.find(d => d.id === request.departmentId)?.name}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                Job Title
              </label>
              <input
                type="text"
                id="title"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                className="input mt-1"
                required
              />
            </div>

            <div>
              <label htmlFor="type" className="block text-sm font-medium text-gray-700">
                Employment Type
              </label>
              <select
                id="type"
                value={formData.type}
                onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value as JobPosting['type'] }))}
                className="input mt-1"
                required
              >
                <option value="Full-time">Full-time</option>
                <option value="Part-time">Part-time</option>
                <option value="Contract">Contract</option>
              </select>
            </div>
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700">
              Job Description
            </label>
            <textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              className="input mt-1"
              rows={4}
              required
            />
          </div>

          {/* Requirements */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-medium text-gray-700">
                Requirements
              </label>
              <button
                type="button"
                onClick={() => handleAddItem('requirements')}
                className="text-brand-600 hover:text-brand-700"
              >
                <Plus className="h-5 w-5" />
              </button>
            </div>
            {formData.requirements.map((req, index) => (
              <div key={index} className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={req}
                  onChange={(e) => handleArrayChange('requirements', index, e.target.value)}
                  className="input flex-1"
                  placeholder="Add requirement"
                />
                <button
                  type="button"
                  onClick={() => handleRemoveItem('requirements', index)}
                  className="text-red-600 hover:text-red-700"
                >
                  <Minus className="h-5 w-5" />
                </button>
              </div>
            ))}
          </div>

          {/* Responsibilities */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-medium text-gray-700">
                Responsibilities
              </label>
              <button
                type="button"
                onClick={() => handleAddItem('responsibilities')}
                className="text-brand-600 hover:text-brand-700"
              >
                <Plus className="h-5 w-5" />
              </button>
            </div>
            {formData.responsibilities.map((resp, index) => (
              <div key={index} className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={resp}
                  onChange={(e) => handleArrayChange('responsibilities', index, e.target.value)}
                  className="input flex-1"
                  placeholder="Add responsibility"
                />
                <button
                  type="button"
                  onClick={() => handleRemoveItem('responsibilities', index)}
                  className="text-red-600 hover:text-red-700"
                >
                  <Minus className="h-5 w-5" />
                </button>
              </div>
            ))}
          </div>

          {/* Qualifications */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-medium text-gray-700">
                Qualifications
              </label>
              <button
                type="button"
                onClick={() => handleAddItem('qualifications')}
                className="text-brand-600 hover:text-brand-700"
              >
                <Plus className="h-5 w-5" />
              </button>
            </div>
            {formData.qualifications.map((qual, index) => (
              <div key={index} className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={qual}
                  onChange={(e) => handleArrayChange('qualifications', index, e.target.value)}
                  className="input flex-1"
                  placeholder="Add qualification"
                />
                <button
                  type="button"
                  onClick={() => handleRemoveItem('qualifications', index)}
                  className="text-red-600 hover:text-red-700"
                >
                  <Minus className="h-5 w-5" />
                </button>
              </div>
            ))}
          </div>

          <div>
            <label htmlFor="experience" className="block text-sm font-medium text-gray-700">
              Required Experience
            </label>
            <input
              type="text"
              id="experience"
              value={formData.experience}
              onChange={(e) => setFormData(prev => ({ ...prev, experience: e.target.value }))}
              className="input mt-1"
              placeholder="e.g., 3-5 years"
              required
            />
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
            <div>
              <label htmlFor="salaryMin" className="block text-sm font-medium text-gray-700">
                Minimum Salary
              </label>
              <input
                type="number"
                id="salaryMin"
                value={formData.salary.min}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  salary: { ...prev.salary, min: Number(e.target.value) }
                }))}
                className="input mt-1"
                min="0"
              />
            </div>

            <div>
              <label htmlFor="salaryMax" className="block text-sm font-medium text-gray-700">
                Maximum Salary
              </label>
              <input
                type="number"
                id="salaryMax"
                value={formData.salary.max}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  salary: { ...prev.salary, max: Number(e.target.value) }
                }))}
                className="input mt-1"
                min="0"
              />
            </div>

            <div>
              <label htmlFor="salaryCurrency" className="block text-sm font-medium text-gray-700">
                Currency
              </label>
              <select
                id="salaryCurrency"
                value={formData.salary.currency}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  salary: { ...prev.salary, currency: e.target.value }
                }))}
                className="input mt-1"
              >
                <option value="ETB">ETB</option>
                <option value="USD">USD</option>
              </select>
            </div>
          </div>

          <div>
            <label htmlFor="closingDate" className="block text-sm font-medium text-gray-700">
              Closing Date
            </label>
            <input
              type="date"
              id="closingDate"
              value={formData.closingDate}
              onChange={(e) => setFormData(prev => ({ ...prev, closingDate: e.target.value }))}
              className="input mt-1"
              min={new Date().toISOString().split('T')[0]}
              required
            />
          </div>

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onCancel}
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
              {loading ? 'Saving...' : 'Create Job Posting'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default JobPostingForm;