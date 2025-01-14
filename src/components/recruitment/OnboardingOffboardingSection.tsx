import React, { useState, useEffect } from 'react';
import { Search, Plus, Users, CheckCircle, Clock } from 'lucide-react';
import { OnboardingProcess, getOnboardingProcesses, addOnboardingProcess } from '../../lib/firebase/onboarding';
import { Employee, getEmployees } from '../../lib/firebase/employees';
import OnboardingProcessForm from './OnboardingProcessForm';

interface OnboardingOffboardingSectionProps {
  type: 'onboarding' | 'offboarding';
}

const OnboardingOffboardingSection: React.FC<OnboardingOffboardingSectionProps> = ({ type }) => {
  const [processes, setProcesses] = useState<OnboardingProcess[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [selectedProcess, setSelectedProcess] = useState<OnboardingProcess | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [employeeSearch, setEmployeeSearch] = useState('');
  const [showEmployeeResults, setShowEmployeeResults] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);

  useEffect(() => {
    loadData();
  }, [type]);

  const loadData = async () => {
    try {
      const [processesData, employeesData] = await Promise.all([
        getOnboardingProcesses({ type }),
        getEmployees()
      ]);
      setProcesses(processesData);
      setEmployees(employeesData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  // Filter employees based on search
  const filteredEmployees = employeeSearch.trim()
    ? employees.filter(employee => {
        const fullName = `${employee.firstName || ''} ${employee.fatherName || ''}`.toLowerCase();
        return fullName.includes(employeeSearch.toLowerCase());
      })
    : [];

  const handleAddProcess = async (data: Omit<OnboardingProcess, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      await addOnboardingProcess(data);
      await loadData();
      setShowForm(false);
    } catch (err) {
      setError('Failed to create process');
    }
  };

  const getEmployeeName = (id: string) => {
    const employee = employees.find(e => e.id === id);
    return employee ? `${employee.firstName} ${employee.fatherName}` : 'Unknown';
  };

  const getProgressPercentage = (process: OnboardingProcess) => {
    const completedTasks = process.tasks.filter(t => t.status === 'completed').length;
    return process.tasks.length > 0 
      ? Math.round((completedTasks / process.tasks.length) * 100)
      : 0;
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-medium text-gray-900">
          {type === 'onboarding' ? 'Employee Onboarding' : 'Employee Offboarding'}
        </h2>
        <button
          onClick={() => setShowForm(true)}
          className="btn btn-primary"
        >
          <Plus className="h-4 w-4 mr-2" />
          New {type === 'onboarding' ? 'Onboarding' : 'Offboarding'}
        </button>
      </div>

      {/* Employee Search */}
      <div className="card">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            value={employeeSearch}
            onChange={(e) => {
              setEmployeeSearch(e.target.value);
              setShowEmployeeResults(true);
            }}
            className="input pl-10"
            placeholder="Search employees..."
          />
          {showEmployeeResults && filteredEmployees.length > 0 && (
            <div className="absolute z-10 w-full mt-1 bg-white shadow-lg rounded-lg border border-gray-200">
              {filteredEmployees.map(employee => (
                <div
                  key={employee.id}
                  className="px-4 py-2 hover:bg-gray-50 cursor-pointer"
                  onClick={() => {
                    setSelectedEmployee(employee);
                    setShowForm(true);
                    setEmployeeSearch('');
                    setShowEmployeeResults(false);
                  }}
                >
                  <div className="font-medium">{employee.firstName} {employee.fatherName}</div>
                  <div className="text-sm text-gray-500">{employee.jobTitle}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Process List */}
      <div className="space-y-4">
        {processes.map((process) => (
          <div key={process.id} className="card hover:shadow-md transition-shadow">
            <div className="flex justify-between">
              <div>
                <h3 className="text-lg font-medium text-gray-900">
                  {getEmployeeName(process.employeeId)}
                </h3>
                <div className="mt-2 flex items-center space-x-4 text-sm text-gray-500">
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 mr-1" />
                    Start: {new Date(process.startDate).toLocaleDateString()}
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="h-4 w-4 mr-1" />
                    Target: {new Date(process.targetDate).toLocaleDateString()}
                  </div>
                </div>
              </div>
              <div className="flex items-start space-x-4">
                <div className="text-right">
                  <span className={`px-2 py-1 text-xs font-semibold rounded-none ${
                    process.status === 'completed'
                      ? 'bg-green-100 text-green-800'
                      : process.status === 'in-progress'
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {process.status}
                  </span>
                  <div className="mt-2 text-sm text-gray-500">
                    {getProgressPercentage(process)}% Complete
                  </div>
                </div>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="mt-4">
              <div className="w-full bg-gray-200 rounded-none h-2">
                <div 
                  className="bg-brand-600 rounded-none h-2 transition-all duration-300"
                  style={{ width: `${getProgressPercentage(process)}%` }}
                />
              </div>
            </div>

            {/* Tasks Summary */}
            <div className="mt-4 grid grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-sm font-medium text-gray-900">
                  {process.tasks.length}
                </div>
                <div className="text-sm text-gray-500">Total Tasks</div>
              </div>
              <div className="text-center">
                <div className="text-sm font-medium text-gray-900">
                  {process.tasks.filter(t => t.status === 'completed').length}
                </div>
                <div className="text-sm text-gray-500">Completed</div>
              </div>
              <div className="text-center">
                <div className="text-sm font-medium text-gray-900">
                  {process.tasks.filter(t => t.status === 'pending').length}
                </div>
                <div className="text-sm text-gray-500">Pending</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Forms */}
      {(showForm || selectedProcess) && (
        <OnboardingProcessForm
          type={type}
          employees={selectedEmployee ? [selectedEmployee] : employees}
          preselectedEmployee={selectedEmployee}
          initialData={selectedProcess || undefined}
          onSubmit={handleAddProcess}
          onCancel={() => {
            setShowForm(false);
            setSelectedProcess(null);
            setSelectedEmployee(null);
          }}
        />
      )}
    </div>
  );
};

export default OnboardingOffboardingSection;