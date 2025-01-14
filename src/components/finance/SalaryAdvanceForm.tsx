import React, { useState } from 'react';
import { SalaryAdvance } from '../../lib/firebase/finance';
import { Employee } from '../../lib/firebase/employees';

interface SalaryAdvanceFormProps {
  initialData?: Partial<SalaryAdvance>;
  employees: Employee[];
  onSubmit: (data: Omit<SalaryAdvance, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  onCancel: () => void;
}

const SalaryAdvanceForm: React.FC<SalaryAdvanceFormProps> = ({
  initialData,
  employees,
  onSubmit,
  onCancel,
}) => {
  const [formData, setFormData] = useState({
    employeeId: initialData?.employeeId || '',
    amount: initialData?.amount || 0,
    reason: initialData?.reason || '',
    requestDate: initialData?.requestDate ? new Date(initialData.requestDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
    repaymentDate: initialData?.repaymentDate ? new Date(initialData.repaymentDate).toISOString().split('T')[0] : '',
    installments: initialData?.installments || 1,
    monthlyDeduction: initialData?.monthlyDeduction || 0,
    status: initialData?.status || 'Pending',
    notes: initialData?.notes || '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Calculate monthly deduction when amount or installments change
  React.useEffect(() => {
    const monthlyAmount = formData.amount / formData.installments;
    setFormData(prev => ({
      ...prev,
      monthlyDeduction: Math.round(monthlyAmount * 100) / 100
    }));
  }, [formData.amount, formData.installments]);

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
        requestDate: new Date(formData.requestDate),
        repaymentDate: new Date(formData.repaymentDate),
        status: 'Pending'
      } as SalaryAdvance);
      
      // Clear form after successful submission
      setFormData({
        employeeId: '',
        amount: 0,
        reason: '',
        requestDate: new Date().toISOString().split('T')[0],
        repaymentDate: '',
        installments: 1,
        monthlyDeduction: 0,
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
          <label htmlFor="amount" className="block text-sm font-medium text-gray-700">
            Advance Amount
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
      </div>

      <div>
        <label htmlFor="reason" className="block text-sm font-medium text-gray-700">
          Reason for Advance
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

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div>
          <label htmlFor="requestDate" className="block text-sm font-medium text-gray-700">
            Request Date
          </label>
          <input
            type="date"
            id="requestDate"
            value={formData.requestDate}
            onChange={(e) => setFormData(prev => ({ ...prev, requestDate: e.target.value }))}
            className="input mt-1"
            required
          />
        </div>

        <div>
          <label htmlFor="repaymentDate" className="block text-sm font-medium text-gray-700">
            Repayment Start Date
          </label>
          <input
            type="date"
            id="repaymentDate"
            value={formData.repaymentDate}
            onChange={(e) => setFormData(prev => ({ ...prev, repaymentDate: e.target.value }))}
            className="input mt-1"
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div>
          <label htmlFor="installments" className="block text-sm font-medium text-gray-700">
            Number of Installments
          </label>
          <input
            type="number"
            id="installments"
            value={formData.installments}
            onChange={(e) => setFormData(prev => ({ ...prev, installments: Number(e.target.value) }))}
            className="input mt-1"
            min="1"
            required
          />
        </div>

        <div>
          <label htmlFor="monthlyDeduction" className="block text-sm font-medium text-gray-700">
            Monthly Deduction
          </label>
          <input
            type="number"
            id="monthlyDeduction"
            value={formData.monthlyDeduction}
            className="input mt-1 bg-gray-100"
            disabled
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
            onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as SalaryAdvance['status'] }))}
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
          {loading ? 'Saving...' : initialData ? 'Update Advance' : 'Submit Request'}
        </button>
      </div>
    </form>
  );
};

export default SalaryAdvanceForm;