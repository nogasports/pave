import React, { useState, useEffect } from 'react';
import { Receipt, Users, Calendar, ArrowUpRight, Plus, Edit2, Trash2 } from 'lucide-react';
import { MedicalReimbursement, getMedicalReimbursements, addMedicalReimbursement, updateMedicalReimbursement } from '../../lib/firebase/finance';
import { Employee, getEmployees } from '../../lib/firebase/employees';
import MedicalReimbursementForm from './MedicalReimbursementForm';

interface MedicalReimbursementsProps {
  onAddReimbursement?: (data: Omit<MedicalReimbursement, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
}

const MedicalReimbursements: React.FC<MedicalReimbursementsProps> = ({ onAddReimbursement }) => {
  const [reimbursements, setReimbursements] = useState<MedicalReimbursement[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingReimbursement, setEditingReimbursement] = useState<MedicalReimbursement | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [reimbursementsData, employeesData] = await Promise.all([
        getMedicalReimbursements(),
        getEmployees()
      ]);
      setReimbursements(reimbursementsData);
      setEmployees(employeesData);
    } catch (err) {
      setError('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const getEmployeeName = (employeeId: string): string => {
    const employee = employees.find(e => e.id === employeeId);
    if (!employee) return 'Unknown Employee';
    return `${employee.firstName || ''} ${employee.fatherName || ''}`.trim();
  };

  // Calculate summary statistics
  const stats = {
    totalReimbursements: reimbursements.reduce((sum, r) => sum + r.amount, 0),
    pendingRequests: reimbursements.filter(r => r.status === 'Pending').length,
    approvedRequests: reimbursements.filter(r => r.status === 'Approved').length,
    totalEmployees: new Set(reimbursements.map(r => r.employeeId)).size
  };

  const handleAddReimbursement = async (data: Omit<MedicalReimbursement, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      if (onAddReimbursement) {
        await onAddReimbursement(data);
      } else {
        await addMedicalReimbursement(data);
      }
      await loadData();
      setShowForm(false);
    } catch (err) {
      setError('Failed to add reimbursement');
    }
  };

  const handleUpdateReimbursement = async (data: MedicalReimbursement) => {
    try {
      await updateMedicalReimbursement(data);
      await loadData();
      setEditingReimbursement(null);
    } catch (err) {
      setError('Failed to update reimbursement');
    }
  };

  const handleDeleteReimbursement = async (id: string) => {
    try {
      // Implement delete logic here
      await loadData();
    } catch (err) {
      setError('Failed to delete reimbursement');
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <div className="card">
          <div className="flex items-center">
            <div className="bg-blue-50 rounded-none p-3">
              <Receipt className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-gray-500">Total Reimbursements</h3>
              <div className="mt-1">
                <p className="text-2xl font-semibold text-gray-900">
                  {stats.totalReimbursements.toLocaleString()} ETB
                </p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="card">
          <div className="flex items-center">
            <div className="bg-yellow-50 rounded-none p-3">
              <Calendar className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-gray-500">Pending Requests</h3>
              <div className="mt-1">
                <p className="text-2xl font-semibold text-gray-900">{stats.pendingRequests}</p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="card">
          <div className="flex items-center">
            <div className="bg-green-50 rounded-none p-3">
              <ArrowUpRight className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-gray-500">Approved Requests</h3>
              <div className="mt-1">
                <p className="text-2xl font-semibold text-gray-900">{stats.approvedRequests}</p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="card">
          <div className="flex items-center">
            <div className="bg-indigo-50 rounded-none p-3">
              <Users className="h-6 w-6 text-indigo-600" />
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-gray-500">Total Employees</h3>
              <div className="mt-1">
                <p className="text-2xl font-semibold text-gray-900">{stats.totalEmployees}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-medium text-gray-900">Medical Reimbursement Requests</h2>
        <button
          onClick={() => setShowForm(true)}
          className="btn btn-primary"
        >
          <Plus className="h-4 w-4 mr-2" />
          New Reimbursement Request
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3">
          {error}
        </div>
      )}

      {/* Reimbursement Form */}
      {(showForm || editingReimbursement) && (
        <div className="card">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            {editingReimbursement ? 'Edit Reimbursement Request' : 'New Reimbursement Request'}
          </h3>
          <MedicalReimbursementForm
            initialData={editingReimbursement || undefined}
            employees={employees}
            onSubmit={handleAddReimbursement}
            onCancel={() => {
              setShowForm(false);
              setEditingReimbursement(null);
            }}
          />
        </div>
      )}

      {/* Reimbursements Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead>
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Employee
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Expense Details
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Amount
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
            {reimbursements.map((reimbursement) => (
              <tr key={reimbursement.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">
                    {getEmployeeName(reimbursement.employeeId)}
                  </div>
                  <div className="text-sm text-gray-500">
                    Submitted: {new Date(reimbursement.createdAt).toLocaleDateString()}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {reimbursement.description}
                  </div>
                  <div className="text-sm text-gray-500">
                    Date: {new Date(reimbursement.expenseDate).toLocaleDateString()}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {reimbursement.amount.toLocaleString()} ETB
                  </div>
                  {reimbursement.receiptUrl && (
                    <a
                      href={reimbursement.receiptUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-brand-600 hover:text-brand-900"
                    >
                      View Receipt
                    </a>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-none ${
                    reimbursement.status === 'Approved'
                      ? 'bg-green-100 text-green-800'
                      : reimbursement.status === 'Rejected'
                      ? 'bg-red-100 text-red-800'
                      : reimbursement.status === 'Paid'
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {reimbursement.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button
                    onClick={() => setEditingReimbursement(reimbursement)}
                    className="text-brand-600 hover:text-brand-900 mr-3"
                  >
                    <Edit2 className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => reimbursement.id && handleDeleteReimbursement(reimbursement.id)}
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
    </div>
  );
};

export default MedicalReimbursements;