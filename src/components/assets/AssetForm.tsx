import React, { useState } from 'react';
import { Asset, AssetType, AssetSubType } from '../../lib/firebase/assets';
import { Department } from '../../lib/firebase/departments';
import { Employee } from '../../lib/firebase/employees';

interface AssetFormProps {
  departments: Department[];
  employees: Employee[];
  assetTypes: AssetType[];
  locations: { id: string; name: string; }[];
  initialData?: Partial<Asset>;
  onSubmit: (data: Omit<Asset, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  onCancel: () => void;
}

const AssetForm: React.FC<AssetFormProps> = ({
  departments,
  employees,
  assetTypes,
  locations,
  initialData,
  onSubmit,
  onCancel,
}) => {
  const [formData, setFormData] = useState({
    assetTypeId: initialData?.assetTypeId || '',
    subTypeId: initialData?.subTypeId || '',
    category: '',
    name: initialData?.name || '',
    description: initialData?.description || '',
    location: initialData?.location || '',
    departmentId: initialData?.departmentId || '',
    registrationCode: initialData?.registrationCode || '',
    custodianId: initialData?.custodianId || '',
    remark: initialData?.remark || '',
    serialNumber: initialData?.serialNumber || '',
    model: initialData?.model || '',
    photo: initialData?.photo || '',
    status: initialData?.status || 'Available',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    // Validate asset type exists
    const selectedType = assetTypes.find(t => t.id === formData.assetTypeId);
    if (!selectedType) {
      setError('Invalid asset type selected');
      setLoading(false);
      return;
    }

    try {
      await onSubmit(formData as Asset);
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
            <option value="">Select type...</option>
            {assetTypes.map(type => (
              <option key={type.id} value={type.id}>{type.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="location" className="block text-sm font-medium text-gray-700">
            Location
          </label>
          <select
            id="location"
            value={formData.location}
            onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
            className="input mt-1"
            required
          >
            <option value="">Select location...</option>
            {locations.map(loc => (
              <option key={loc.id} value={loc.id}>{loc.name}</option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700">
          Asset Name
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
          <label htmlFor="departmentId" className="block text-sm font-medium text-gray-700">
            Department
          </label>
          <select
            id="departmentId"
            value={formData.departmentId}
            onChange={(e) => setFormData(prev => ({ ...prev, departmentId: e.target.value }))}
            className="input mt-1"
            required
          >
            <option value="">Select department...</option>
            {departments.map(dept => (
              <option key={dept.id} value={dept.id}>{dept.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="custodianId" className="block text-sm font-medium text-gray-700">
            Custodian
          </label>
          <select
            id="custodianId"
            value={formData.custodianId}
            onChange={(e) => setFormData(prev => ({ ...prev, custodianId: e.target.value }))}
            className="input mt-1"
          >
            <option value="">Select custodian...</option>
            {employees.map(emp => (
              <option key={emp.id} value={emp.id}>
                {emp.firstName} {emp.fatherName}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div>
          <label htmlFor="serialNumber" className="block text-sm font-medium text-gray-700">
            Serial Number
          </label>
          <input
            type="text"
            id="serialNumber"
            value={formData.serialNumber}
            onChange={(e) => setFormData(prev => ({ ...prev, serialNumber: e.target.value }))}
            className="input mt-1"
            required
          />
        </div>

        <div>
          <label htmlFor="model" className="block text-sm font-medium text-gray-700">
            Model
          </label>
          <input
            type="text"
            id="model"
            value={formData.model}
            onChange={(e) => setFormData(prev => ({ ...prev, model: e.target.value }))}
            className="input mt-1"
            required
          />
        </div>
      </div>

      <div>
        <label htmlFor="status" className="block text-sm font-medium text-gray-700">
          Status
        </label>
        <select
          id="status"
          value={formData.status}
          onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as Asset['status'] }))}
          className="input mt-1"
          required
        >
          <option value="Available">Available</option>
          <option value="Allocated">Allocated</option>
          <option value="Under Maintenance">Under Maintenance</option>
          <option value="Retired">Retired</option>
        </select>
      </div>

      <div>
        <label htmlFor="remark" className="block text-sm font-medium text-gray-700">
          Remarks
        </label>
        <textarea
          id="remark"
          value={formData.remark}
          onChange={(e) => setFormData(prev => ({ ...prev, remark: e.target.value }))}
          className="input mt-1"
          rows={2}
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
          {loading ? 'Saving...' : initialData ? 'Update Asset' : 'Add Asset'}
        </button>
      </div>
    </form>
  );
};

export default AssetForm;