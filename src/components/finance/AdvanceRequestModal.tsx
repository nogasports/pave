import React, { useState } from 'react';
import { CreditCard } from 'lucide-react';
import { SalaryAdvance } from '../../lib/firebase/finance';
import { Employee } from '../../lib/firebase/employees';

interface AdvanceRequestModalProps {
  maxAmount: number;
  maxInstallments: number;
  employee: Employee;
  onSubmit: (data: Omit<SalaryAdvance, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  onClose: () => void;
}

const AdvanceRequestModal: React.FC<AdvanceRequestModalProps> = ({
  maxAmount,
  maxInstallments,
  employee,
  onSubmit,
  onClose,
}) => {
  const [formData, setFormData] = useState({
    amount: 0,
    reason: '',
    installments: 1,
    monthlyDeduction: 0,
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
      if (formData.amount > maxAmount) {
        throw new Error(`Maximum advance amount is ${maxAmount.toLocaleString()} ETB`);
      }

      await onSubmit({
        ...formData,
        employeeId: employee.id!,
        requestDate: new Date(),
        repaymentDate: new Date(), // Set to first day of next month
        status: 'Pending',
      } as SalaryAdvance);
      
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
            <CreditCard className="h-6 w-6 text-brand-600 mr-2" />
            <h2 className="text-lg font-medium text-gray-900">Request Salary Advance</h2>
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
            <label htmlFor="amount" className="block text-sm font-medium text-gray-700">
              Amount (Max: {maxAmount.toLocaleString()} ETB)
            </label>
            <input
              type="number"
              id="amount"
              value={formData.amount}
              onChange={(e) => setFormData(prev => ({ ...prev, amount: Number(e.target.value) }))}
              className="input mt-1"
              min="0"
              max={maxAmount}
              required
            />
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

          <div>
            <label htmlFor="installments" className="block text-sm font-medium text-gray-700">
              Number of Installments (Max: {maxInstallments})
            </label>
            <input
              type="number"
              id="installments"
              value={formData.installments}
              onChange={(e) => setFormData(prev => ({ ...prev, installments: Number(e.target.value) }))}
              className="input mt-1"
              min="1"
              max={maxInstallments}
              required
            />
            {formData.monthlyDeduction > 0 && (
              <p className="mt-1 text-sm text-gray-500">
                Monthly deduction: {formData.monthlyDeduction.toLocaleString()} ETB
              </p>
            )}
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

export default AdvanceRequestModal;