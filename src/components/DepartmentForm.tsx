import React, { useState } from 'react';
import { Department } from '../lib/firebase/departments';

interface DepartmentFormProps {
  initialData?: Partial<Department>;
  onSubmit: (data: Omit<Department, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  onCancel: () => void;
}

const DepartmentForm: React.FC<DepartmentFormProps> = ({ initialData, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    departmentId: initialData?.departmentId || '',
    name: initialData?.name || '',
    head: initialData?.head || '',
    employees: initialData?.employees || 0,
    openPositions: initialData?.openPositions || 0,
    budget: initialData?.budget || '',
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
        <label htmlFor="departmentId" className="block text-sm font-medium text-gray-700">
          Department ID
        </label>
        <input
          type="text"
          id="departmentId"
          value={formData.departmentId}
          className="input mt-1 bg-gray-100"
          disabled
          placeholder="Automatically generated"
        />
      </div>

      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700">
          Department Name
        </label>
        <input
          type="text"
          id="name"
          value={formData.name}
          onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
          className="input mt-1 bg-white"
        />
      </div>

      <div>
        <label htmlFor="head" className="block text-sm font-medium text-gray-700">
          Department Head
        </label>
        <input
          type="text"
          id="head"
          value={formData.head}
          onChange={(e) => setFormData(prev => ({ ...prev, head: e.target.value }))}
          className="input mt-1 bg-white"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="employees" className="block text-sm font-medium text-gray-700">
            Number of Employees
          </label>
          <input
            type="number"
            id="employees"
            value={formData.employees}
            onChange={(e) => setFormData(prev => ({ ...prev, employees: parseInt(e.target.value) }))}
            className="input mt-1 bg-white"
            min="0"
          />
        </div>

        <div>
          <label htmlFor="openPositions" className="block text-sm font-medium text-gray-700">
            Open Positions
          </label>
          <input
            type="number"
            id="openPositions"
            value={formData.openPositions}
            onChange={(e) => setFormData(prev => ({ ...prev, openPositions: parseInt(e.target.value) }))}
            className="input mt-1 bg-white"
            min="0"
          />
        </div>
      </div>

      <div>
        <label htmlFor="budget" className="block text-sm font-medium text-gray-700">
          Annual Budget
        </label>
        <input
          type="text"
          id="budget"
          value={formData.budget}
          onChange={(e) => setFormData(prev => ({ ...prev, budget: e.target.value }))}
          className="input mt-1 bg-white"
          placeholder="e.g., 4.2M ETB"
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
          {loading ? 'Saving...' : initialData ? 'Update Department' : 'Add Department'}
        </button>
      </div>
    </form>
  );
};

export default DepartmentForm;