import React, { useState, useEffect } from 'react';
import { Package, ArrowUpRight, ArrowDownLeft, AlertCircle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { Asset, getAssets } from '../../lib/firebase/assets';
import { Employee, getEmployees } from '../../lib/firebase/employees';
import { AssetRequest, getAssetRequests, addAssetRequest } from '../../lib/firebase/assetRequests';
import { AssetRequestModal } from '../../components/assets/AssetRequestModal';
import { Department, getDepartments } from '../../lib/firebase/departments';

const StaffAssets: React.FC = () => {
  const { user } = useAuth();
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [requests, setRequests] = useState<AssetRequest[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [showReturnModal, setShowReturnModal] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const [assetTypes, setAssetTypes] = useState<AssetType[]>([]);
  const [stock, setStock] = useState<AssetStock[]>([]);

  useEffect(() => {
    loadData();
  }, [user]);

  const loadData = async () => {
    try {
      // Get employee record
      const employees = await getEmployees();
      const currentEmployee = employees.find(emp => emp.workEmail === user?.email);
      if (!currentEmployee) {
        throw new Error('Employee record not found');
      }
      setEmployee(currentEmployee);

      // Load all required data
      const [assetsData, departmentsData, requestsData, assetTypesData, stockData] = await Promise.all([
        getAssets(),
        getDepartments(),
        getAssetRequests(currentEmployee.id),
        getAssetTypes(),
        getAssetStock()
      ]);

      setAssets(assetsData);
      setDepartments(departmentsData);
      setRequests(requestsData);
      setAssetTypes(assetTypesData);
      setStock(stockData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleAssetRequest = async (data: Omit<AssetRequest, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const asset = assets.find(a => a.id === data.assetId);
      if (!asset) throw new Error('Asset not found');
      
      await addAssetRequest(data, asset, employee!);
      await loadData();
    } catch (err) {
      setError('Failed to submit asset request');
    }
  };

  const handleMaintenanceRequest = async (asset: Asset) => {
    try {
      await addAssetRequest({
        assetId: asset.id!,
        employeeId: employee!.id!,
        type: 'maintenance',
        status: 'pending',
        reason: 'Maintenance required',
        requestDate: new Date(),
      }, asset, employee!);
      await loadData();
    } catch (err) {
      setError('Failed to submit maintenance request');
    }
  };

  const getDepartmentName = (departmentId: string) => {
    return departments.find(d => d.id === departmentId)?.name || 'Unknown Department';
  };

  // Filter assets assigned to current employee
  const myAssets = assets.filter(asset => asset.custodianId === employee?.id);
  
  // Get available assets from stock
  const availableAssets = stock.filter(s => 
    s.quantity > 0 && 
    assetTypes.find(t => t.id === s.assetTypeId)?.active
  );
  const pendingRequests = requests.filter(req => req.status === 'pending');

  if (loading) return <div>Loading...</div>;
  if (error) return <div className="text-red-600">{error}</div>;
  if (!employee) return <div>No employee record found</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-900">My Assets</h1>
        <div className="flex space-x-3">
          <button
            onClick={() => setShowRequestModal(true)}
            className="btn btn-primary"
          >
            <ArrowDownLeft className="h-4 w-4 mr-2" />
            Request Asset
          </button>
          <button
            onClick={() => setShowReturnModal(true)}
            className="btn btn-secondary"
          >
            <ArrowUpRight className="h-4 w-4 mr-2" />
            Return Asset
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
        <div className="card">
          <div className="flex items-center">
            <div className="bg-blue-50 rounded-none p-3">
              <Package className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-gray-500">Assigned Assets</h3>
              <div className="mt-1">
                <p className="text-2xl font-semibold text-gray-900">{myAssets.length}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="bg-green-50 rounded-none p-3">
              <ArrowDownLeft className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-gray-500">Available Assets</h3>
              <div className="mt-1">
                <p className="text-2xl font-semibold text-gray-900">{availableAssets.length}</p>
                <p className="text-sm text-gray-500">In your department</p>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="bg-yellow-50 rounded-none p-3">
              <AlertCircle className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-gray-500">Pending Requests</h3>
              <div className="mt-1">
                <p className="text-2xl font-semibold text-gray-900">{pendingRequests.length}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* My Assets */}
      <div className="card">
        <h2 className="text-lg font-medium text-gray-900 mb-4">My Assets</h2>
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
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {myAssets.map((asset) => (
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
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <span className="text-gray-500">Status</span>
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
                    </div>
                    <div className="mt-4 flex justify-end space-x-2">
                      {asset.custodianId === employee?.id && (
                        <>
                          <button
                            onClick={() => handleMaintenanceRequest(asset)}
                            className="btn btn-secondary text-sm"
                          >
                            Report Issue
                          </button>
                          <button
                            onClick={() => {
                              setSelectedAsset(asset);
                              setShowReturnModal(true);
                            }}
                            className="btn btn-primary text-sm"
                          >
                            Return Asset
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Request History */}
      <div className="card">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Request History</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Asset
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Request Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Notes
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {requests.map((request) => {
                const asset = assets.find(a => a.id === request.assetId);
                return (
                  <tr key={request.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {asset?.name}
                      </div>
                      <div className="text-sm text-gray-500">
                        {asset?.assetNumber}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {request.type === 'request' ? 'Asset Request' : 'Asset Return'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {new Date(request.requestDate).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-none ${
                        request.status === 'approved'
                          ? 'bg-green-100 text-green-800'
                          : request.status === 'rejected'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {request.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">
                        {request.reason}
                      </div>
                      {request.notes && (
                        <div className="text-sm text-gray-500 mt-1">
                          {request.notes}
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Asset Request Modal */}
      {showRequestModal && (
        <AssetRequestModal
          type="request"
          employee={employee}
          availableAssets={availableAssets.map(s => ({
            id: s.id,
            name: assetTypes.find(t => t.id === s.assetTypeId)?.name || 'Unknown',
            quantity: s.quantity,
            location: s.location
          }))}
          onSubmit={handleAssetRequest}
          onClose={() => {
            setShowRequestModal(false);
            setSelectedAsset(null);
          }}
        />
      )}

      {/* Asset Return Modal */}
      {showReturnModal && (
        <AssetRequestModal
          type="return"
          employee={employee}
          asset={selectedAsset!}
          onSubmit={handleAssetRequest}
          onClose={() => {
            setShowReturnModal(false);
            setSelectedAsset(null);
          }}
        />
      )}
    </div>
  );
};

export default StaffAssets;