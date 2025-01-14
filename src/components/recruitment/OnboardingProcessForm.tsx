import React, { useState } from 'react';
import { Plus, Minus } from 'lucide-react';
import { OnboardingProcess, OnboardingTask } from '../../lib/firebase/onboarding';
import { Employee } from '../../lib/firebase/employees';

interface OnboardingProcessFormProps {
  type: 'onboarding' | 'offboarding';
  employees: Employee[];
  preselectedEmployee?: Employee | null;
  initialData?: Partial<OnboardingProcess>;
  onSubmit: (data: Omit<OnboardingProcess, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  onCancel: () => void;
}

const OnboardingProcessForm: React.FC<OnboardingProcessFormProps> = ({
  type,
  employees,
  preselectedEmployee,
  initialData,
  onSubmit,
  onCancel,
}) => {
  const [formData, setFormData] = useState({
    employeeId: preselectedEmployee?.id || initialData?.employeeId || '',
    startDate: initialData?.startDate ? new Date(initialData.startDate).toISOString().split('T')[0] : '',
    targetDate: initialData?.targetDate ? new Date(initialData.targetDate).toISOString().split('T')[0] : '',
    status: initialData?.status || 'pending',
    tasks: initialData?.tasks || [],
    type,
    notes: initialData?.notes || '',
  });

  const [employeeSearch, setEmployeeSearch] = useState('');
  const [showEmployeeResults, setShowEmployeeResults] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(
    preselectedEmployee || (initialData?.employeeId ? employees.find(e => e.id === initialData.employeeId) : null)
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Filter employees based on search
  const filteredEmployees = employeeSearch.trim()
    ? employees.filter(employee => {
        const fullName = `${employee.firstName || ''} ${employee.fatherName || ''}`.toLowerCase();
        return fullName.includes(employeeSearch.toLowerCase());
      })
    : [];

  const handleAddTask = () => {
    setFormData(prev => ({
      ...prev,
      tasks: [
        ...prev.tasks,
        {
          title: '',
          description: '',
          category: 'documentation',
          assignedTo: '',
          dueDate: new Date(),
          status: 'pending',
        } as OnboardingTask
      ]
    }));
  };

  const handleRemoveTask = (index: number) => {
    setFormData(prev => ({
      ...prev,
      tasks: prev.tasks.filter((_, i) => i !== index)
    }));
  };

  const handleTaskChange = (index: number, field: keyof OnboardingTask, value: any) => {
    setFormData(prev => ({
      ...prev,
      tasks: prev.tasks.map((task, i) => 
        i === index ? { ...task, [field]: value } : task
      )
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await onSubmit({
        ...formData,
        startDate: new Date(formData.startDate),
        targetDate: new Date(formData.targetDate),
        tasks: formData.tasks.map(task => ({
          ...task,
          dueDate: new Date(task.dueDate),
        })),
      } as OnboardingProcess);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
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
                setFormData(prev => ({ ...prev, employeeId: '' }));
                setShowEmployeeResults(true);
              }}
              onFocus={() => {
                if (!selectedEmployee) {
                  setShowEmployeeResults(true);
                }
              }}
              className="input mt-1"
              placeholder="Search employee..."
              required
            />
            {showEmployeeResults && filteredEmployees.length > 0 && (
              <div className="absolute z-10 w-full mt-1 bg-white shadow-lg rounded-lg border border-gray-200">
                {filteredEmployees.map(employee => (
                  <div
                    key={employee.id}
                    className="px-4 py-2 hover:bg-gray-50 cursor-pointer"
                    onClick={() => {
                      setSelectedEmployee(employee);
                      setFormData(prev => ({ ...prev, employeeId: employee.id || '' }));
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

        <div>
          <label htmlFor="status" className="block text-sm font-medium text-gray-700">
            Status
          </label>
          <select
            id="status"
            value={formData.status}
            onChange={(e) => setFormData(prev => ({ 
              ...prev, 
              status: e.target.value as OnboardingProcess['status']
            }))}
            className="input mt-1"
            required
          >
            <option value="pending">Pending</option>
            <option value="in-progress">In Progress</option>
            <option value="completed">Completed</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div>
          <label htmlFor="startDate" className="block text-sm font-medium text-gray-700">
            Start Date
          </label>
          <input
            type="date"
            id="startDate"
            value={formData.startDate}
            onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
            className="input mt-1"
            required
          />
        </div>

        <div>
          <label htmlFor="targetDate" className="block text-sm font-medium text-gray-700">
            Target Completion Date
          </label>
          <input
            type="date"
            id="targetDate"
            value={formData.targetDate}
            onChange={(e) => setFormData(prev => ({ ...prev, targetDate: e.target.value }))}
            className="input mt-1"
            required
            min={formData.startDate}
          />
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

      {/* Tasks */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-sm font-medium text-gray-700">Tasks</h3>
          <button
            type="button"
            onClick={handleAddTask}
            className="text-brand-600 hover:text-brand-700"
          >
            <Plus className="h-5 w-5" />
          </button>
        </div>
        <div className="space-y-4">
          {formData.tasks.map((task, index) => (
            <div key={index} className="card">
              <div className="flex justify-between mb-4">
                <h4 className="text-sm font-medium text-gray-700">Task {index + 1}</h4>
                <button
                  type="button"
                  onClick={() => handleRemoveTask(index)}
                  className="text-red-600 hover:text-red-700"
                >
                  <Minus className="h-5 w-5" />
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Title
                  </label>
                  <input
                    type="text"
                    value={task.title}
                    onChange={(e) => handleTaskChange(index, 'title', e.target.value)}
                    className="input mt-1"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Description
                  </label>
                  <textarea
                    value={task.description}
                    onChange={(e) => handleTaskChange(index, 'description', e.target.value)}
                    className="input mt-1"
                    rows={2}
                    required
                  />
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Category
                    </label>
                    <select
                      value={task.category}
                      onChange={(e) => handleTaskChange(index, 'category', e.target.value)}
                      className="input mt-1"
                      required
                    >
                      <option value="documentation">Documentation</option>
                      <option value="setup">Setup</option>
                      <option value="training">Training</option>
                      <option value="introduction">Introduction</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Assigned To
                    </label>
                    <select
                      value={task.assignedTo}
                      onChange={(e) => handleTaskChange(index, 'assignedTo', e.target.value)}
                      className="input mt-1"
                      required
                    >
                      <option value="">Select assignee...</option>
                      {employees.map(employee => (
                        <option key={employee.id} value={employee.id}>
                          {employee.firstName} {employee.fatherName}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Due Date
                    </label>
                    <input
                      type="date"
                      value={task.dueDate instanceof Date ? task.dueDate.toISOString().split('T')[0] : task.dueDate}
                      onChange={(e) => handleTaskChange(index, 'dueDate', new Date(e.target.value))}
                      className="input mt-1"
                      required
                      min={formData.startDate}
                      max={formData.targetDate}
                    />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
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
          {loading ? 'Saving...' : initialData ? 'Update Process' : 'Create Process'}
        </button>
      </div>
    </form>
  );
};

export default OnboardingProcessForm;