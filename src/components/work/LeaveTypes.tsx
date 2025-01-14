import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import { LeaveType, getLeaveTypes, addLeaveType, updateLeaveType, deleteLeaveType } from '../../lib/firebase/leaveTypes';
import LeaveTypeForm from './LeaveTypeForm';

const LeaveTypes: React.FC = () => {
  const [leaveTypes, setLeaveTypes] = useState<LeaveType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingLeaveType, setEditingLeaveType] = useState<LeaveType | null>(null);

  useEffect(() => {
    loadLeaveTypes();
  }, []);

  const loadLeaveTypes = async () => {
    try {
      const data = await getLeaveTypes();
      setLeaveTypes(data);
    } catch (err) {
      setError('Failed to load leave types');
    } finally {
      setLoading(false);
    }
  };

  const handleAddLeaveType = async (data: Omit<LeaveType, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      await addLeaveType(data);
      await loadLeaveTypes();
      setShowForm(false);
    } catch (err) {
      setError('Failed to add leave type');
    }
  };

  const handleUpdateLeaveType = async (data: Omit<LeaveType, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (!editingLeaveType?.id) return;
    try {
      await updateLeaveType(editingLeaveType.id, data);
      await loadLeaveTypes();
      setEditingLeaveType(null);
    } catch (err) {
      setError('Failed to update leave type');
    }
  };

  const handleDeleteLeaveType = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this leave type?')) return;
    try {
      await deleteLeaveType(id);
      await loadLeaveTypes();
    } catch (err) {
      setError('Failed to delete leave type');
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-medium text-gray-900">Leave Types</h2>
        <button
          onClick={() => setShowForm(true)}
          className="btn btn-primary"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Leave Type
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3">
          {error}
        </div>
      )}

      {(showForm || editingLeaveType) && (
        <div className="card">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            {editingLeaveType ? 'Edit Leave Type' : 'Add New Leave Type'}
          </h3>
          <LeaveTypeForm
            initialData={editingLeaveType || undefined}
            onSubmit={editingLeaveType ? handleUpdateLeaveType : handleAddLeaveType}
            onCancel={() => {
              setShowForm(false);
              setEditingLeaveType(null);
            }}
          />
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {leaveTypes.map((type) => (
          <div key={type.id} className="card">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-lg font-medium text-gray-900">{type.name}</h3>
                <p className="text-sm text-gray-500 mt-1">{type.description}</p>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => setEditingLeaveType(type)}
                  className="text-gray-400 hover:text-brand-600"
                >
                  <Edit2 className="h-5 w-5" />
                </button>
                <button
                  onClick={() => type.id && handleDeleteLeaveType(type.id)}
                  className="text-gray-400 hover:text-red-600"
                >
                  <Trash2 className="h-5 w-5" />
                </button>
              </div>
            </div>
            <div className="mt-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Days per Year</span>
                <span className="font-medium text-gray-900">{type.daysPerYear}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Carry Forward</span>
                <span className="font-medium text-gray-900">
                  {type.carryForward ? `Yes (max ${type.maxCarryForwardDays} days)` : 'No'}
                </span>
              </div>
              {type.minServiceDays > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Min. Service Required</span>
                  <span className="font-medium text-gray-900">{type.minServiceDays} days</span>
                </div>
              )}
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Pro-rated</span>
                <span className="font-medium text-gray-900">{type.proRated ? 'Yes' : 'No'}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Status</span>
                <span className={`font-medium ${type.active ? 'text-green-600' : 'text-red-600'}`}>
                  {type.active ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LeaveTypes;