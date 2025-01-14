import React, { useState, useEffect } from 'react';
import { BanknoteIcon, Users, Calculator, ArrowUpRight, Plus, Edit2, Trash2 } from 'lucide-react';
import { 
  PayrollRecord, 
  getPayrollRecords, 
  addPayrollRecord, 
  updatePayrollRecord, 
  deletePayrollRecord,
  getFinanceSettings
} from '../../lib/firebase/finance';
import { Employee, getEmployees } from '../../lib/firebase/employees';
import PayrollForm from './PayrollForm';
import { calculatePayroll, calculateDefaultAllowances } from '../../lib/utils/payrollUtils';
import { wrapFirebaseOperation } from '../../lib/utils/errorHandling';

const PayrollManagement: React.FC = () => {
  const [payrollRecords, setPayrollRecords] = useState<PayrollRecord[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [settings, setSettings] = useState<FinanceSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingRecord, setEditingRecord] = useState<PayrollRecord | null>(null);
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));

  useEffect(() => {
    loadData();
  }, [selectedMonth]);

  const loadData = async () => {
    try {
      const [payrollData, employeesData, financeSettings] = await Promise.all([
        wrapFirebaseOperation(
          () => getPayrollRecords(selectedMonth),
          'Error loading payroll records'
        ),
        wrapFirebaseOperation(
          () => getEmployees(),
          'Error loading employees'
        ),
        wrapFirebaseOperation(
          () => getFinanceSettings(),
          'Error loading finance settings'
        )
      ]);
      
      setPayrollRecords(payrollData);
      setEmployees(employeesData);
      setSettings(financeSettings);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleAddPayroll = async (data: Omit<PayrollRecord, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      if (!settings) throw new Error('Finance settings not loaded');

      // Get employee data
      const employee = employees.find(emp => emp.id === data.employeeId);
      if (!employee) throw new Error('Employee not found');

      // Calculate payroll based on employee data
      const payrollData = calculatePayroll({
        baseSalary: employee.salary || 0,
        allowances: calculateDefaultAllowances(employee.position === 'Manager', settings),
        deductions: data.deductions,
        overtime: data.overtime
      }, settings);

      await wrapFirebaseOperation(
        () => addPayrollRecord({
          ...data,
          ...payrollData,
          status: 'Draft'
        }),
        'Error adding payroll record'
      );

      await loadData();
      setShowForm(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add payroll record');
      throw err;
    }
  };

  const handleUpdatePayroll = async (data: Omit<PayrollRecord, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (!editingRecord?.id) return;
    try {
      if (!settings) throw new Error('Finance settings not loaded');

      const employee = employees.find(emp => emp.id === data.employeeId);
      if (!employee) throw new Error('Employee not found');

      const payrollData = calculatePayroll({
        baseSalary: employee.salary || 0,
        allowances: calculateDefaultAllowances(employee.position === 'Manager', settings),
        deductions: data.deductions,
        overtime: data.overtime
      }, settings);

      await wrapFirebaseOperation(
        () => updatePayrollRecord(editingRecord.id!, {
          ...data,
          ...payrollData
        }),
        'Error updating payroll record'
      );

      await loadData();
      setEditingRecord(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update payroll record');
      throw err;
    }
  };

  const handleDeletePayroll = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this payroll record?')) return;
    try {
      await wrapFirebaseOperation(
        () => deletePayrollRecord(id),
        'Error deleting payroll record'
      );
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete payroll record');
    }
  };

  if (loading) return <div>Loading...</div>;
  if (!settings) return <div>Finance settings not loaded</div>;

  // Calculate summary statistics
  const stats = {
    totalPayroll: payrollRecords.reduce((sum, record) => sum + record.netSalary, 0),
    totalEmployees: payrollRecords.length,
    averageSalary: payrollRecords.length > 0
      ? payrollRecords.reduce((sum, record) => sum + record.netSalary, 0) / payrollRecords.length
      : 0,
    pendingApprovals: payrollRecords.filter(record => record.status === 'Pending').length
  };

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <div className="card">
          <div className="flex items-center">
            <div className="bg-blue-50 rounded-none p-3">
              <BanknoteIcon className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-gray-500">Total Payroll</h3>
              <div className="mt-1">
                <p className="text-2xl font-semibold text-gray-900">
                  {stats.totalPayroll.toLocaleString()} ETB
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
              <h3 className="text-sm font-medium text-gray-500">Total Employees</h3>
              <div className="mt-1">
                <p className="text-2xl font-semibold text-gray-900">{stats.totalEmployees}</p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="card">
          <div className="flex items-center">
            <div className="bg-yellow-50 rounded-none p-3">
              <Calculator className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-gray-500">Average Salary</h3>
              <div className="mt-1">
                <p className="text-2xl font-semibold text-gray-900">
                  {stats.averageSalary.toLocaleString()} ETB
                </p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="card">
          <div className="flex items-center">
            <div className="bg-red-50 rounded-none p-3">
              <ArrowUpRight className="h-6 w-6 text-red-600" />
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-gray-500">Pending Approvals</h3>
              <div className="mt-1">
                <p className="text-2xl font-semibold text-gray-900">{stats.pendingApprovals}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <input
            type="month"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="input"
          />
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="btn btn-primary"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Payroll Record
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3">
          {error}
        </div>
      )}

      {/* Payroll Form */}
      {(showForm || editingRecord) && (
        <div className="card">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            {editingRecord ? 'Edit Payroll Record' : 'Add New Payroll Record'}
          </h3>
          <PayrollForm
            initialData={editingRecord || undefined}
            employees={employees}
            settings={settings}
            onSubmit={editingRecord ? handleUpdatePayroll : handleAddPayroll}
            onCancel={() => {
              setShowForm(false);
              setEditingRecord(null);
            }}
          />
        </div>
      )}

      {/* Payroll Records Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead>
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Employee
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Base Salary
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Allowances
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Deductions
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Net Salary
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
            {payrollRecords.map((record) => {
              const employee = employees.find(e => e.id === record.employeeId);
              return (
                <tr key={record.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {employee ? `${employee.firstName} ${employee.fatherName}` : 'Unknown'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {record.baseSalary.toLocaleString()} ETB
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {(record.allowances.transport + 
                        record.allowances.housing + 
                        record.allowances.position).toLocaleString()} ETB
                    </div>
                    <div className="text-xs text-gray-500">
                      T: {record.allowances.transport.toLocaleString()} |
                      H: {record.allowances.housing.toLocaleString()} |
                      P: {record.allowances.position.toLocaleString()}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {(record.deductions.tax + 
                        record.deductions.pension + 
                        record.deductions.other).toLocaleString()} ETB
                    </div>
                    <div className="text-xs text-gray-500">
                      Tax: {record.deductions.tax.toLocaleString()} |
                      Pension: {record.deductions.pension.toLocaleString()}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {record.netSalary.toLocaleString()} ETB
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-none ${
                      record.status === 'Paid'
                        ? 'bg-green-100 text-green-800'
                        : record.status === 'Pending'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {record.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => setEditingRecord(record)}
                      className="text-brand-600 hover:text-brand-900 mr-3"
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => record.id && handleDeletePayroll(record.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PayrollManagement;