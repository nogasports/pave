import React, { useState } from 'react';
import { Calendar } from 'lucide-react';
import { Leave } from '../../lib/firebase/workManagement';
import { LeaveType } from '../../lib/firebase/leaveTypes';
import { Employee } from '../../lib/firebase/employees';
import { calculateWorkingDays } from '../../lib/utils/dateUtils';

interface LeaveRequestModalProps {
  employee: Employee;
  leaveTypes: LeaveType[];
  onSubmit: (data: Omit<Leave, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  onClose: () => void;
}

const LeaveRequestModal: React.FC<LeaveRequestModalProps> = ({
  employee,
  leaveTypes,
  onSubmit,
  onClose,
}) => {
  const [formData, setFormData] = useState({
    leaveType: '',
    startDate: '',
    endDate: '',
    reason: '',
    duration: 0,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Update duration when dates change
  const updateDuration = async () => {
    if (formData.startDate && formData.endDate) {
      const start = new Date(formData.startDate);
      const end = new Date(formData.endDate);
      if (start <= end) {
        const days = await calculateWorkingDays(start, end);
        setFormData(prev => ({ ...prev, duration: days }));
      }
    }
  };

  // Handle date changes
  const handleDateChange = async (field: 'startDate' | 'endDate', value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    await updateDuration();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (!formData.leaveType) {
        throw new Error('Please select a leave type');
      }

      const leaveType = leaveTypes.find(lt => lt.name === formData.leaveType);
      if (!leaveType) {
        throw new Error('Invalid leave type');
      }

      await onSubmit({
        employeeId: employee.id!,
        leaveType: formData.leaveType,
        startDate: new Date(formData.startDate),
        endDate: new Date(formData.endDate),
        duration: formData.duration,
        reason: formData.reason,
        status: 'Pending',
      });
      
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit request');
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-none shadow-lg max-w-md w-full mx-4">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center">
            <Calendar className="h-6 w-6 text-brand-600 mr-2" />
            <h2 className="text-lg font-medium text-gray-900">Request Leave</h2>
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
          <div>
            <label htmlFor="leaveType" className="block text-sm font-medium text-gray-700">
              Leave Type
            </label>
            <select
              id="leaveType"
              value={formData.leaveType}
              onChange={(e) => setFormData(prev => ({ ...prev, leaveType: e.target.value }))}
              className="input mt-1"
              required
            >
              <option value="">Select leave type...</option>
              {leaveTypes
                .filter(lt => lt.active)
                .map(type => (
                  <option key={type.id} value={type.name}>
                    {type.name} ({type.daysPerYear} days/year)
                  </option>
                ))
              }
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="startDate" className="block text-sm font-medium text-gray-700">
                Start Date
              </label>
              <input
                type="date"
                id="startDate"
                value={formData.startDate}
                onChange={(e) => handleDateChange('startDate', e.target.value)}
                className="input mt-1"
                min={new Date().toISOString().split('T')[0]}
                required
              />
            </div>

            <div>
              <label htmlFor="endDate" className="block text-sm font-medium text-gray-700">
                End Date
              </label>
              <input
                type="date"
                id="endDate"
                value={formData.endDate}
                onChange={(e) => handleDateChange('endDate', e.target.value)}
                className="input mt-1"
                min={formData.startDate || new Date().toISOString().split('T')[0]}
                required
              />
            </div>
          </div>

          <div>
            <label htmlFor="duration" className="block text-sm font-medium text-gray-700">
              Duration (Working Days)
            </label>
            <input
              type="number"
              id="duration"
              value={formData.duration}
              className="input mt-1 bg-gray-100"
              disabled
            />
          </div>

          <div>
            <label htmlFor="reason" className="block text-sm font-medium text-gray-700">
              Reason
            </label>
            <textarea
              id="reason"
              value={formData.reason}
              onChange={(e) => setFormData(prev => ({ ...prev, reason: e.target.value }))}
              className="input mt-1"
              rows={3}
              required
            />
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
              {loading ? 'Submitting...' : 'Submit Request'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export { LeaveRequestModal };