import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import { Shift, getShifts, addShift, updateShift, deleteShift } from '../../lib/firebase/workManagement';
import ShiftForm from './ShiftForm';

const ShiftManagement: React.FC = () => {
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingShift, setEditingShift] = useState<Shift | null>(null);

  useEffect(() => {
    loadShifts();
  }, []);

  const loadShifts = async () => {
    try {
      const data = await getShifts();
      setShifts(data);
    } catch (err) {
      setError('Failed to load shifts');
    } finally {
      setLoading(false);
    }
  };

  const handleAddShift = async (data: Omit<Shift, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      await addShift(data);
      await loadShifts();
      setShowForm(false);
    } catch (err) {
      setError('Failed to add shift');
    }
  };

  const handleUpdateShift = async (data: Omit<Shift, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (!editingShift?.id) return;
    try {
      await updateShift(editingShift.id, data);
      await loadShifts();
      setEditingShift(null);
    } catch (err) {
      setError('Failed to update shift');
    }
  };

  const handleDeleteShift = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this shift?')) return;
    try {
      await deleteShift(id);
      await loadShifts();
    } catch (err) {
      setError('Failed to delete shift');
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-medium text-gray-900">Shift Schedules</h2>
        <button
          onClick={() => setShowForm(true)}
          className="btn btn-primary"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Shift
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3">
          {error}
        </div>
      )}

      {(showForm || editingShift) && (
        <div className="card">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            {editingShift ? 'Edit Shift' : 'Add New Shift'}
          </h3>
          <ShiftForm
            initialData={editingShift || undefined}
            onSubmit={editingShift ? handleUpdateShift : handleAddShift}
            onCancel={() => {
              setShowForm(false);
              setEditingShift(null);
            }}
          />
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {shifts.map((shift) => (
          <div key={shift.id} className="card">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-lg font-medium text-gray-900">{shift.name}</h3>
                <p className="text-sm text-gray-500">{shift.description}</p>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => setEditingShift(shift)}
                  className="text-gray-400 hover:text-brand-600"
                >
                  <Edit2 className="h-5 w-5" />
                </button>
                <button
                  onClick={() => shift.id && handleDeleteShift(shift.id)}
                  className="text-gray-400 hover:text-red-600"
                >
                  <Trash2 className="h-5 w-5" />
                </button>
              </div>
            </div>

            <div className="mt-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Time</span>
                <span className="text-gray-900">{shift.startTime} - {shift.endTime}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Break</span>
                <span className="text-gray-900">{shift.breakDuration} minutes</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Work Days</span>
                <span className="text-gray-900">{shift.workDays.join(', ')}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ShiftManagement;