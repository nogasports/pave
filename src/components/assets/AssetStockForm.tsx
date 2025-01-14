import React, { useState } from 'react';
import { AssetStock, AssetType } from '../../lib/firebase/assets';

interface AssetStockFormProps {
  assetTypes: AssetType[];
  onSubmit: (data: Omit<AssetStock, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  onCancel: () => void;
}

const AssetStockForm: React.FC<AssetStockFormProps> = ({
  assetTypes,
  onSubmit,
  onCancel,
}) => {
  const [formData, setFormData] = useState({
    assetTypeId: '',
    quantity: 0,
    unitCost: 0,
    currency: 'ETB',
    supplier: '',
    notes: '',
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
        <label htmlFor="assetTypeId" className="block text-sm font-medium text-gray-700">
          Asset Type
        </label>
        <select
          id="assetTypeId"
          value={formData.assetTypeId}
          onChange={(e) => setFormData(prev => ({ ...prev, assetTypeId: e.target.value }))}
          className="input mt-1"
          required
        >
          <option value="">Select asset type...</option>
          {assetTypes.map(type => (
            <option key={type.id} value={type.id}>{type.name}</option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
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
            min="0"
            required
          />
        </div>

        <div>
          <label htmlFor="unitCost" className="block text-sm font-medium text-gray-700">
            Unit Cost
          </label>
          <input
            type="number"
            id="unitCost"
            value={formData.unitCost}
            onChange={(e) => setFormData(prev => ({ ...prev, unitCost: parseFloat(e.target.value) }))}
            className="input mt-1"
            min="0"
            step="0.01"
            required
          />
        </div>
      </div>

      <div>
        <label htmlFor="supplier" className="block text-sm font-medium text-gray-700">
          Supplier
        </label>
        <input
          type="text"
          id="supplier"
          value={formData.supplier}
          onChange={(e) => setFormData(prev => ({ ...prev, supplier: e.target.value }))}
          className="input mt-1"
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
          {loading ? 'Saving...' : 'Add Stock'}
        </button>
      </div>
    </form>
  );
};

export default AssetStockForm;