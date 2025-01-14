import React, { useState, useEffect } from 'react';
import { CreditCard, Users, Calendar, ArrowUpRight, Plus, Edit2, Trash2 } from 'lucide-react';
import { SalaryAdvance, getSalaryAdvances, addSalaryAdvance, updateSalaryAdvance, deleteSalaryAdvance } from '../../lib/firebase/finance';
import { Employee, getEmployees } from '../../lib/firebase/employees';
import SalaryAdvanceForm from './SalaryAdvanceForm';

interface SalaryAdvancesProps {
  onAddAdvance?: (data: Omit<SalaryAdvance, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
}

const SalaryAdvances: React.FC<SalaryAdvancesProps> = ({ onAddAdvance }) => {
  const [advances, setAdvances] = useState<SalaryAdvance[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingAdvance, setEditingAdvance] = useState<SalaryAdvance | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [advancesData, employeesData] = await Promise.all([
        getSalaryAdvances(),
        getEmployees()
      ]);
      setAdvances(advancesData);
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

  const handleAddAdvance = async (data: Omit<SalaryAdvance, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      if (onAddAdvance) {
        await onAddAdvance(data);
      } else {
        await addSalaryAdvance(data);
      }
      await loadData();
      setShowForm(false);
    } catch (err) {
      setError('Failed to add advance request');
    }
  };

  const handleUpdateAdvance = async (data: SalaryAdvance) => {
    try {
      await updateSalaryAdvance(data);
      await loadData();
      setEditingAdvance(null);
    } catch (err) {
      setError('Failed to update advance request');
    }
  };

  const handleDeleteAdvance = async (id: string) => {
    try {
      await deleteSalaryAdvance(id);
      await loadData();
    } catch (err) {
      setError('Failed to delete advance request');
    }
  };

  // Calculate summary statistics
  const stats = {
    totalAdvances: advances.reduce((sum, advance) => sum + advance.amount, 0),
    pendingRequests: advances.filter(a => a.status === 'Pending').length,
    activeAdvances: advances.filter(a => a.status === 'Approved').length,
    totalEmployees: new Set(advances.map(a => a.employeeId)).size
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <div className="card">
          <div className="flex items-center">
            <div className="bg-blue-50 rounded-none p-3">
              <CreditCard className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-gray-500">Total Advances</h3>
              <div className="mt-1">
                <p className="text-2xl font-semibold text-gray-900">
                  {stats.totalAdvances.toLocaleString()} ETB
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
              <h3 className="text-sm font-medium text-gray-500">Active Advances</h3>
              <div className="mt-1">
                <p className="text-2xl font-semibold text-gray-900">{stats.activeAdvances}</p>
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
        <h2 className="text-lg font-medium text-gray-900">Salary Advance Requests</h2>
        <button
          onClick={() => setShowForm(true)}
          className="btn btn-primary"
        >
          <Plus className="h-4 w-4 mr-2" />
          New Advance Request
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3">
          {error}
        </div>
      )}

      {/* Advance Request Form */}
      {(showForm || editingAdvance) && (
        <div className="card">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            {editingAdvance ? 'Edit Advance Request' : 'New Advance Request'}
          </h3>
          <SalaryAdvanceForm
            initialData={editingAdvance || undefined}
            employees={employees}
            onSubmit={handleAddAdvance}
            onCancel={() => {
              setShowForm(false);
              setEditingAdvance(null);
            }}
          />
        </div>
      )}

      {/* Advances Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead>
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Employee
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Amount
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Repayment
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
            {advances.map((advance) => (
              <tr key={advance.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">
                    {getEmployeeName(advance.employeeId)}
                  </div>
                  <div className="text-sm text-gray-500">
                    Requested: {new Date(advance.requestDate).toLocaleDateString()}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {advance.amount.toLocaleString()} ETB
                  </div>
                  <div className="text-sm text-gray-500">
                    {advance.reason}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {advance.installments} installments
                  </div>
                  <div className="text-sm text-gray-500">
                    {advance.monthlyDeduction.toLocaleString()} ETB/month
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-none ${
                    advance.status === 'Approved'
                      ? 'bg-green-100 text-green-800'
                      : advance.status === 'Rejected'
                      ? 'bg-red-100 text-red-800'
                      : advance.status === 'Paid'
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {advance.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button
                    onClick={() => setEditingAdvance(advance)}
                    className="text-brand-600 hover:text-brand-900 mr-3"
                  >
                    <Edit2 className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => advance.id && handleDeleteAdvance(advance.id)}
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

export default SalaryAdvances;