import React, { useState, useEffect } from 'react';
import { TrendingUp, Search } from 'lucide-react';
import { PromotionRequest } from '../../lib/firebase/promotions';
import { Department } from '../../lib/firebase/departments';
import { Employee } from '../../lib/firebase/employees';
import { ReviewCycle, Review, getReviews } from '../../lib/firebase/reviews';

interface PromotionRequestModalProps {
  departments: Department[];
  employees: Employee[];
  reviewCycles: ReviewCycle[];
  onSubmit: (data: Omit<PromotionRequest, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  onClose: () => void;
}

const PromotionRequestModal: React.FC<PromotionRequestModalProps> = ({
  departments,
  employees,
  reviewCycles,
  onSubmit,
  onClose,
}) => {
  const [formData, setFormData] = useState({
    employeeId: '',
    departmentId: '',
    currentPosition: '',
    proposedPosition: '',
    reviewCycleId: '',
    reason: '',
    effectiveDate: '',
  });

  const [employeeSearch, setEmployeeSearch] = useState('');
  const [showEmployeeResults, setShowEmployeeResults] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [employeeReviews, setEmployeeReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Filter employees based on search
  const filteredEmployees = employeeSearch.trim()
    ? employees.filter(employee => {
        const fullName = `${employee.firstName || ''} ${employee.fatherName || ''}`.toLowerCase();
        return fullName.includes(employeeSearch.toLowerCase());
      })
    : employees;

  // Load employee reviews when employee is selected
  useEffect(() => {
    if (selectedEmployee?.id && formData.reviewCycleId) {
      loadEmployeeReviews();
    }
  }, [selectedEmployee?.id, formData.reviewCycleId]);

  const loadEmployeeReviews = async () => {
    try {
      const reviews = await getReviews(formData.reviewCycleId, selectedEmployee?.id);
      setEmployeeReviews(reviews);
    } catch (err) {
      setError('Failed to load employee reviews');
    }
  };

  const handleEmployeeSelect = (employee: Employee) => {
    setSelectedEmployee(employee);
    setFormData(prev => ({
      ...prev,
      employeeId: employee.id || '',
      departmentId: employee.departmentId || '',
      currentPosition: employee.jobTitle || ''
    }));
    setEmployeeSearch('');
    setShowEmployeeResults(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Get average review score
      const reviewScore = employeeReviews.length
        ? employeeReviews.reduce((sum, review) => sum + (review.rating || 0), 0) / employeeReviews.length
        : undefined;

      await onSubmit({
        ...formData,
        status: 'Pending',
        reviewScore,
        effectiveDate: new Date(formData.effectiveDate),
      } as PromotionRequest);
      
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit request');
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-none shadow-lg max-w-xl w-full mx-4">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center">
            <TrendingUp className="h-6 w-6 text-brand-600 mr-2" />
            <h2 className="text-lg font-medium text-gray-900">Request Promotion</h2>
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
          {/* Employee Search */}
          <div>
            <label htmlFor="employeeSearch" className="block text-sm font-medium text-gray-700">
              Employee
            </label>
            <div className="relative mt-1">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                id="employeeSearch"
                value={selectedEmployee ? `${selectedEmployee.firstName} ${selectedEmployee.fatherName}` : employeeSearch}
                onChange={(e) => {
                  setEmployeeSearch(e.target.value);
                  setSelectedEmployee(null);
                  setShowEmployeeResults(true);
                }}
                className="input pl-10"
                placeholder="Search employee..."
                required
              />
              {showEmployeeResults && filteredEmployees.length > 0 && (
                <div className="absolute z-10 w-full mt-1 bg-white shadow-lg max-h-60 rounded-none border border-gray-200 overflow-auto">
                  {filteredEmployees.map(employee => (
                    <div
                      key={employee.id}
                      className="px-4 py-2 hover:bg-gray-50 cursor-pointer"
                      onClick={() => handleEmployeeSelect(employee)}
                    >
                      {employee.firstName} {employee.fatherName}
                      <div className="text-sm text-gray-500">{employee.jobTitle}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {selectedEmployee && (
            <>
              <div>
                <label htmlFor="department" className="block text-sm font-medium text-gray-700">
                  Department
                </label>
                <input
                  type="text"
                  id="department"
                  value={departments.find(d => d.id === formData.departmentId)?.name || ''}
                  className="input mt-1 bg-gray-100"
                  disabled
                />
              </div>

              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div>
                  <label htmlFor="currentPosition" className="block text-sm font-medium text-gray-700">
                    Current Position
                  </label>
                  <input
                    type="text"
                    id="currentPosition"
                    value={formData.currentPosition}
                    className="input mt-1 bg-gray-100"
                    disabled
                  />
                </div>

                <div>
                  <label htmlFor="proposedPosition" className="block text-sm font-medium text-gray-700">
                    Proposed Position
                  </label>
                  <input
                    type="text"
                    id="proposedPosition"
                    value={formData.proposedPosition}
                    onChange={(e) => setFormData(prev => ({ ...prev, proposedPosition: e.target.value }))}
                    className="input mt-1"
                    required
                  />
                </div>
              </div>

              <div>
                <label htmlFor="reviewCycleId" className="block text-sm font-medium text-gray-700">
                  Review Cycle
                </label>
                <select
                  id="reviewCycleId"
                  value={formData.reviewCycleId}
                  onChange={(e) => setFormData(prev => ({ ...prev, reviewCycleId: e.target.value }))}
                  className="input mt-1"
                  required
                >
                  <option value="">Select review cycle...</option>
                  {reviewCycles
                    .filter(cycle => cycle.status === 'Completed')
                    .map(cycle => (
                      <option key={cycle.id} value={cycle.id}>
                        {cycle.name}
                      </option>
                    ))
                  }
                </select>
              </div>

              {employeeReviews.length > 0 && (
                <div className="bg-gray-50 p-4">
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Review Summary</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Average Rating</span>
                      <span className="font-medium text-gray-900">
                        {(employeeReviews.reduce((sum, review) => sum + (review.rating || 0), 0) / employeeReviews.length).toFixed(1)}/5
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Reviews Completed</span>
                      <span className="font-medium text-gray-900">{employeeReviews.length}</span>
                    </div>
                  </div>
                </div>
              )}

              <div>
                <label htmlFor="reason" className="block text-sm font-medium text-gray-700">
                  Promotion Justification
                </label>
                <textarea
                  id="reason"
                  value={formData.reason}
                  onChange={(e) => setFormData(prev => ({ ...prev, reason: e.target.value }))}
                  className="input mt-1"
                  rows={4}
                  required
                />
              </div>

              <div>
                <label htmlFor="effectiveDate" className="block text-sm font-medium text-gray-700">
                  Effective Date
                </label>
                <input
                  type="date"
                  id="effectiveDate"
                  value={formData.effectiveDate}
                  onChange={(e) => setFormData(prev => ({ ...prev, effectiveDate: e.target.value }))}
                  className="input mt-1"
                  min={new Date().toISOString().split('T')[0]}
                  required
                />
              </div>
            </>
          )}

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
              disabled={loading || !selectedEmployee}
            >
              {loading ? 'Submitting...' : 'Submit Request'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PromotionRequestModal;