import React, { useState } from 'react';
import { MedicalReimbursement } from '../../lib/firebase/finance';
import { Employee } from '../../lib/firebase/employees';

interface MedicalReimbursementFormProps {
  initialData?: Partial<MedicalReimbursement>;
  employees: Employee[];
  onSubmit: (data: Omit<MedicalReimbursement, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  onCancel: () => void;
}

const MedicalReimbursementForm: React.FC<MedicalReimbursementFormProps> = ({
  initialData,
  employees,
  onSubmit,
  onCancel,
}) => {
  const [formData, setFormData] = useState({
    employeeId: initialData?.employeeId || '',
    expenseDate: initialData?.expenseDate ? new Date(initialData.expenseDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
    amount: initialData?.amount || 0,
    description: initialData?.description || '',
    receiptUrl: initialData?.receiptUrl || '',
    status: initialData?.status || 'Pending',
    notes: initialData?.notes || '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (!formData.employeeId) {
        throw new Error('Please select an employee');
      }

      await onSubmit({
        ...formData,
        expenseDate: new Date(formData.expenseDate),
        status: 'Pending'
      } as MedicalReimbursement);
      
      // Clear form after successful submission
      setFormData({
        employeeId: '',
        expenseDate: new Date().toISOString().split('T')[0],
        amount: 0,
        description: '',
        receiptUrl: '',
        status: 'Pending',
        notes: '',
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      throw err; // Re-throw to be handled by parent
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

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div>
          <label htmlFor="employeeId" className="block text-sm font-medium text-gray-700">
            Employee
          </label>
          <select
            id="employeeId"
            value={formData.employeeId}
            onChange={(e) => setFormData(prev => ({ ...prev, employeeId: e.target.value }))}
            className="input mt-1"
            required
          >
            <option value="">Select employee...</option>
            {employees.map(employee => (
              <option key={employee.id} value={employee.id}>
                {`${employee.firstName || ''} ${employee.fatherName || ''}`.trim()}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="expenseDate" className="block text-sm font-medium text-gray-700">
            Expense Date
          </label>
          <input
            type="date"
            id="expenseDate"
            value={formData.expenseDate}
            onChange={(e) => setFormData(prev => ({ ...prev, expenseDate: e.target.value }))}
            className="input mt-1"
            required
          />
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
          required
        />
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div>
          <label htmlFor="amount" className="block text-sm font-medium text-gray-700">
            Amount
          </label>
          <input
            type="number"
            id="amount"
            value={formData.amount}
            onChange={(e) => setFormData(prev => ({ ...prev, amount: Number(e.target.value) }))}
            className="input mt-1"
            min="0"
            step="0.01"
            required
          />
        </div>

        <div>
          <label htmlFor="receiptUrl" className="block text-sm font-medium text-gray-700">
            Receipt URL
          </label>
          <input
            type="url"
            id="receiptUrl"
            value={formData.receiptUrl}
            onChange={(e) => setFormData(prev => ({ ...prev, receiptUrl: e.target.value }))}
            className="input mt-1"
            placeholder="https://example.com/receipt.pdf"
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
            onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as MedicalReimbursement['status'] }))}
            className="input mt-1"
            required
          >
            <option value="Pending">Pending</option>
            <option value="Approved">Approved</option>
            <option value="Rejected">Rejected</option>
            <option value="Paid">Paid</option>
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
          {loading ? 'Saving...' : initialData ? 'Update Reimbursement' : 'Submit Request'}
        </button>
      </div>
    </form>
  );
};

export default MedicalReimbursementForm;