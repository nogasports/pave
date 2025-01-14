import React, { useState, useEffect } from 'react';
import { FileText, CreditCard, Plus, BanknoteIcon, Wallet, Building2 } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { Employee, getEmployees } from '../../lib/firebase/employees';
import { Department, getDepartments } from '../../lib/firebase/departments';
import { 
  PayrollRecord, 
  getPayrollRecords,
  SalaryAdvance,
  getSalaryAdvances,
  addSalaryAdvance,
  getFinanceSettings
} from '../../lib/firebase/finance';
import SalaryAdvanceForm from '../../components/finance/SalaryAdvanceForm';

const StaffFinance: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'compensation' | 'banking' | 'payroll' | 'advances'>('compensation');
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [payslips, setPayslips] = useState<PayrollRecord[]>([]);
  const [advances, setAdvances] = useState<SalaryAdvance[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAdvanceForm, setShowAdvanceForm] = useState(false);
  const [settings, setSettings] = useState<any>(null);

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

      // Load financial data
      const [payrollData, advancesData, departmentsData, settingsData] = await Promise.all([
        getPayrollRecords(undefined, currentEmployee.id),
        getSalaryAdvances(currentEmployee.id),
        getDepartments(),
        getFinanceSettings()
      ]);

      setPayslips(payrollData);
      setAdvances(advancesData);
      setDepartments(departmentsData);
      setSettings(settingsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleAdvanceRequest = async (data: Omit<SalaryAdvance, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (!employee?.id) return;
    setLoading(true);
    try {
      await addSalaryAdvance({
        ...data,
        employeeId: employee.id
      });
      await loadData();
      setShowAdvanceForm(false);
    } catch (err) {
      setError('Failed to submit advance request');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div className="text-red-600">{error}</div>;
  if (!employee) return <div>No employee record found</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-900">Finance Management</h1>
        <div className="flex space-x-3">
          {/* Only show request button if no active advances */}
          {!advances.some(a => a.status === 'Approved' && !a.repaid) && (
            <button
              onClick={() => setShowAdvanceForm(true)}
              className="btn btn-secondary"
            >
              <CreditCard className="h-4 w-4 mr-2" />
              Request Advance
            </button>
          )}
        </div>
      </div>

      {/* Summary Card */}
      <div className="card">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Finance Summary</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div>
            <label className="block text-sm font-medium text-gray-500">Monthly Salary</label>
            <div className="mt-1 text-lg font-semibold text-gray-900">
              {employee?.salary?.toLocaleString()} {employee?.salaryCurrency}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-500">Active Advances</label>
            <div className="mt-1 text-lg font-semibold text-gray-900">
              {advances.filter(a => a.status === 'Approved' && !a.repaid).length}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-500">Latest Payslip</label>
            <div className="mt-1 text-lg font-semibold text-gray-900">
              {payslips[0]?.netSalary.toLocaleString()} ETB
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('compensation')}
            className={`
              group inline-flex items-center py-4 px-1 border-b-2 font-medium text-sm
              ${activeTab === 'compensation'
                ? 'border-brand-600 text-brand-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}
            `}
          >
            <Wallet className="h-5 w-5 mr-2" />
            Compensation
          </button>
          <button
            onClick={() => setActiveTab('banking')}
            className={`
              group inline-flex items-center py-4 px-1 border-b-2 font-medium text-sm
              ${activeTab === 'banking'
                ? 'border-brand-600 text-brand-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}
            `}
          >
            <Building2 className="h-5 w-5 mr-2" />
            Banking Details
          </button>
          <button
            onClick={() => setActiveTab('payroll')}
            className={`
              group inline-flex items-center py-4 px-1 border-b-2 font-medium text-sm
              ${activeTab === 'payroll'
                ? 'border-brand-600 text-brand-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}
            `}
          >
            <BanknoteIcon className="h-5 w-5 mr-2" />
            Payroll & History
          </button>
          <button
            onClick={() => setActiveTab('advances')}
            className={`
              group inline-flex items-center py-4 px-1 border-b-2 font-medium text-sm
              ${activeTab === 'advances'
                ? 'border-brand-600 text-brand-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}
            `}
          >
            <CreditCard className="h-5 w-5 mr-2" />
            Salary Advances
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'compensation' && (
        <div className="card">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Compensation Details</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div>
              <label className="block text-sm font-medium text-gray-500">Base Salary</label>
              <div className="mt-1 text-lg font-semibold text-gray-900">
                {employee?.salary?.toLocaleString()} {employee?.salaryCurrency}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500">Transport Allowance</label>
              <div className="mt-1 text-lg font-semibold text-gray-900">
                {employee?.transportAllowance?.toLocaleString()} {employee?.salaryCurrency}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500">Housing Allowance</label>
              <div className="mt-1 text-lg font-semibold text-gray-900">
                {employee?.housingAllowance?.toLocaleString()} {employee?.salaryCurrency}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500">Position Allowance</label>
              <div className="mt-1 text-lg font-semibold text-gray-900">
                {employee?.positionAllowance?.toLocaleString()} {employee?.salaryCurrency}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500">Pay Frequency</label>
              <div className="mt-1 text-lg font-semibold text-gray-900">
                {employee?.payFrequency}
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'banking' && (
        <div className="card">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Banking Details</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-500">Bank Name</label>
              <div className="mt-1 text-sm text-gray-900">{employee?.bankDetails?.bankName || 'Not set'}</div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500">Account Number</label>
              <div className="mt-1 text-sm text-gray-900">{employee?.bankDetails?.accountNumber || 'Not set'}</div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500">Account Type</label>
              <div className="mt-1 text-sm text-gray-900">{employee?.bankDetails?.accountType || 'Not set'}</div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500">Branch</label>
              <div className="mt-1 text-sm text-gray-900">{employee?.bankDetails?.branch || 'Not set'}</div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'payroll' && (
        <div className="card">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Payroll History</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Month
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
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {payslips.map((payslip) => (
                  <tr key={payslip.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {payslip.month}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {payslip.baseSalary.toLocaleString()} ETB
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {(payslip.allowances.transport + 
                          payslip.allowances.housing + 
                          payslip.allowances.position).toLocaleString()} ETB
                      </div>
                      <div className="text-xs text-gray-500">
                        T: {payslip.allowances.transport.toLocaleString()} |
                        H: {payslip.allowances.housing.toLocaleString()} |
                        P: {payslip.allowances.position.toLocaleString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {(payslip.deductions.tax + 
                          payslip.deductions.pension + 
                          payslip.deductions.other).toLocaleString()} ETB
                      </div>
                      <div className="text-xs text-gray-500">
                        Tax: {payslip.deductions.tax.toLocaleString()} |
                        Pension: {payslip.deductions.pension.toLocaleString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {payslip.netSalary.toLocaleString()} ETB
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-none ${
                        payslip.status === 'Paid'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {payslip.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'advances' && (
        <div className="card">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Salary Advances</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Request Date
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
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Progress
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {advances.map((advance) => {
                  // Calculate remaining months
                  const startDate = new Date(advance.repaymentDate);
                  const endDate = new Date(startDate);
                  endDate.setMonth(startDate.getMonth() + advance.installments);
                  const now = new Date();
                  const totalMonths = advance.installments;
                  const monthsPassed = Math.max(0, Math.min(
                    totalMonths,
                    Math.floor((now.getTime() - startDate.getTime()) / (30 * 24 * 60 * 60 * 1000))
                  ));
                  const remainingMonths = Math.max(0, totalMonths - monthsPassed);
                  const progress = (monthsPassed / totalMonths) * 100;

                  return (
                    <tr key={advance.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {new Date(advance.requestDate).toLocaleDateString()}
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
                        {advance.status === 'Approved' && !advance.repaid && (
                          <div className="text-sm text-brand-600">
                            {remainingMonths} months remaining
                          </div>
                        )}
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
                      <td className="px-6 py-4 whitespace-nowrap">
                        {advance.status === 'Approved' && !advance.repaid && (
                          <div className="w-full bg-gray-200 rounded-full h-2.5">
                            <div
                              className="bg-brand-600 h-2.5 rounded-full"
                              style={{ width: `${progress}%` }}
                            />
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
      )}

      {/* Forms */}
      {showAdvanceForm && (
        <div className="card">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Request Salary Advance</h2>
          {employee && (
            <SalaryAdvanceForm
              employees={[employee]}
              onSubmit={handleAdvanceRequest}
              onCancel={() => setShowAdvanceForm(false)}
            />
          )}
        </div>
      )}
    </div>
  );
};

export default StaffFinance;