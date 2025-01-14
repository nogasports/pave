import React, { useState, useEffect } from 'react';
import { Users, Plus, CheckCircle, Clock, Calendar, AlertCircle, ArrowRight } from 'lucide-react';
import { OnboardingProcess, getOnboardingProcesses } from '../../lib/firebase/onboarding';
import { Employee } from '../../lib/firebase/employees';
import OnboardingProcessForm from './OnboardingProcessForm';

interface OnboardingSectionProps {
  employees: Employee[];
  type: 'onboarding' | 'offboarding';
}

const OnboardingSection: React.FC<OnboardingSectionProps> = ({ employees, type }) => {
  const [processes, setProcesses] = useState<OnboardingProcess[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [selectedProcess, setSelectedProcess] = useState<OnboardingProcess | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    status: '',
    search: ''
  });
  // Implement lazy loading for tasks
  const [expandedProcessId, setExpandedProcessId] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, [type]);

  const loadData = async () => {
    try {
      const data = await wrapFirebaseOperation(
        () => getOnboardingProcesses({ type }),
        'Error loading processes'
      );
      setProcesses(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleExpandProcess = async (processId: string) => {
    if (expandedProcessId === processId) {
      setExpandedProcessId(null);
      return;
    }

    setExpandedProcessId(processId);
  };

  const filteredProcesses = processes.filter(process => {
    if (filters.status && process.status !== filters.status) return false;
    if (filters.search) {
      const employee = employees.find(e => e.id === process.employeeId);
      const searchTerm = filters.search.toLowerCase();
      return employee && 
        (`${employee.firstName} ${employee.fatherName}`.toLowerCase().includes(searchTerm) ||
         employee.workEmail?.toLowerCase().includes(searchTerm));
    }
    return true;
  });

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

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 flex items-center">
          <AlertCircle className="h-5 w-5 mr-2" />
          {error}
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
        <div className="card">
          <div className="flex items-center">
            <div className="bg-blue-50 rounded-none p-3">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-gray-500">Total Processes</h3>
              <p className="text-2xl font-semibold text-gray-900">{processes.length}</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="bg-yellow-50 rounded-none p-3">
              <Clock className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-gray-500">In Progress</h3>
              <p className="text-2xl font-semibold text-gray-900">
                {processes.filter(p => p.status === 'in-progress').length}
              </p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="bg-green-50 rounded-none p-3">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-gray-500">Completed</h3>
              <p className="text-2xl font-semibold text-gray-900">
                {processes.filter(p => p.status === 'completed').length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
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
              <option value="pending">Pending</option>
              <option value="in-progress">In Progress</option>
              <option value="completed">Completed</option>
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
              placeholder="Search by name or email..."
            />
          </div>
        </div>
      </div>

      {/* Process List */}
      <div className="space-y-4">
        {processes.length === 0 ? (
          <div className="text-center py-12">
            <Users className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">
              No {type} processes
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              Get started by creating a new {type} process.
            </p>
          </div>
        ) : (
          filteredProcesses.map((process) => (
            <div key={process.id} className="card hover:shadow-md transition-shadow">
              <div className="flex justify-between">
                <div className="space-y-2">
                  <h3 className="text-lg font-medium text-gray-900">
                    {getEmployeeName(process.employeeId)}
                  </h3>
                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-1" />
                      {new Date(process.startDate).toLocaleDateString()}
                    </div>
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 mr-1" />
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
                  <button
                    onClick={() => setSelectedProcess(process)}
                    className="btn btn-secondary"
                  >
                    <ArrowRight className="h-4 w-4" />
                  </button>
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

              {/* Collapsed Task Summary */}
              {expandedProcessId !== process.id && (
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
              )}

              {/* Expanded Task List */}
              {expandedProcessId === process.id && (
                <div className="mt-4 space-y-4">
                  {process.tasks.map((task, index) => (
                    <div key={index} className="bg-gray-50 p-4 rounded-lg">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="text-sm font-medium text-gray-900">{task.title}</h4>
                          <p className="text-sm text-gray-500 mt-1">{task.description}</p>
                        </div>
                        <span className={`px-2 py-1 text-xs font-semibold rounded-none ${
                          task.status === 'completed'
                            ? 'bg-green-100 text-green-800'
                            : task.status === 'in-progress'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {task.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Forms */}
      {(showForm || selectedProcess) && (
        <OnboardingProcessForm
          type={type}
          employees={employees}
          initialData={selectedProcess || undefined}
          onSubmit={async (data) => {
            try {
              if (selectedProcess) {
                await updateOnboardingProcess(selectedProcess.id!, data);
              } else {
                await addOnboardingProcess(data);
              }
              await loadData();
              setShowForm(false);
              setSelectedProcess(null);
            } catch (err) {
              setError('Failed to save process');
            }
          }}
          onCancel={() => {
            setShowForm(false);
            setSelectedProcess(null);
          }}
        />
      )}
    </div>
  );
};

export default OnboardingSection;