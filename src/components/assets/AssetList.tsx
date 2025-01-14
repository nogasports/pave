import React from 'react';
import { Edit2, Trash2, Package } from 'lucide-react';
import { Asset } from '../../lib/firebase/assets';
import { Department } from '../../lib/firebase/departments';
import { Employee } from '../../lib/firebase/employees';

interface AssetListProps {
  assets: Asset[];
  departments: Department[];
  employees: Employee[];
  onEdit: (asset: Asset) => void;
  onDelete: (id: string) => void;
}

const AssetList: React.FC<AssetListProps> = ({
  assets,
  departments,
  employees,
  onEdit,
  onDelete,
}) => {
  const getDepartmentName = (departmentId: string) => {
    return departments.find(d => d.id === departmentId)?.name || 'Unknown Department';
  };

  const getCustodianName = (custodianId: string) => {
    const employee = employees.find(e => e.id === custodianId);
    if (!employee) return 'Unknown Custodian';
    return `${employee.firstName || ''} ${employee.fatherName || ''}`.trim();
  };

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead>
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Asset
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Details
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Location
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Status
            </th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {assets.map((asset) => (
            <tr key={asset.id}>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center">
                  <div className="flex-shrink-0 h-10 w-10">
                    {asset.photo ? (
                      <img
                        className="h-10 w-10 object-cover"
                        src={asset.photo}
                        alt={asset.name}
                      />
                    ) : (
                      <div className="h-10 w-10 bg-gray-100 flex items-center justify-center">
                        <Package className="h-6 w-6 text-gray-400" />
                      </div>
                    )}
                  </div>
                  <div className="ml-4">
                    <div className="text-sm font-medium text-gray-900">
                      {asset.name}
                    </div>
                    <div className="text-sm text-gray-500">
                      {asset.assetNumber}
                    </div>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-900">
                  {asset.model}
                </div>
                <div className="text-sm text-gray-500">
                  SN: {asset.serialNumber}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-900">
                  {asset.location}
                </div>
                <div className="text-sm text-gray-500">
                  {getDepartmentName(asset.departmentId)}
                </div>
                <div className="text-sm text-gray-500">
                  Custodian: {getCustodianName(asset.custodianId)}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-none ${
                  asset.status === 'Available'
                    ? 'bg-green-100 text-green-800'
                    : asset.status === 'Allocated'
                    ? 'bg-blue-100 text-blue-800'
                    : asset.status === 'Under Maintenance'
                    ? 'bg-yellow-100 text-yellow-800'
                    : 'bg-red-100 text-red-800'
                }`}>
                  {asset.status}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <button
                  onClick={() => onEdit(asset)}
                  className="text-brand-600 hover:text-brand-900 mr-3"
                >
                  <Edit2 className="h-4 w-4" />
                </button>
                <button
                  onClick={() => asset.id && onDelete(asset.id)}
                  className="text-red-600 hover:text-red-900"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AssetList;