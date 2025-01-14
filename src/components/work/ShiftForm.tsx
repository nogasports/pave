import React, { useState } from 'react';
import { Shift } from '../../lib/firebase/workManagement';

interface ShiftFormProps {
  initialData?: Partial<Shift>;
  departments: Department[];
  employees: Employee[];
  onSubmit: (data: Omit<Shift, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  onCancel: () => void;
}

const ShiftForm: React.FC<ShiftFormProps> = ({ 
  initialData, 
  departments,
  employees,
  onSubmit, 
  onCancel 
}) => {
  const [formData, setFormData] = useState({
    code: initialData?.code || '',
    name: initialData?.name || '',
    type: initialData?.type || 'Regular',
    departmentId: initialData?.departmentId || '',
    assignedEmployees: initialData?.assignedEmployees || [],
    startTime: initialData?.startTime || '',
    endTime: initialData?.endTime || '',
    breakDuration: initialData?.breakDuration ?? 60,
    workDays: initialData?.workDays || [],
    allowedLateMinutes: initialData?.allowedLateMinutes ?? 15,
    allowedEarlyDeparture: initialData?.allowedEarlyDeparture ?? 15,
    description: initialData?.description || '',
    active: initialData?.active ?? true,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const weekDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Generate shift code if not provided
      if (!formData.code) {
        const shiftCode = `SH${Math.random().toString(36).substr(2, 5).toUpperCase()}`;
        setFormData(prev => ({ ...prev, code: shiftCode }));
      }

      await onSubmit(formData as Omit<Shift, 'id' | 'createdAt' | 'updatedAt'>);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const toggleWorkDay = (day: string) => {
    setFormData(prev => ({
      ...prev,
      workDays: prev.workDays.includes(day)
        ? prev.workDays.filter(d => d !== day)
        : [...prev.workDays, day]
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700">
            Shift Name
          </label>
          <input
            type="text"
            id="name"
            value={formData.name}
            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            className="input mt-1"
            required
          />
        </div>

        <div>
          <label htmlFor="code" className="block text-sm font-medium text-gray-700">
            Shift Code
          </label>
          <input
            type="text"
            id="code"
            value={formData.code}
            onChange={(e) => setFormData(prev => ({ ...prev, code: e.target.value }))}
            className="input mt-1 bg-gray-100"
            placeholder="Auto-generated if empty"
            disabled
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
        <div>
          <label htmlFor="startTime" className="block text-sm font-medium text-gray-700">
            Start Time
          </label>
          <input
            type="time"
            id="startTime"
            value={formData.startTime}
            onChange={(e) => setFormData(prev => ({ ...prev, startTime: e.target.value }))}
            className="input mt-1"
            required
          />
        </div>

        <div>
          <label htmlFor="endTime" className="block text-sm font-medium text-gray-700">
            End Time
          </label>
          <input
            type="time"
            id="endTime"
            value={formData.endTime}
            onChange={(e) => setFormData(prev => ({ ...prev, endTime: e.target.value }))}
            className="input mt-1"
            required
          />
        </div>

        <div>
          <label htmlFor="breakDuration" className="block text-sm font-medium text-gray-700">
            Break Duration (minutes)
          </label>
          <input
            type="number"
            id="breakDuration"
            value={formData.breakDuration}
            onChange={(e) => setFormData(prev => ({ ...prev, breakDuration: parseInt(e.target.value) }))}
            className="input mt-1"
            min="0"
            step="15"
            required
          />
        </div>
      </div>

      <div>
        <label htmlFor="type" className="block text-sm font-medium text-gray-700">
          Shift Type
        </label>
        <select
          id="type"
          value={formData.type}
          onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value as Shift['type'] }))}
          className="input mt-1"
          required
        >
          <option value="Regular">Regular</option>
          <option value="Night">Night</option>
          <option value="Flexible">Flexible</option>
        </select>
      </div>
      
      <div>
        <label htmlFor="departmentId" className="block text-sm font-medium text-gray-700">
          Assign to Department
        </label>
        <select
          id="departmentId"
          value={formData.departmentId}
          onChange={(e) => setFormData(prev => ({ ...prev, departmentId: e.target.value }))}
          className="input mt-1"
        >
          <option value="">All Departments</option>
          {departments.map(dept => (
            <option key={dept.id} value={dept.id}>{dept.name}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Assign to Specific Employees
        </label>
        <div className="mt-2 space-y-2">
          {employees
            .filter(emp => !formData.departmentId || emp.departmentId === formData.departmentId)
            .map(employee => (
              <label key={employee.id} className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.assignedEmployees.includes(employee.id || '')}
                  onChange={(e) => {
                    const id = employee.id || '';
                    setFormData(prev => ({
                      ...prev,
                      assignedEmployees: e.target.checked
                        ? [...prev.assignedEmployees, id]
                        : prev.assignedEmployees.filter(empId => empId !== id)
                    }));
                  }}
                  className="rounded-none border-gray-300 text-brand-600 focus:ring-brand-600"
                />
                <span className="ml-2 text-sm text-gray-700">
                  {`${employee.firstName || ''} ${employee.fatherName || ''}`.trim()}
                </span>
              </label>
            ))}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div>
          <label htmlFor="allowedLateMinutes" className="block text-sm font-medium text-gray-700">
            Allowed Late Minutes
          </label>
          <input
            type="number"
            id="allowedLateMinutes"
            value={formData.allowedLateMinutes}
            onChange={(e) => setFormData(prev => ({ ...prev, allowedLateMinutes: parseInt(e.target.value) }))}
            className="input mt-1"
            min="0"
          />
        </div>

        <div>
          <label htmlFor="allowedEarlyDeparture" className="block text-sm font-medium text-gray-700">
            Allowed Early Departure (minutes)
          </label>
          <input
            type="number"
            id="allowedEarlyDeparture"
            value={formData.allowedEarlyDeparture}
            onChange={(e) => setFormData(prev => ({ ...prev, allowedEarlyDeparture: parseInt(e.target.value) }))}
            className="input mt-1"
            min="0"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Work Days
        </label>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {weekDays.map(day => (
            <label key={day} className="inline-flex items-center">
              <input
                type="checkbox"
                checked={formData.workDays.includes(day)}
                onChange={() => toggleWorkDay(day)}
                className="rounded-none border-gray-300 text-brand-600 focus:ring-brand-600"
              />
              <span className="ml-2 text-sm text-gray-700">{day}</span>
            </label>
          ))}
        </div>
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700">
          Description
        </label>
        <textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
          className="input mt-1"
          rows={3}
        />
      </div>

      <div className="flex items-center">
        <input
          type="checkbox"
          id="active"
          checked={formData.active}
          onChange={(e) => setFormData(prev => ({ ...prev, active: e.target.checked }))}
          className="rounded-none border-gray-300 text-brand-600 focus:ring-brand-600"
        />
        <label htmlFor="active" className="ml-2 text-sm text-gray-700">
          Active
        </label>
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
          {loading ? 'Saving...' : initialData ? 'Update Shift' : 'Add Shift'}
        </button>
      </div>
    </form>
  );
};

export default ShiftForm;