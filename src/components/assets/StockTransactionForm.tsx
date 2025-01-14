import React, { useState } from 'react';
import { StockTransaction } from '../../lib/firebase/assets';

interface StockTransactionFormProps {
  stockId: string;
  currentQuantity: number;
  onSubmit: (data: Omit<StockTransaction, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  onCancel: () => void;
}

const StockTransactionForm: React.FC<StockTransactionFormProps> = ({
  stockId,
  currentQuantity,
  onSubmit,
  onCancel,
}) => {
  const [formData, setFormData] = useState({
    type: 'in' as StockTransaction['type'],
    quantity: 0,
    reason: '',
    referenceNumber: '',
    notes: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Validate quantity for outgoing transactions
      if (formData.type === 'out' && formData.quantity > currentQuantity) {
        throw new Error('Insufficient stock quantity');
      }

      await onSubmit({
        ...formData,
        stockId,
        performedBy: 'currentUserId', // TODO: Get from auth context
      });
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

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div>
          <label htmlFor="type" className="block text-sm font-medium text-gray-700">
            Transaction Type
          </label>
          <select
            id="type"
            value={formData.type}
            onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value as 'in' | 'out' }))}
            className="input mt-1"
            required
          >
            <option value="in">Stock In</option>
            <option value="out">Stock Out</option>
          </select>
        </div>

        <div>
          <label htmlFor="quantity" className="block text-sm font-medium text-gray-700">
            Quantity
          </label>
          <input
            type="number"
            id="quantity"
            value={formData.quantity}
            onChange={(e) => setFormData(prev => ({ ...prev, quantity: parseInt(e.target.value) }))}
            className="input mt-1"
            min="1"
            max={formData.type === 'out' ? currentQuantity : undefined}
            required
          />
          {formData.type === 'out' && (
            <p className="mt-1 text-sm text-gray-500">
              Current stock: {currentQuantity}
            </p>
          )}
        </div>
      </div>

      <div>
        <label htmlFor="reason" className="block text-sm font-medium text-gray-700">
          Reason
        </label>
        <input
          type="text"
          id="reason"
          value={formData.reason}
          onChange={(e) => setFormData(prev => ({ ...prev, reason: e.target.value }))}
          className="input mt-1"
          required
        />
      </div>

      <div>
        <label htmlFor="referenceNumber" className="block text-sm font-medium text-gray-700">
          Reference Number
        </label>
        <input
          type="text"
          id="referenceNumber"
          value={formData.referenceNumber}
          onChange={(e) => setFormData(prev => ({ ...prev, referenceNumber: e.target.value }))}
          className="input mt-1"
          placeholder="Optional: PO/Invoice number"
        />
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
          rows={3}
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
          {loading ? 'Processing...' : 'Submit Transaction'}
        </button>
      </div>
    </form>
  );
};

export default StockTransactionForm;