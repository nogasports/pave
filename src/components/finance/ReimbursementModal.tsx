import React, { useState } from 'react';
import { MedicalReimbursement } from '../../lib/firebase/finance';
import { Receipt } from 'lucide-react';

interface ReimbursementModalProps {
  maxAmount: number;
  onSubmit: (data: Omit<MedicalReimbursement, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  onClose: () => void;
}

const ReimbursementModal: React.FC<ReimbursementModalProps> = ({
  maxAmount,
  onSubmit,
  onClose,
}) => {
  const [formData, setFormData] = useState({
    amount: 0,
    description: '',
    expenseDate: new Date().toISOString().split('T')[0],
    receiptUrl: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (formData.amount > maxAmount) {
        throw new Error(`Maximum reimbursement amount is ${maxAmount.toLocaleString()} ETB`);
      }

      await onSubmit({
        ...formData,
        expenseDate: new Date(formData.expenseDate),
        status: 'Pending',
      } as MedicalReimbursement);
      
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
            <Receipt className="h-6 w-6 text-brand-600 mr-2" />
            <h2 className="text-lg font-medium text-gray-900">Submit Medical Reimbursement</h2>
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

          <div>
            <label htmlFor="receiptUrl" className="block text-sm font-medium text-gray-700">
              Receipt URL (Optional)
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