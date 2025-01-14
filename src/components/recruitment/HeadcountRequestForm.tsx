import React, { useState, useEffect } from 'react';
import { HeadcountRequest } from '../../lib/firebase/recruitment';
import { Department } from '../../lib/firebase/departments';
import { Employee } from '../../lib/firebase/employees';
import { Users, Search } from 'lucide-react';

interface HeadcountRequestFormProps {
  departments: Department[];
  managers: Employee[];
  onSubmit: (data: Omit<HeadcountRequest, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  onCancel: () => void;
}

const HeadcountRequestForm: React.FC<HeadcountRequestFormProps> = ({
  departments,
  managers,
  onSubmit,
  onCancel,
}) => {
  const [formData, setFormData] = useState({
    departmentId: '',
    hiringManagerId: '',
    position: '',
    count: 1,
    justification: '',
    jobDescription: '',
    requirements: '',
    qualifications: '',
    budget: {
      min: 0,
      max: 0,
      currency: 'ETB'
    }
  });

  const [departmentManagers, setDepartmentManagers] = useState<Employee[]>([]);
  const [departmentSearch, setDepartmentSearch] = useState('');
  const [managerSearch, setManagerSearch] = useState('');
  const [showDepartmentResults, setShowDepartmentResults] = useState(false);
  const [showManagerResults, setShowManagerResults] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Filter departments based on search
  const filteredDepartments = departmentSearch.trim()
    ? departments.filter(dept => 
        dept.name.toLowerCase().includes(departmentSearch.toLowerCase())
      )
    : departments;

  // Filter managers based on search
  const filteredManagers = managerSearch.trim()
    ? departmentManagers.filter(manager => {
        const fullName = `${manager.firstName || ''} ${manager.fatherName || ''}`.toLowerCase();
        return fullName.includes(managerSearch.toLowerCase());
      })
    : departmentManagers;

  // Update available managers when department changes
  useEffect(() => {
    if (formData.departmentId) {
      const deptManagers = managers.filter(m => 
        m.departmentId === formData.departmentId && 
        m.position === 'Manager'
      );
      setDepartmentManagers(deptManagers);
      
      // Clear selected manager if not in new department
      if (!deptManagers.find(m => m.id === formData.hiringManagerId)) {
        setFormData(prev => ({ ...prev, hiringManagerId: '' }));
      }
    } else {
      setDepartmentManagers([]);
    }
  }, [formData.departmentId, managers]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (!formData.hiringManagerId) {
        throw new Error('Please select a hiring manager');
      }

      await onSubmit({
        ...formData,
        status: 'Pending',
      } as HeadcountRequest);
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
            <Users className="h-6 w-6 text-brand-600 mr-2" />
            <h2 className="text-lg font-medium text-gray-900">New Headcount Request</h2>
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
          {/* Department Search */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div>
              <label htmlFor="departmentId" className="block text-sm font-medium text-gray-700">
                Department
              </label>
              <div className="relative mt-1">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  value={formData.departmentId ? departments.find(d => d.id === formData.departmentId)?.name || '' : departmentSearch}
                  onChange={(e) => {
                    setDepartmentSearch(e.target.value);
                    setFormData(prev => ({ ...prev, departmentId: '' }));
                    setShowDepartmentResults(true);
                  }}
                  onFocus={() => setShowDepartmentResults(true)}
                  className="input pl-10"
                  placeholder="Search departments..."
                  required
                />
                {showDepartmentResults && (
                  <div className="absolute z-10 w-full mt-1 bg-white shadow-lg max-h-60 rounded-none border border-gray-200 overflow-auto">
                    {filteredDepartments.map(dept => (
                      <div
                        key={dept.id}
                        className="px-4 py-2 hover:bg-gray-50 cursor-pointer"
                        onClick={() => {
                          setFormData(prev => ({ ...prev, departmentId: dept.id }));
                          setDepartmentSearch('');
                          setShowDepartmentResults(false);
                        }}
                      >
                        {dept.name}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Manager Search */}
            <div>
              <label htmlFor="hiringManagerId" className="block text-sm font-medium text-gray-700">
                Hiring Manager
              </label>
              <div className="relative mt-1">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  value={formData.hiringManagerId ? 
                    departmentManagers.find(m => m.id === formData.hiringManagerId)
                      ? `${departmentManagers.find(m => m.id === formData.hiringManagerId)?.firstName} ${departmentManagers.find(m => m.id === formData.hiringManagerId)?.fatherName}`
                      : ''
                    : managerSearch
                  }
                  onChange={(e) => {
                    setManagerSearch(e.target.value);
                    setFormData(prev => ({ ...prev, hiringManagerId: '' }));
                    setShowManagerResults(true);
                  }}
                  onFocus={() => setShowManagerResults(true)}
                  className="input pl-10"
                  placeholder="Search managers..."
                  required
                  disabled={!formData.departmentId}
                />
                {showManagerResults && formData.departmentId && (
                  <div className="absolute z-10 w-full mt-1 bg-white shadow-lg max-h-60 rounded-none border border-gray-200 overflow-auto">
                    {filteredManagers.map(manager => (
                      <div
                        key={manager.id}
                        className="px-4 py-2 hover:bg-gray-50 cursor-pointer"
                        onClick={() => {
                          setFormData(prev => ({ ...prev, hiringManagerId: manager.id }));
                          setManagerSearch('');
                          setShowManagerResults(false);
                        }}
                      >
                        {manager.firstName} {manager.fatherName}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div>
            <label htmlFor="position" className="block text-sm font-medium text-gray-700">
              Position Title
            </label>
            <input
              type="text"
              id="position"
              value={formData.position}
              onChange={(e) => setFormData(prev => ({ ...prev, position: e.target.value }))}
              className="input mt-1"
              required
            />
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
            <div>
              <label htmlFor="count" className="block text-sm font-medium text-gray-700">
                Number of Positions
              </label>
              <input
                type="number"
                id="count"
                value={formData.count}
                onChange={(e) => setFormData(prev => ({ ...prev, count: parseInt(e.target.value) }))}
                className="input mt-1"
                min="1"
                required
              />
            </div>

            <div>
              <label htmlFor="budgetMin" className="block text-sm font-medium text-gray-700">
                Budget Range (Min)
              </label>
              <input
                type="number"
                id="budgetMin"
                value={formData.budget.min}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  budget: { ...prev.budget, min: Number(e.target.value) }
                }))}
                className="input mt-1"
                min="0"
                required
              />
            </div>

            <div>
              <label htmlFor="budgetMax" className="block text-sm font-medium text-gray-700">
                Budget Range (Max)
              </label>
              <input
                type="number"
                id="budgetMax"
                value={formData.budget.max}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  budget: { ...prev.budget, max: Number(e.target.value) }
                }))}
                className="input mt-1"
                min="0"
                required
              />
            </div>
          </div>

          <div>
            <label htmlFor="justification" className="block text-sm font-medium text-gray-700">
              Business Justification
            </label>
            <textarea
              id="justification"
              value={formData.justification}
              onChange={(e) => setFormData(prev => ({ ...prev, justification: e.target.value }))}
              className="input mt-1"
              rows={4}
              required
            />
          </div>

          <div>
            <label htmlFor="jobDescription" className="block text-sm font-medium text-gray-700">
              Job Description
            </label>
            <textarea
              id="jobDescription"
              value={formData.jobDescription}
              onChange={(e) => setFormData(prev => ({ ...prev, jobDescription: e.target.value }))}
              className="input mt-1"
              rows={4}
              required
            />
          </div>

          <div>
            <label htmlFor="requirements" className="block text-sm font-medium text-gray-700">
              Requirements
            </label>
            <textarea
              id="requirements"
              value={formData.requirements}
              onChange={(e) => setFormData(prev => ({ ...prev, requirements: e.target.value }))}
              className="input mt-1"
              rows={4}
              required
            />
          </div>

          <div>
            <label htmlFor="qualifications" className="block text-sm font-medium text-gray-700">
              Qualifications
            </label>
            <textarea
              id="qualifications"
              value={formData.qualifications}
              onChange={(e) => setFormData(prev => ({ ...prev, qualifications: e.target.value }))}
              className="input mt-1"
              rows={4}
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
              {loading ? 'Submitting...' : 'Submit Request'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default HeadcountRequestForm;