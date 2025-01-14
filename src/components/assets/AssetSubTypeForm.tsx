import React, { useState } from 'react';
import { AssetSubType, AssetType } from '../../lib/firebase/assets';

interface AssetSubTypeFormProps {
  assetTypes: AssetType[];
  initialData?: Partial<AssetSubType>;
  onSubmit: (data: Omit<AssetSubType, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  onCancel: () => void;
}

const AssetSubTypeForm: React.FC<AssetSubTypeFormProps> = ({
  assetTypes,
  initialData,
  onSubmit,
  onCancel,
}) => {
  const [formData, setFormData] = useState({
    assetTypeId: initialData?.assetTypeId || '',
    name: initialData?.name || '',
    description: initialData?.description || '',
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

      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700">
          Sub Type Name
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
          {loading ? 'Saving...' : initialData ? 'Update Sub Type' : 'Add Sub Type'}
        </button>
      </div>
    </form>
  );
};

export default AssetSubTypeForm;