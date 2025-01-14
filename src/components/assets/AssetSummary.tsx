import React from 'react';
import { Package, Users, Clock, AlertCircle } from 'lucide-react';
import { Asset } from '../../lib/firebase/assets';

interface AssetSummaryProps {
  assets: Asset[];
  stockSummary?: {
    totalStock: number;
    availableStock: number;
    lowStock: number;
  };
  requestsSummary?: {
    pending: number;
    approved: number;
    total: number;
  };
}

const AssetSummary: React.FC<AssetSummaryProps> = ({ 
  assets,
  stockSummary,
  requestsSummary
}) => {
  // Calculate asset statistics
  const totalAssets = assets.length;
  const allocatedAssets = assets.filter(a => a.status === 'Allocated').length;
  const availableAssets = assets.filter(a => a.status === 'Available').length;
  const maintenanceAssets = assets.filter(a => a.status === 'Under Maintenance').length;

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
      <div className="card">
        <div className="flex items-center">
          <div className="bg-blue-50 rounded-none p-3">
            <Package className="h-6 w-6 text-blue-600" />
          </div>
          <div className="ml-4">
            <h3 className="text-sm font-medium text-gray-500">Total Assets</h3>
            <div className="mt-1">
              <p className="text-2xl font-semibold text-gray-900">{totalAssets}</p>
              <p className="text-sm text-gray-500">{allocatedAssets} allocated</p>
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="flex items-center">
          <div className="bg-green-50 rounded-none p-3">
            <Users className="h-6 w-6 text-green-600" />
          </div>
          <div className="ml-4">
            <h3 className="text-sm font-medium text-gray-500">Available Assets</h3>
            <div className="mt-1">
              <p className="text-2xl font-semibold text-gray-900">{availableAssets}</p>
              {stockSummary && (
                <p className="text-sm text-gray-500">{stockSummary.availableStock} in stock</p>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="flex items-center">
          <div className="bg-yellow-50 rounded-none p-3">
            <Clock className="h-6 w-6 text-yellow-600" />
          </div>
          <div className="ml-4">
            <h3 className="text-sm font-medium text-gray-500">Under Maintenance</h3>
            <div className="mt-1">
              <p className="text-2xl font-semibold text-gray-900">{maintenanceAssets}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="flex items-center">
          <div className="bg-red-50 rounded-none p-3">
            <AlertCircle className="h-6 w-6 text-red-600" />
          </div>
          <div className="ml-4">
            <h3 className="text-sm font-medium text-gray-500">Pending Requests</h3>
            <div className="mt-1">
              <p className="text-2xl font-semibold text-gray-900">
                {requestsSummary?.pending || 0}
              </p>
              {requestsSummary && (
                <p className="text-sm text-gray-500">{requestsSummary.approved} approved</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AssetSummary;