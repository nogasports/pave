import React, { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';
import { Attendance } from '../../lib/firebase/workManagement';
import { Shift } from '../../lib/firebase/workManagement';
import { Employee } from '../../lib/firebase/employees';

interface AttendanceClockModalProps {
  type: 'in' | 'out';
  employee: Employee;
  shifts: Shift[];
  onSubmit: (data: Omit<Attendance, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  onClose: () => void;
}

const AttendanceClockModal: React.FC<AttendanceClockModalProps> = ({
  type,
  employee,
  shifts,
  onSubmit,
  onClose,
}) => {
  const [selectedShift, setSelectedShift] = useState<Shift | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Get current time
  const now = new Date();
  const currentTime = now.toLocaleTimeString('en-US', { 
    hour12: false,
    hour: '2-digit',
    minute: '2-digit'
  });

  // Filter available shifts based on current day and time
  const availableShifts = shifts.filter(shift => {
    const currentDay = now.toLocaleDateString('en-US', { weekday: 'long' });
    return shift.workDays.includes(currentDay) && shift.active;
  });

  // Auto-select shift if there's only one available
  useEffect(() => {
    if (availableShifts.length === 1) {
      setSelectedShift(availableShifts[0]);
    }
  }, [availableShifts]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (!selectedShift) {
        throw new Error('Please select a shift');
      }

      // Check if within allowed time window for clock-in
      if (type === 'in') {
        const shiftStart = new Date(`${now.toISOString().split('T')[0]}T${selectedShift.startTime}`);
        const allowedEarly = new Date(shiftStart.getTime() - (selectedShift.allowedEarlyArrival || 15) * 60000);
        const allowedLate = new Date(shiftStart.getTime() + (selectedShift.allowedLateMinutes || 15) * 60000);

        if (now < allowedEarly || now > allowedLate) {
          throw new Error('Clock-in time is outside the allowed window');
        }
      }

      await onSubmit({
        employeeId: employee.id!,
        shiftId: selectedShift.id!,
        date: now,
        [type === 'in' ? 'checkIn' : 'checkOut']: now,
        status: type === 'in' ? 'Present' : undefined,
      });
      
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to clock ' + type);
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-none shadow-lg max-w-md w-full mx-4">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center">
            <Clock className="h-6 w-6 text-brand-600 mr-2" />
            <h2 className="text-lg font-medium text-gray-900">
              Clock {type === 'in' ? 'In' : 'Out'}
            </h2>
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
            <label htmlFor="currentTime" className="block text-sm font-medium text-gray-700">
              Current Time
            </label>
            <input
              type="text"
              id="currentTime"
              value={currentTime}
              className="input mt-1 bg-gray-100"
              disabled
            />
          </div>

          {availableShifts.length > 0 ? (
            <div>
              <label htmlFor="shift" className="block text-sm font-medium text-gray-700">
                Select Shift
              </label>
              <select
                id="shift"
                value={selectedShift?.id || ''}
                onChange={(e) => {
                  const shift = availableShifts.find(s => s.id === e.target.value);
                  setSelectedShift(shift || null);
                }}
                className="input mt-1"
                required
              >
                <option value="">Select shift...</option>
                {availableShifts.map(shift => (
                  <option key={shift.id} value={shift.id}>
                    {shift.name} ({shift.startTime} - {shift.endTime})
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3">
              No shifts available for clock {type} at this time
            </div>
          )}

          {selectedShift && (
            <div className="bg-gray-50 p-4">
              <h4 className="text-sm font-medium text-gray-900">Shift Details</h4>
              <dl className="mt-2 space-y-1">
                <div className="flex justify-between">
                  <dt className="text-sm text-gray-500">Start Time:</dt>
                  <dd className="text-sm text-gray-900">{selectedShift.startTime}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-sm text-gray-500">End Time:</dt>
                  <dd className="text-sm text-gray-900">{selectedShift.endTime}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-sm text-gray-500">Break Duration:</dt>
                  <dd className="text-sm text-gray-900">{selectedShift.breakDuration} minutes</dd>
                </div>
              </dl>
            </div>
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
              disabled={loading || !selectedShift}
            >
              {loading ? 'Processing...' : `Clock ${type === 'in' ? 'In' : 'Out'}`}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export { AttendanceClockModal };