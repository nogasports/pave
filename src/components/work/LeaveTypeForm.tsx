import React, { useState } from 'react';
import { LeaveType } from '../../lib/firebase/leaveTypes';

interface LeaveTypeFormProps {
  initialData?: Partial<LeaveType>;
  onSubmit: (data: Omit<LeaveType, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  onCancel: () => void;
}

const LeaveTypeForm: React.FC<LeaveTypeFormProps> = ({ initialData, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    daysPerYear: initialData?.daysPerYear || 0,
    description: initialData?.description || '',
    carryForward: initialData?.carryForward || false,
    maxCarryForwardDays: initialData?.maxCarryForwardDays || 0,
    minServiceDays: initialData?.minServiceDays || 0,
    proRated: initialData?.proRated || false,
    active: initialData?.active ?? true,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await onSubmit(formData);
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
        <label htmlFor="name" className="block text-sm font-medium text-gray-700">
          Leave Type Name
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

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div>
          <label htmlFor="daysPerYear" className="block text-sm font-medium text-gray-700">
            Days Per Year
          </label>
          <input
            type="number"
            id="daysPerYear"
            value={formData.daysPerYear}
            onChange={(e) => setFormData(prev => ({ ...prev, daysPerYear: Number(e.target.value) }))}
            className="input mt-1"
            min="0"
            required
          />
        </div>

        <div>
          <label htmlFor="minServiceDays" className="block text-sm font-medium text-gray-700">
            Minimum Service Days
          </label>
          <input
            type="number"
            id="minServiceDays"
            value={formData.minServiceDays}
            onChange={(e) => setFormData(prev => ({ ...prev, minServiceDays: Number(e.target.value) }))}
            className="input mt-1"
            min="0"
          />
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center">
          <input
            type="checkbox"
            id="carryForward"
            checked={formData.carryForward}
            onChange={(e) => setFormData(prev => ({ ...prev, carryForward: e.target.checked }))}
            className="rounded-none border-gray-300 text-brand-600 focus:ring-brand-600"
          />
          <label htmlFor="carryForward" className="ml-2 text-sm text-gray-700">
            Allow Carry Forward
          </label>
        </div>

        {formData.carryForward && (
          <div>
            <label htmlFor="maxCarryForwardDays" className="block text-sm font-medium text-gray-700">
              Maximum Carry Forward Days
            </label>
            <input
              type="number"
              id="maxCarryForwardDays"
              value={formData.maxCarryForwardDays}
              onChange={(e) => setFormData(prev => ({ ...prev, maxCarryForwardDays: Number(e.target.value) }))}
              className="input mt-1"
              min="0"
            />
          </div>
        )}

        <div className="flex items-center">
          <input
            type="checkbox"
            id="proRated"
            checked={formData.proRated}
            onChange={(e) => setFormData(prev => ({ ...prev, proRated: e.target.checked }))}
            className="rounded-none border-gray-300 text-brand-600 focus:ring-brand-600"
          />
          <label htmlFor="proRated" className="ml-2 text-sm text-gray-700">
            Pro-rated for New Employees
          </label>
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
          {loading ? 'Saving...' : initialData ? 'Update Leave Type' : 'Add Leave Type'}
        </button>
      </div>
    </form>
  );
};

export default LeaveTypeForm;