import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Users, AlertCircle, Check, X, Edit2, Trash2, Plus } from 'lucide-react';
import { Leave, getLeaves, addLeave, updateLeave, deleteLeave } from '../../lib/firebase/workManagement'; 
import { LeaveType, getLeaveTypes } from '../../lib/firebase/leaveTypes';
import { addLeaveType, updateLeaveType, deleteLeaveType } from '../../lib/firebase/leaveTypes';
import { Employee } from '../../lib/firebase/employees';
import LeaveTypeForm from './LeaveTypeForm';
import LeaveForm from './LeaveForm';

interface LeaveManagementProps {
  employees: Employee[];
}

const LeaveManagement: React.FC<LeaveManagementProps> = ({ employees }) => {
  const [leaves, setLeaves] = useState<Leave[]>([]);
  const [leaveTypes, setLeaveTypes] = useState<LeaveType[]>([]);
  const [activeTab, setActiveTab] = useState<'requests' | 'types'>('requests');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingLeave, setEditingLeave] = useState<Leave | null>(null);
  const [showLeaveTypeForm, setShowLeaveTypeForm] = useState(false);
  const [editingLeaveType, setEditingLeaveType] = useState<LeaveType | null>(null);
  const [filters, setFilters] = useState({
    status: '',
    type: '',
    search: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [leavesData, leaveTypesData] = await Promise.all([
        getLeaves(),
        getLeaveTypes()
      ]);
      setLeaves(leavesData);
      setLeaveTypes(leaveTypesData);
    } catch (err) {
      setError('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const getEmployeeName = (employeeId: string): string => {
    const employee = employees.find(e => e.id === employeeId);
    if (!employee) {
      console.warn(`Employee not found for ID: ${employeeId}`);
      return 'Unknown Employee';
    }
    return `${employee.firstName || ''} ${employee.fatherName || ''}`.trim();
  };

  const handleAddLeaveType = async (data: Omit<LeaveType, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      await addLeaveType(data);
      await loadData();
      setShowLeaveTypeForm(false);
    } catch (err) {
      setError('Failed to add leave type');
    }
  };

  const handleUpdateLeaveType = async (data: Omit<LeaveType, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (!editingLeaveType?.id) return;
    try {
      await updateLeaveType(editingLeaveType.id, data);
      await loadData();
      setEditingLeaveType(null);
    } catch (err) {
      setError('Failed to update leave type');
    }
  };

  const handleDeleteLeaveType = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this leave type?')) return;
    try {
      await deleteLeaveType(id);
      await loadData();
    } catch (err) {
      setError('Failed to delete leave type');
    }
  };

  const handleAddLeave = async (data: Omit<Leave, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      await addLeave(data);
      await loadData();
      setShowForm(false);
    } catch (err) {
      setError('Failed to add leave request');
    }
  };

  const handleUpdateLeave = async (data: Omit<Leave, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (!editingLeave?.id) return;
    try {
      const employee = employees.find(e => e.id === data.employeeId);
      if (!employee) throw new Error('Employee not found');

      await updateLeave(editingLeave.id, {
        ...data,
        approvedAt: new Date(),
        approverComment: data.status === 'Approved' ? 
          `Leave request approved for ${employee.firstName} ${employee.fatherName}` :
          `Leave request rejected for ${employee.firstName} ${employee.fatherName}`
      });
      await loadData();
      setEditingLeave(null);
    } catch (err) {
      setError('Failed to update leave request');
    }
  };

  const handleDeleteLeave = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this leave request?')) return;
    try {
      await deleteLeave(id);
      await loadData();
    } catch (err) {
      setError('Failed to delete leave request');
    }
  };

  const handleApproveLeave = async (leave: Leave) => {
    if (!leave.id) return;
    try {
      await updateLeave(leave.id, {
        ...leave,
        status: 'Approved',
        approvedAt: new Date(),
      });
      await loadData();
    } catch (err) {
      setError('Failed to approve leave request');
    }
  };

  const handleRejectLeave = async (leave: Leave) => {
    if (!leave.id) return;
    try {
      await updateLeave(leave.id, {
        ...leave,
        status: 'Rejected',
        approvedAt: new Date(),
      });
      await loadData();
    } catch (err) {
      setError('Failed to reject leave request');
    }
  };

  // Filter leaves based on search and filters
  const filteredLeaves = leaves.filter(leave => {
    if (filters.status && leave.status !== filters.status) return false;
    if (filters.type && leave.leaveType !== filters.type) return false;
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      const employee = employees.find(e => e.id === leave.employeeId);
      if (!employee) return false;
      return (
        `${employee.firstName} ${employee.fatherName}`.toLowerCase().includes(searchTerm) ||
        employee.workEmail?.toLowerCase().includes(searchTerm) ||
        employee.staffId?.toLowerCase().includes(searchTerm)
      );
    }
    return true;
  });

  if (loading) return <div>Loading...</div>;

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <div className="card">
          <div className="flex items-center">
            <div className="bg-blue-50 rounded-none p-3">
              <Calendar className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-gray-500">Total Requests</h3>
              <div className="mt-1">
                <p className="text-2xl font-semibold text-gray-900">{leaves.length}</p>
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
              <h3 className="text-sm font-medium text-gray-500">Pending Requests</h3>
              <div className="mt-1">
                <p className="text-2xl font-semibold text-gray-900">
                  {leaves.filter(l => l.status === 'Pending').length}
                </p>
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
              <h3 className="text-sm font-medium text-gray-500">On Leave Today</h3>
              <div className="mt-1">
                <p className="text-2xl font-semibold text-gray-900">
                  {leaves.filter(l => {
                    const today = new Date();
                    return (
                      l.status === 'Approved' &&
                      l.startDate <= today &&
                      l.endDate >= today
                    );
                  }).length}
                </p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="card">
          <div className="flex items-center">
            <div className="bg-indigo-50 rounded-none p-3">
              <AlertCircle className="h-6 w-6 text-indigo-600" />
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-gray-500">Leave Types</h3>
              <div className="mt-1">
                <p className="text-2xl font-semibold text-gray-900">
                  {leaveTypes.filter(lt => lt.active).length}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div>
            <label htmlFor="statusFilter" className="block text-sm font-medium text-gray-700">
              Status
            </label>
            <select
              id="statusFilter"
              value={filters.status}
              onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
              className="input mt-1"
            >
              <option value="">All Status</option>
              <option value="Pending">Pending</option>
              <option value="Approved">Approved</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>

          <div>
            <label htmlFor="typeFilter" className="block text-sm font-medium text-gray-700">
              Leave Type
            </label>
            <select
              id="typeFilter"
              value={filters.type}
              onChange={(e) => setFilters(prev => ({ ...prev, type: e.target.value }))}
              className="input mt-1"
            >
              <option value="">All Types</option>
              {leaveTypes.map(type => (
                <option key={type.id} value={type.name}>{type.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="search" className="block text-sm font-medium text-gray-700">
              Search Employee
            </label>
            <input
              type="text"
              id="search"
              value={filters.search}
              onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
              className="input mt-1"
              placeholder="Search by name or ID..."
            />
          </div>
        </div>
      </div>

      {/* Leave Requests Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead>
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Employee
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Leave Type
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Duration
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
            {filteredLeaves.map((leave) => (
              <tr key={leave.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">
                    {getEmployeeName(leave.employeeId)}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{leave.leaveType}</div>
                  <div className="text-sm text-gray-500">
                    {new Date(leave.startDate).toLocaleDateString()} - {new Date(leave.endDate).toLocaleDateString()}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{leave.duration} days</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-none ${
                    leave.status === 'Approved'
                      ? 'bg-green-100 text-green-800'
                      : leave.status === 'Rejected'
                      ? 'bg-red-100 text-red-800'
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {leave.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  {leave.status === 'Pending' && (
                    <>
                      <button
                        onClick={() => handleApproveLeave(leave)}
                        className="text-green-600 hover:text-green-900 mr-3"
                      >
                        <Check className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleRejectLeave(leave)}
                        className="text-red-600 hover:text-red-900 mr-3"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </>
                  )}
                  <button
                    onClick={() => setEditingLeave(leave)}
                    className="text-brand-600 hover:text-brand-900 mr-3"
                  >
                    <Edit2 className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => leave.id && handleDeleteLeave(leave.id)}
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

      {/* Forms */}
      {(showForm || editingLeave) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-2xl w-full mx-4">
            <h2 className="text-lg font-medium text-gray-900 mb-4">
              {editingLeave ? 'Edit Leave Request' : 'Add New Leave Request'}
            </h2>
            <LeaveForm
              initialData={editingLeave || undefined}
              leaveTypes={leaveTypes}
              onSubmit={editingLeave ? handleUpdateLeave : handleAddLeave}
              onCancel={() => {
                setShowForm(false);
                setEditingLeave(null);
              }}
            />
          </div>
        </div>
      )}

      {/* Leave Type Form Modal */}
      {(showLeaveTypeForm || editingLeaveType) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-2xl w-full mx-4">
            <h2 className="text-lg font-medium text-gray-900 mb-4">
              {editingLeaveType ? 'Edit Leave Type' : 'Add New Leave Type'}
            </h2>
            <LeaveTypeForm
              initialData={editingLeaveType || undefined}
              onSubmit={editingLeaveType ? handleUpdateLeaveType : handleAddLeaveType}
              onCancel={() => {
                setShowLeaveTypeForm(false);
                setEditingLeaveType(null);
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default LeaveManagement;