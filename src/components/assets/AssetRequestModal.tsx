import React, { useState } from 'react';
import { Package } from 'lucide-react';
import { Asset } from '../../lib/firebase/assets';
import { Employee } from '../../lib/firebase/employees';
import { AssetRequest } from '../../lib/firebase/assetRequests';

interface AssetRequestModalProps {
  type: 'request' | 'return';
  employee: Employee;
  asset?: Asset;
  availableAssets?: Asset[];
  onSubmit: (data: Omit<AssetRequest, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  onClose: () => void;
}

const AssetRequestModal: React.FC<AssetRequestModalProps> = ({
  type,
  employee,
  asset,
  availableAssets,
  onSubmit,
  onClose,
}) => {
  const [formData, setFormData] = useState({
    assetId: asset?.id || '',
    reason: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (!formData.assetId) {
        throw new Error('Please select an asset');
      }

      await onSubmit({
        assetId: formData.assetId,
        employeeId: employee.id!,
        type,
        status: 'pending',
        reason: formData.reason,
        requestDate: new Date(),
      });
      
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
            <Package className="h-6 w-6 text-brand-600 mr-2" />
            <h2 className="text-lg font-medium text-gray-900">
              {type === 'request' ? 'Request Asset' : 'Return Asset'}
            </h2>
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
          {type === 'request' && availableAssets ? (
            <div>
              <label htmlFor="assetId" className="block text-sm font-medium text-gray-700">
                Select Asset
              </label>
              <select
                id="assetId"
                value={formData.assetId}
                onChange={(e) => setFormData(prev => ({ ...prev, assetId: e.target.value }))}
                className="input mt-1"
                required
              >
                <option value="">Select asset...</option>
                {availableAssets.map(asset => (
                  <option key={asset.id} value={asset.id}>
                    {asset.name} - {asset.assetNumber}
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Asset Details
              </label>
              <div className="mt-1 bg-gray-50 p-4">
                <h4 className="text-sm font-medium text-gray-900">{asset?.name}</h4>
                <p className="text-sm text-gray-500">{asset?.assetNumber}</p>
              </div>
            </div>
          )}

          <div>
            <label htmlFor="reason" className="block text-sm font-medium text-gray-700">
              Reason
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
              {loading ? 'Submitting...' : type === 'request' ? 'Submit Request' : 'Return Asset'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export { AssetRequestModal };