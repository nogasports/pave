import React from 'react';
import { Edit2, Trash2, Package } from 'lucide-react';
import { AssetRequest } from '../../lib/firebase/assetRequests';
import { Asset } from '../../lib/firebase/assets';
import { Employee } from '../../lib/firebase/employees';

interface AssetRequestListProps {
  requests: AssetRequest[];
  assets: Asset[];
  employees: Employee[];
  onApprove: (id: string, comment?: string) => Promise<void>;
  onReject: (id: string, comment?: string) => Promise<void>;
}

const AssetRequestList: React.FC<AssetRequestListProps> = ({
  requests,
  assets,
  employees,
  onApprove,
  onReject,
}) => {
  const getEmployeeName = (id: string) => {
    const employee = employees.find(e => e.id === id);
    return employee ? `${employee.firstName} ${employee.fatherName}` : 'Unknown';
  };

  const getAssetName = (id: string) => {
    const asset = assets.find(a => a.id === id);
    return asset ? `${asset.name} (${asset.assetNumber})` : 'Unknown Asset';
  };

  return (
    <div className="space-y-4">
      {requests.map((request) => (
        <div key={request.id} className="card">
          <div className="flex justify-between">
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0">
                <div className="h-10 w-10 bg-gray-100 flex items-center justify-center">
                  <Package className="h-6 w-6 text-gray-400" />
                </div>
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-900">
                  {getEmployeeName(request.employeeId)}
                </h3>
                <div className="mt-1 text-sm text-gray-500">
                  {request.type === 'request' ? 'Asset Request' : 'Asset Return'}
                </div>
                <div className="mt-2 text-sm text-gray-700">
                  Asset: {getAssetName(request.assetId)}
                </div>
                {request.reason && (
                  <div className="mt-2 text-sm text-gray-600">
                    Reason: {request.reason}
                  </div>
                )}
                <div className="mt-2 text-sm text-gray-500">
                  Requested: {new Date(request.requestDate).toLocaleDateString()}
                </div>
              </div>
            </div>
            <div className="flex items-start space-x-4">
              <span className={`px-2 py-1 text-xs font-semibold rounded-none ${
                request.status === 'approved'
                  ? 'bg-green-100 text-green-800'
                  : request.status === 'rejected'
                  ? 'bg-red-100 text-red-800'
                  : 'bg-yellow-100 text-yellow-800'
              }`}>
                {request.status}
              </span>
              {request.status === 'pending' && (
                <div className="flex space-x-2">
                  <button
                    onClick={() => onApprove(request.id!, 'Request approved')}
                    className="btn btn-primary text-sm"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => onReject(request.id!, 'Request rejected')}
                    className="btn btn-secondary text-sm"
                  >
                    Reject
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Request History */}
          {request.history && request.history.length > 0 && (
            <div className="mt-4 border-t border-gray-200 pt-4">
              <h4 className="text-sm font-medium text-gray-900">Request History</h4>
              <div className="mt-2 space-y-2">
                {request.history.map((entry, index) => (
                  <div key={index} className="flex items-start space-x-2 text-sm">
                    <div className={`w-2 h-2 mt-1.5 rounded-full ${
                      entry.status === 'approved'
                        ? 'bg-green-500'
                        : entry.status === 'rejected'
                        ? 'bg-red-500'
                        : 'bg-yellow-500'
                    }`} />
                    <div>
                      <p className="text-gray-900">
                        Status changed to <span className="font-medium">{entry.status}</span>
                      </p>
                      <p className="text-gray-500">
                        {new Date(entry.date).toLocaleString()}
                      </p>
                      {entry.comment && (
                        <p className="text-gray-600 mt-1">{entry.comment}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default AssetRequestList;