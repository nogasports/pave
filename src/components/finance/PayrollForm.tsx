import React, { useState, useEffect } from 'react';
import { PayrollRecord } from '../../lib/firebase/finance';
import { Employee } from '../../lib/firebase/employees';
import { FinanceSettings } from '../../lib/firebase/finance';
import { calculatePayroll, calculateDefaultAllowances } from '../../lib/utils/payrollUtils';

interface PayrollFormProps {
  initialData?: Partial<PayrollRecord>;
  employees: Employee[];
  settings: FinanceSettings;
  onSubmit: (data: Omit<PayrollRecord, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  onCancel: () => void;
}

const PayrollForm: React.FC<PayrollFormProps> = ({
  initialData,
  employees,
  settings,
  onSubmit,
  onCancel,
}) => {
  const [formData, setFormData] = useState({
    employeeId: initialData?.employeeId || '',
    month: initialData?.month || new Date().toISOString().slice(0, 7),
    baseSalary: initialData?.baseSalary || 0,
    allowances: {
      transport: initialData?.allowances?.transport || 0,
      housing: initialData?.allowances?.housing || 0,
      position: initialData?.allowances?.position || 0,
    },
    deductions: {
      tax: initialData?.deductions?.tax || 0,
      pension: initialData?.deductions?.pension || 0,
      other: initialData?.deductions?.other || 0,
    },
    overtime: {
      hours: initialData?.overtime?.hours || 0,
      rate: initialData?.overtime?.rate || 0,
      amount: initialData?.overtime?.amount || 0,
    },
    netSalary: initialData?.netSalary || 0,
    status: initialData?.status || 'Draft',
    notes: initialData?.notes || '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [employeeSearch, setEmployeeSearch] = useState('');
  const [showEmployeeResults, setShowEmployeeResults] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);

  // Update calculations when employee or overtime changes
  useEffect(() => {
    if (selectedEmployee) {
      const isManager = selectedEmployee.position === 'Manager';
      const defaultAllowances = calculateDefaultAllowances(isManager, settings);
      
      const payrollData = calculatePayroll({
        baseSalary: selectedEmployee.salary || 0,
        allowances: defaultAllowances,
        deductions: formData.deductions,
        overtime: formData.overtime
      }, settings);

      setFormData(prev => ({
        ...prev,
        baseSalary: selectedEmployee.salary || 0,
        allowances: defaultAllowances,
        deductions: payrollData.deductions,
        netSalary: payrollData.netSalary
      }));
    }
  }, [selectedEmployee, formData.overtime.hours, formData.overtime.rate]);

  // Filter employees based on search
  const filteredEmployees = employeeSearch.trim()
    ? employees.filter(employee => {
        const fullName = `${employee.firstName || ''} ${employee.fatherName || ''}`.toLowerCase();
        return fullName.includes(employeeSearch.toLowerCase());
      })
    : employees;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (!selectedEmployee) {
        throw new Error('Please select an employee');
      }

      const payrollData = calculatePayroll({
        baseSalary: formData.baseSalary,
        allowances: formData.allowances,
        deductions: formData.deductions,
        overtime: formData.overtime
      }, settings);

      await onSubmit({
        ...formData,
        ...payrollData
      } as PayrollRecord);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div>
          <label htmlFor="employeeSearch" className="block text-sm font-medium text-gray-700">
            Employee
          </label>
          <div className="relative">
            <input
              type="text"
              id="employeeSearch"
              value={selectedEmployee ? `${selectedEmployee.firstName} ${selectedEmployee.fatherName}` : employeeSearch}
              onChange={(e) => {
                setEmployeeSearch(e.target.value);
                setSelectedEmployee(null);
                setShowEmployeeResults(true);
              }}
              onFocus={() => {
                if (selectedEmployee) {
                  setEmployeeSearch(`${selectedEmployee.firstName} ${selectedEmployee.fatherName}`);
                  setSelectedEmployee(null);
                }
                setShowEmployeeResults(true);
              }}
              className="input mt-1"
              placeholder="Search employee..."
              required
            />
            {showEmployeeResults && filteredEmployees.length > 0 && (
              <div className="absolute z-10 w-full bg-white mt-1 border border-gray-200 rounded-none shadow-lg">
                {filteredEmployees.map(employee => (
                  <div
                    key={employee.id}
                    className="px-4 py-2 hover:bg-gray-50 cursor-pointer"
                    onClick={() => {
                      setSelectedEmployee(employee);
                      setFormData(prev => ({
                        ...prev,
                        employeeId: employee.id || ''
                      }));
                      setEmployeeSearch('');
                      setShowEmployeeResults(false);
                    }}
                  >
                    {`${employee.firstName || ''} ${employee.fatherName || ''}`.trim()}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div>
          <label htmlFor="month" className="block text-sm font-medium text-gray-700">
            Month
          </label>
          <input
            type="month"
            id="month"
            value={formData.month}
            onChange={(e) => setFormData(prev => ({ ...prev, month: e.target.value }))}
            className="input mt-1"
            required
          />
        </div>
      </div>

      <div>
        <label htmlFor="baseSalary" className="block text-sm font-medium text-gray-700">
          Base Salary
        </label>
        <input
          type="number"
          id="baseSalary"
          value={formData.baseSalary}
          className="input mt-1 bg-gray-100"
          disabled
        />
      </div>

      <div className="space-y-4">
        <h4 className="text-sm font-medium text-gray-900">Allowances</h4>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div>
            <label htmlFor="transportAllowance" className="block text-sm font-medium text-gray-700">
              Transport
            </label>
            <input
              type="number"
              id="transportAllowance"
              value={formData.allowances.transport}
              className="input mt-1 bg-gray-100"
              disabled
            />
          </div>
          <div>
            <label htmlFor="housingAllowance" className="block text-sm font-medium text-gray-700">
              Housing
            </label>
            <input
              type="number"
              id="housingAllowance"
              value={formData.allowances.housing}
              className="input mt-1 bg-gray-100"
              disabled
            />
          </div>
          <div>
            <label htmlFor="positionAllowance" className="block text-sm font-medium text-gray-700">
              Position
            </label>
            <input
              type="number"
              id="positionAllowance"
              value={formData.allowances.position}
              className="input mt-1 bg-gray-100"
              disabled
            />
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h4 className="text-sm font-medium text-gray-900">Overtime</h4>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div>
            <label htmlFor="overtimeHours" className="block text-sm font-medium text-gray-700">
              Hours
            </label>
            <input
              type="number"
              id="overtimeHours"
              value={formData.overtime.hours}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                overtime: {
                  ...prev.overtime,
                  hours: Number(e.target.value)
                }
              }))}
              className="input mt-1"
              min="0"
              step="0.5"
            />
          </div>
          <div>
            <label htmlFor="overtimeRate" className="block text-sm font-medium text-gray-700">
              Rate per Hour
            </label>
            <input
              type="number"
              id="overtimeRate"
              value={formData.overtime.rate}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                overtime: {
                  ...prev.overtime,
                  rate: Number(e.target.value)
                }
              }))}
              className="input mt-1"
              min="0"
              step="0.01"
            />
          </div>
          <div>
            <label htmlFor="overtimeAmount" className="block text-sm font-medium text-gray-700">
              Amount
            </label>
            <input
              type="number"
              id="overtimeAmount"
              value={formData.overtime.amount}
              className="input mt-1 bg-gray-100"
              disabled
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div>
          <label htmlFor="netSalary" className="block text-sm font-medium text-gray-700">
            Net Salary
          </label>
          <input
            type="number"
            id="netSalary"
            value={formData.netSalary}
            className="input mt-1 bg-gray-100"
            disabled
          />
        </div>

        <div>
          <label htmlFor="status" className="block text-sm font-medium text-gray-700">
            Status
          </label>
          <select
            id="status"
            value={formData.status}
            onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as PayrollRecord['status'] }))}
            className="input mt-1"
            required
          >
            <option value="Draft">Draft</option>
            <option value="Pending">Pending</option>
            <option value="Approved">Approved</option>
            <option value="Paid">Paid</option>
          </select>
        </div>
      </div>

      <div>
        <label htmlFor="notes" className="block text-sm font-medium text-gray-700">
          Notes
        </label>
        <textarea
          id="notes"
          value={formData.notes}
          onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
          className="input mt-1"
          rows={3}
        />
      </div>

      <div className="flex justify-end space-x-3">
        <button
          type="button"
          onClick={onCancel}
          className="btn btn-secondary"
          disabled={loading}
        >
          Cancel
        </button>
        <button
          type="submit"
          className="btn btn-primary"
          disabled={loading}
        >
          {loading ? 'Saving...' : initialData ? 'Update Payroll' : 'Add Payroll'}
        </button>
      </div>
    </form>
  );
};

export default PayrollForm;