import React, { useState, useEffect } from 'react';
import { Package, Building2, Users, Plus } from 'lucide-react';
import { 
  Asset, getAssets, addAsset, updateAsset, deleteAsset,
  AssetType, getAssetTypes, addAssetType,
  AssetStock, getAssetStock, updateAssetStock,
  getLocations, addLocation
} from '../../lib/firebase/assets';
import { AssetRequest, getAssetRequests, updateAssetRequest } from '../../lib/firebase/assetRequests';
import { Department, getDepartments } from '../../lib/firebase/departments';
import { Employee, getEmployees } from '../../lib/firebase/employees';
import AssetList from '../../components/assets/AssetList';
import AssetForm from '../../components/assets/AssetForm';
import AssetSummary from '../../components/assets/AssetSummary';
import AssetTypeStock from '../../components/assets/AssetTypeStock';
import AssetRequestList from '../../components/assets/AssetRequestList';

const Assets: React.FC = () => {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [assetTypes, setAssetTypes] = useState<AssetType[]>([]);
  const [stock, setStock] = useState<AssetStock[]>([]);
  const [requests, setRequests] = useState<AssetRequest[]>([]);
  const [locations, setLocations] = useState<{ id: string; name: string; }[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingAsset, setEditingAsset] = useState<Asset | null>(null);
  const [activeTab, setActiveTab] = useState<'assets' | 'stock' | 'requests'>('assets');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [assetsData, assetTypesData, stockData, requestsData, locationsData, departmentsData, employeesData] = await Promise.all([
        getAssets(),
        getAssetTypes(),
        getAssetStock(),
        getAssetRequests(),
        getLocations(),
        getDepartments(),
        getEmployees()
      ]);
      setAssets(assetsData);
      setAssetTypes(assetTypesData);
      setStock(stockData);
      setRequests(requestsData);
      setLocations(locationsData);
      setDepartments(departmentsData);
      setEmployees(employeesData);
    } catch (err) {
      setError('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading...</div>;

  const renderContent = () => {
    switch (activeTab) {
      case 'assets':
        return (
          <>
            <AssetSummary 
              assets={assets}
              stockSummary={{
                totalStock: stock.reduce((sum, s) => sum + s.quantity, 0),
                availableStock: stock.reduce((sum, s) => sum + (s.quantity || 0), 0),
                lowStock: stock.filter(s => s.quantity <= s.minimumQuantity).length
              }}
              requestsSummary={{
                pending: requests.filter(r => r.status === 'pending').length,
                approved: requests.filter(r => r.status === 'approved').length,
                total: requests.length
              }}
            />

            {(showForm || editingAsset) && (
              <div className="card">
                <h2 className="text-lg font-medium text-gray-900 mb-4">
                  {editingAsset ? 'Edit Asset' : 'Add New Asset'}
                </h2>
                <AssetForm
                  departments={departments}
                  employees={employees}
                  assetTypes={assetTypes}
                  locations={locations}
                  initialData={editingAsset || undefined}
                  onSubmit={async (data) => {
                    try {
                      if (editingAsset) {
                        await updateAsset(editingAsset.id!, data);
                      } else {
                        await addAsset(data);
                      }
                      await loadData();
                      setShowForm(false);
                      setEditingAsset(null);
                    } catch (err) {
                      setError('Failed to save asset');
                    }
                  }}
                  onCancel={() => {
                    setShowForm(false);
                    setEditingAsset(null);
                  }}
                />
              </div>
            )}

            <AssetList
              assets={assets}
              departments={departments}
              employees={employees}
              onEdit={setEditingAsset}
              onDelete={async (id) => {
                try {
                  await deleteAsset(id);
                  await loadData();
                } catch (err) {
                  setError('Failed to delete asset');
                }
              }}
            />
          </>
        );

      case 'stock':
        return (
          <AssetTypeStock
            assetTypes={assetTypes}
            stock={stock}
            locations={locations}
            onAddType={async (data) => {
              try {
                await addAssetType(data);
                await loadData();
              } catch (err) {
                setError('Failed to add asset type');
              }
            }}
            onUpdateStock={async (id, data) => {
              try {
                await updateAssetStock(id, data);
                await loadData();
              } catch (err) {
                setError('Failed to update stock');
              }
            }}
            onAddLocation={async (name) => {
              try {
                await addLocation(name);
                await loadData();
              } catch (err) {
                setError('Failed to add location');
              }
            }}
          />
        );

      case 'requests':
        return (
          <AssetRequestList
            requests={requests}
            assets={assets}
            employees={employees}
            onApprove={async (id) => {
              try {
                await updateAssetRequest(id, {
                  status: 'approved',
                  approvedAt: new Date(),
                });
                await loadData();
              } catch (err) {
                setError('Failed to approve request');
              }
            }}
            onReject={async (id) => {
              try {
                await updateAssetRequest(id, {
                  status: 'rejected',
                  approvedAt: new Date(),
                });
                await loadData();
              } catch (err) {
                setError('Failed to reject request');
              }
            }}
          />
        );
    }
  };

  const handleAssetRequest = async (id: string, status: AssetRequest['status'], comment?: string) => {
    try {
      await updateAssetRequest(id, {
        status,
        approvedBy: currentUser?.id,
        approvedAt: new Date(),
        approverComment: comment
      });
      await loadData();
    } catch (err) {
      setError('Failed to update asset request');
    }
  };

  const handleMaintenanceComplete = async (request: AssetRequest) => {
    try {
      // Update asset status
      await updateAsset(request.assetId, {
        status: 'Available',
        supportHistory: [{
          ticketId: request.supportTicketId!,
          timestamp: new Date(),
          type: 'maintenance',
          status: 'completed'
        }]
      });
      
      // Update request status
      await updateAssetRequest(request.id!, {
        status: 'approved',
        approvedBy: currentUser?.id,
        approvedAt: new Date(),
        approverComment: 'Maintenance completed'
      });
      
      await loadData();
    } catch (err) {
      setError('Failed to complete maintenance');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-900">Asset Management</h1>
        <div className="flex space-x-3">
          <button
            onClick={() => setActiveTab('requests')}
            className={`btn ${activeTab === 'requests' ? 'btn-primary' : 'btn-secondary'}`}
          >
            Asset Requests
          </button>
          <button
            onClick={() => setActiveTab('maintenance')} 
            className={`btn ${activeTab === 'maintenance' ? 'btn-primary' : 'btn-secondary'}`}
          >
            Maintenance
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('assets')}
            className={`
              group inline-flex items-center py-4 px-1 border-b-2 font-medium text-sm
              ${activeTab === 'assets'
                ? 'border-brand-600 text-brand-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}
            `}
          >
            Assets
          </button>
          <button
            onClick={() => setActiveTab('stock')}
            className={`
              group inline-flex items-center py-4 px-1 border-b-2 font-medium text-sm
              ${activeTab === 'stock'
                ? 'border-brand-600 text-brand-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}
            `}
          >
            Stock Management
          </button>
          <button
            onClick={() => setActiveTab('requests')}
            className={`
              group inline-flex items-center py-4 px-1 border-b-2 font-medium text-sm
              ${activeTab === 'requests'
                ? 'border-brand-600 text-brand-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}
            `}
          >
            Requests
          </button>
        </nav>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3">
          {error}
        </div>
      )}

      {renderContent()}

      {/* Asset Request List */}
      {activeTab === 'requests' && (
        <div className="card">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Asset Requests</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Employee
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Asset
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {requests
                  .filter(req => req.type !== 'maintenance')
                  .map(request => (
                  <tr key={request.id}>
                    {/* ... existing request row content ... */}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Maintenance List */}
      {activeTab === 'maintenance' && (
        <div className="card">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Maintenance Requests</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Asset
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Reported By
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Issue
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {requests
                  .filter(req => req.type === 'maintenance')
                  .map(request => {
                    const asset = assets.find(a => a.id === request.assetId);
                    const employee = employees.find(e => e.id === request.employeeId);
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
                            {employee ? `${employee.firstName} ${employee.fatherName}` : 'Unknown'}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900">
                            {request.reason}
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
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          {request.status === 'pending' && (
                            <>
                              <button
                                onClick={() => handleMaintenanceComplete(request)}
                                className="text-brand-600 hover:text-brand-900 mr-3"
                              >
                                Complete
                              </button>
                              <button
                                onClick={() => handleAssetRequest(request.id!, 'rejected', 'Maintenance rejected')}
                                className="text-red-600 hover:text-red-900"
                              >
                                Reject
                              </button>
                            </>
                          )}
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default Assets;