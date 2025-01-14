import React, { useState } from 'react';
import { Attendance } from '../../lib/firebase/workManagement';
import { Shift } from '../../lib/firebase/workManagement';
import { Employee } from '../../lib/firebase/employees';

interface AttendanceFormProps {
  initialData?: Partial<Attendance>;
  shifts: Shift[];
  employees: Employee[];
  onSubmit: (data: Omit<Attendance, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  onCancel: () => void;
}

import { formatDate } from '../../lib/utils/dateUtils';

const AttendanceForm: React.FC<AttendanceFormProps> = ({
  initialData,
  shifts,
  employees,
  onSubmit,
  onCancel,
}) => {
  const [formData, setFormData] = useState({
    employeeId: initialData?.employeeId || '',
    shiftId: initialData?.shiftId || '',
    date: initialData?.date ? formatDate(initialData.date) : formatDate(new Date()),
    checkIn: initialData?.checkIn ? new Date(initialData.checkIn).toLocaleTimeString('en-US', { hour12: false }) : '',
    checkOut: initialData?.checkOut ? new Date(initialData.checkOut).toLocaleTimeString('en-US', { hour12: false }) : '',
    status: initialData?.status || 'Present',
    notes: initialData?.notes || '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [employeeSearch, setEmployeeSearch] = useState('');
  const [showEmployeeResults, setShowEmployeeResults] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);

  // Filter employees based on search
  const filteredEmployees = employeeSearch.trim()
    ? employees.filter(emp => {
        const fullName = `${emp.firstName || ''} ${emp.fatherName || ''}`.toLowerCase();
        return fullName.includes(employeeSearch.toLowerCase()) ||
               emp.workEmail?.toLowerCase().includes(employeeSearch.toLowerCase()) ||
               emp.staffId?.toLowerCase().includes(employeeSearch.toLowerCase());
      })
    : employees;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (!selectedEmployee) {
        throw new Error('Please select an employee');
      }

      const data = {
        ...formData,
        employeeId: selectedEmployee.id!,
        date: new Date(formData.date),
        checkIn: formData.checkIn ? new Date(`${formData.date}T${formData.checkIn}`) : undefined,
        checkOut: formData.checkOut ? new Date(`${formData.date}T${formData.checkOut}`) : undefined,
      };

      // Calculate work hours if both check-in and check-out are provided
      if (data.checkIn && data.checkOut) {
        const shift = shifts.find(s => s.id === formData.shiftId);
        if (shift) {
          const workHours = (data.checkOut.getTime() - data.checkIn.getTime()) / (1000 * 60 * 60);
          data.totalWorkHours = Math.round(workHours * 100) / 100;

          // Calculate late minutes
          const shiftStart = new Date(`${formData.date}T${shift.startTime}`);
          if (data.checkIn > shiftStart) {
            const lateMinutes = (data.checkIn.getTime() - shiftStart.getTime()) / (1000 * 60);
            if (lateMinutes > (shift.allowedLateMinutes || 0)) {
              data.lateMinutes = Math.round(lateMinutes);
              data.status = 'Late';
            }
          }

          // Calculate early departure
          const shiftEnd = new Date(`${formData.date}T${shift.endTime}`);
          if (data.checkOut < shiftEnd) {
            const earlyMinutes = (shiftEnd.getTime() - data.checkOut.getTime()) / (1000 * 60);
            if (earlyMinutes > (shift.allowedEarlyDeparture || 0)) {
              data.earlyMinutes = Math.round(earlyMinutes);
              data.status = 'Early-Departure';
            }
          }
        }
      }

      await onSubmit(data as Attendance);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3">
          {error}
        </div>
      )}

      <div>
        <label htmlFor="employeeSearch" className="block text-sm font-medium text-gray-700">
          Employee
        </label>
        <div className="relative">
          <input
            type="text"
            id="employeeSearch"
            value={selectedEmployee ? `${selectedEmployee.firstName} ${selectedEmployee.fatherName}` : employeeSearch}
            onChange={(e) => {
              setEmployeeSearch(e.target.value);
              setSelectedEmployee(null);
              setShowEmployeeResults(true);
            }}
            onFocus={() => {
              if (selectedEmployee) {
                setEmployeeSearch(`${selectedEmployee.firstName} ${selectedEmployee.fatherName}`);
                setSelectedEmployee(null);
              }
              setShowEmployeeResults(true);
            }}
            className="input mt-1"
            placeholder="Search employee..."
            required
          />
          {showEmployeeResults && filteredEmployees.length > 0 && (
            <div className="absolute z-10 w-full bg-white mt-1 border border-gray-200 rounded-lg shadow-lg">
              {filteredEmployees.map(employee => (
                <div
                  key={employee.id}
                  className="px-4 py-2 hover:bg-gray-50 cursor-pointer"
                  onClick={() => {
                    setSelectedEmployee(employee);
                    setEmployeeSearch('');
                    setShowEmployeeResults(false);
                  }}
                >
                  <div className="text-sm font-medium text-gray-900">
                    {employee.firstName} {employee.fatherName}
                  </div>
                  <div className="text-sm text-gray-500">
                    {employee.workEmail || employee.staffId}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div>
          <label htmlFor="shiftId" className="block text-sm font-medium text-gray-700">
            Shift
          </label>
          <select
            id="shiftId"
            value={formData.shiftId}
            onChange={(e) => setFormData(prev => ({ ...prev, shiftId: e.target.value }))}
            className="input mt-1"
            required
          >
            <option value="">Select shift...</option>
            {shifts.map(shift => (
              <option key={shift.id} value={shift.id}>
                {shift.name} ({shift.startTime} - {shift.endTime})
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
        <div>
          <label htmlFor="date" className="block text-sm font-medium text-gray-700">
            Date
          </label>
          <input
            type="date"
            id="date"
            value={formData.date}
            onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
            className="input mt-1"
            required
          />
        </div>

        <div>
          <label htmlFor="checkIn" className="block text-sm font-medium text-gray-700">
            Check In Time
          </label>
          <input
            type="time"
            id="checkIn"
            value={formData.checkIn}
            onChange={(e) => setFormData(prev => ({ ...prev, checkIn: e.target.value }))}
            className="input mt-1"
          />
        </div>

        <div>
          <label htmlFor="checkOut" className="block text-sm font-medium text-gray-700">
            Check Out Time
          </label>
          <input
            type="time"
            id="checkOut"
            value={formData.checkOut}
            onChange={(e) => setFormData(prev => ({ ...prev, checkOut: e.target.value }))}
            className="input mt-1"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div>
          <label htmlFor="status" className="block text-sm font-medium text-gray-700">
            Status
          </label>
          <select
            id="status"
            value={formData.status}
            onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as Attendance['status'] }))}
            className="input mt-1"
            required
          >
            <option value="Present">Present</option>
            <option value="Absent">Absent</option>
            <option value="Late">Late</option>
            <option value="Early-Departure">Early Departure</option>
            <option value="Half-Day">Half Day</option>
          </select>
        </div>

        <div>
          <label htmlFor="notes" className="block text-sm font-medium text-gray-700">
            Notes
          </label>
          <textarea
            id="notes"
            value={formData.notes}
            onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
            className="input mt-1"
            rows={1}
          />
        </div>
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
          {loading ? 'Saving...' : initialData ? 'Update Attendance' : 'Add Attendance'}
        </button>
      </div>
    </form>
  );
};

export default AttendanceForm;