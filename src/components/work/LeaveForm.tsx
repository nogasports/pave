import React, { useState, useEffect } from 'react';
import { Leave } from '../../lib/firebase/workManagement';
import { LeaveType } from '../../lib/firebase/leaveTypes';
import { Employee, getEmployees } from '../../lib/firebase/employees';
import { calculateWorkingDays, formatDate, parseDate } from '../../lib/utils/dateUtils';

interface LeaveFormProps {
  initialData?: Partial<Leave>;
  leaveTypes: LeaveType[];
  onSubmit: (data: Omit<Leave, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  onCancel: () => void;
}

const LeaveForm: React.FC<LeaveFormProps> = ({ initialData, leaveTypes, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    employeeId: initialData?.employeeId || '',
    employeeName: '',
    leaveType: initialData?.leaveType || 'Annual',
    startDate: initialData?.startDate ? formatDate(initialData.startDate) : '',
    endDate: initialData?.endDate ? formatDate(initialData.endDate) : '',
    duration: initialData?.duration || 1,
    reason: initialData?.reason || '',
    status: initialData?.status || 'Pending',
  });

  const [employees, setEmployees] = useState<Employee[]>([]);
  const [employeeSearch, setEmployeeSearch] = useState('');
  const [showEmployeeResults, setShowEmployeeResults] = useState(false);
  const [selectedLeaveType, setSelectedLeaveType] = useState<LeaveType | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadEmployees();
  }, []);

  useEffect(() => {
    const leaveType = leaveTypes.find(lt => lt.name === formData.leaveType);
    setSelectedLeaveType(leaveType || null);
  }, [formData.leaveType, leaveTypes]);

  const loadEmployees = async () => {
    try {
      const data = await getEmployees();
      setEmployees(data);
      
      // Set initial employee name if editing
      if (initialData?.employeeId) {
        const employee = data.find(e => e.id === initialData.employeeId);
        if (employee) {
          setFormData(prev => ({
            ...prev,
            employeeName: `${employee.firstName || ''} ${employee.fatherName || ''}`.trim()
          }));
        }
      }
    } catch (err) {
      setError('Failed to load employees');
    }
  };

  const filteredEmployees = employeeSearch.trim()
    ? employees.filter(employee => {
        const fullName = `${employee.firstName || ''} ${employee.fatherName || ''}`.toLowerCase();
        return fullName.includes(employeeSearch.toLowerCase());
      })
    : [];

  // Automatically calculate working days when dates change
  useEffect(() => {
    const updateDuration = async () => {
      if (formData.startDate && formData.endDate) {
        try {
          const start = new Date(formData.startDate);
          const end = new Date(formData.endDate);
          if (start <= end) {
            const days = await calculateWorkingDays(start, end);
            setFormData(prev => ({ ...prev, duration: days }));
          }
        } catch (err) {
          console.error('Error calculating duration:', err);
        }
      }
    };
    updateDuration();
  }, [formData.startDate, formData.endDate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    // Add feedback for approval/rejection
    const feedback = formData.status === 'Approved' ? 
      { approverComment: 'Leave request approved' } :
      formData.status === 'Rejected' ? 
      { approverComment: 'Leave request rejected' } : {};

    try {
      if (!selectedLeaveType) {
        throw new Error('Please select a valid leave type');
      }

      await onSubmit({
        ...formData,
        ...feedback,
        startDate: new Date(formData.startDate),
        endDate: new Date(formData.endDate),
        leaveTypeId: selectedLeaveType.id,
      } as Leave);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  // Calculate remaining days based on leave type and employee's history
  const calculateRemainingDays = () => {
    if (!selectedLeaveType) return null;
    return selectedLeaveType.daysPerYear; // This should be enhanced with actual leave balance calculation
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3">
          {error}
        </div>
      )}

      <div className="relative">
        <label htmlFor="employeeSearch" className="block text-sm font-medium text-gray-700">
          Employee
        </label>
        <div className="relative">
          <input
            type="text"
            id="employeeSearch"
            value={formData.employeeName || employeeSearch}
            onChange={(e) => {
              setEmployeeSearch(e.target.value);
              setShowEmployeeResults(true);
            }}
            onFocus={() => {
              if (formData.employeeName) {
                setEmployeeSearch(formData.employeeName);
                setFormData(prev => ({ ...prev, employeeName: '' }));
              }
              setShowEmployeeResults(true);
            }}
            className="input mt-1"
            placeholder="Search employee..."
            required
          />
          {showEmployeeResults && filteredEmployees.length > 0 && (
            <div className="absolute z-10 w-full bg-white mt-1 border border-gray-200 rounded-none shadow-lg">
              {filteredEmployees.map(employee => (
                <div
                  key={employee.id}
                  className="px-4 py-2 hover:bg-gray-50 cursor-pointer"
                  onClick={() => {
                    setFormData(prev => ({
                      ...prev,
                      employeeId: employee.id || '',
                      employeeName: `${employee.firstName || ''} ${employee.fatherName || ''}`.trim()
                    }));
                    setEmployeeSearch('');
                    setShowEmployeeResults(false);
                  }}
                >
                  {`${employee.firstName || ''} ${employee.fatherName || ''}`.trim()}
                </div>
              ))}
            </div>
          )}
          {showEmployeeResults && employeeSearch && filteredEmployees.length === 0 && (
            <div className="absolute z-10 w-full bg-white mt-1 border border-gray-200 rounded-none shadow-lg">
              <div className="px-4 py-2 text-gray-500">No employees found</div>
            </div>
          )}
        </div>
      </div>

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
                {type.name} ({calculateRemainingDays()} days remaining)
              </option>
            ))
          }
        </select>
      </div>

      <div>
        <label htmlFor="startDate" className="block text-sm font-medium text-gray-700">
          Start Date
        </label>
        <input
          type="date"
          id="startDate"
          value={formData.startDate}
          onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
          className="input mt-1"
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
          onChange={(e) => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
          className="input mt-1"
          required
        />
      </div>

      <div>
        <label htmlFor="duration" className="block text-sm font-medium text-gray-700">
          Duration (days)
        </label>
        <input
          type="number"
          id="duration"
          value={formData.duration}
          className="input mt-1"
          min="1"
          disabled
          required
        />
        <p className="mt-1 text-sm text-gray-500">
          Automatically calculated excluding weekends and holidays
        </p>
      </div>

      <div>
        <label htmlFor="status" className="block text-sm font-medium text-gray-700">
          Status
        </label>
        <select
          id="status"
          value={formData.status}
          onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as Leave['status'] }))}
          className="input mt-1"
          required
        >
          <option value="Pending">Pending</option>
          <option value="Approved">Approved</option>
          <option value="Rejected">Rejected</option>
        </select>
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
        />
      </div>

      {selectedLeaveType && (
        <div className="bg-gray-50 p-4 rounded-none">
          <h4 className="text-sm font-medium text-gray-900">Leave Type Details</h4>
          <div className="mt-2 text-sm text-gray-500">
            <p>Maximum days per year: {selectedLeaveType.daysPerYear}</p>
            <p>Carry forward: {selectedLeaveType.carryForward ? 'Yes' : 'No'}</p>
            {selectedLeaveType.minServiceDays > 0 && <p>Minimum service required: {selectedLeaveType.minServiceDays} days</p>}
          </div>
        </div>
      )}

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
          {loading ? 'Saving...' : initialData ? 'Update Leave' : 'Submit Leave Request'}
        </button>
      </div>
    </form>
  );
};

export default LeaveForm;