import React, { useState, useEffect } from 'react';
import { Target, Plus, ChevronRight } from 'lucide-react';
import { Objective, getObjectives, addObjective } from '../../lib/firebase/objectives';
import { Department, getDepartments } from '../../lib/firebase/departments';
import { Employee, getEmployees } from '../../lib/firebase/employees';
import ObjectiveForm from './ObjectiveForm';

const ObjectivesSection: React.FC = () => {
  const [objectives, setObjectives] = useState<Objective[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [objectivesData, departmentsData, employeesData] = await Promise.all([
        getObjectives(),
        getDepartments(),
        getEmployees()
      ]);
      setObjectives(objectivesData || []);
      setDepartments(departmentsData);
      setEmployees(employeesData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleAddObjective = async (data: Omit<Objective, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      await addObjective(data);
      await loadData();
      setShowForm(false);
    } catch (err) {
      setError('Failed to add objective');
    }
  };

  const getAssigneeName = (id: string, type: 'Department' | 'Employee') => {
    if (type === 'Department') {
      const department = departments.find(d => d.id === id);
      return department ? department.name : 'Unknown Department';
    } else {
      const employee = employees.find(e => e.id === id);
      return employee ? `${employee.firstName} ${employee.fatherName}` : 'Unknown Employee';
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div className="text-red-600">{error}</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-medium text-gray-900">Objectives</h2>
        <button
          onClick={() => setShowForm(true)}
          className="btn btn-primary"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Objective
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3">
          {error}
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-4">
        <div className="card">
          <div className="flex items-center">
            <div className="bg-blue-50 rounded-none p-3">
              <Target className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-gray-500">Total Objectives</h3>
              <div className="mt-1">
                <p className="text-2xl font-semibold text-gray-900">{objectives.length}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="bg-green-50 rounded-none p-3">
              <Target className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-gray-500">Completed</h3>
              <div className="mt-1">
                <p className="text-2xl font-semibold text-gray-900">
                  {objectives.filter(o => o.status === 'Completed').length}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="bg-yellow-50 rounded-none p-3">
              <Target className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-gray-500">In Progress</h3>
              <div className="mt-1">
                <p className="text-2xl font-semibold text-gray-900">
                  {objectives.filter(o => o.status === 'In Progress').length}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="bg-red-50 rounded-none p-3">
              <Target className="h-6 w-6 text-red-600" />
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-gray-500">Not Started</h3>
              <div className="mt-1">
                <p className="text-2xl font-semibold text-gray-900">
                  {objectives.filter(o => o.status === 'Not Started').length}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Objectives List */}
      <div className="space-y-4">
        {objectives.length === 0 ? (
          <div className="text-center py-12">
            <Target className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No objectives</h3>
            <p className="mt-1 text-sm text-gray-500">
              Get started by creating a new objective.
            </p>
            <div className="mt-6">
              <button
                onClick={() => setShowForm(true)}
                className="btn btn-primary"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Objective
              </button>
            </div>
          </div>
        ) : objectives?.map((objective) => (
          <div key={objective.id} className="card">
            <div className="flex justify-between">
              <div>
                <div className="flex items-center">
                  <h3 className="text-lg font-medium text-gray-900">{objective.title}</h3>
                  <span className={`ml-4 px-2 py-1 text-xs font-semibold rounded-none ${
                    objective.status === 'Completed'
                      ? 'bg-green-100 text-green-800'
                      : objective.status === 'In Progress'
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {objective.status}
                  </span>
                  <span className={`ml-2 px-2 py-1 text-xs font-semibold rounded-none ${
                    objective.priority === 'High'
                      ? 'bg-red-100 text-red-800'
                      : objective.priority === 'Medium'
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-green-100 text-green-800'
                  }`}>
                    {objective.priority} Priority
                  </span>
                </div>
                <div className="mt-1 text-sm text-gray-500">
                  Assigned to: {getAssigneeName(objective.assigneeId, objective.type)}
                </div>
              </div>
              <button className="text-brand-600 hover:text-brand-900">
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-4">
              <p className="text-sm text-gray-600">{objective.description}</p>
            </div>

            <div className="mt-4">
              {objective.keyResults && objective.keyResults.length > 0 && (
                <>
                  <h4 className="text-sm font-medium text-gray-700">Key Results</h4>
                  <div className="mt-2 space-y-2">
                    {objective.keyResults.map((kr) => (
                      <div key={kr.id} className="flex items-center justify-between">
                        <div className="flex-1">
                          <p className="text-sm text-gray-900">{kr.title}</p>
                          <div className="mt-1 flex items-center">
                            <div className="flex-1 bg-gray-200 rounded-none h-2">
                              <div 
                                className="bg-brand-600 rounded-none h-2"
                                style={{ width: `${(kr.current / kr.target) * 100}%` }}
                              />
                            </div>
                            <span className="ml-2 text-sm text-gray-500">
                              {kr.current}/{kr.target} {kr.unit}
                            </span>
                          </div>
                        </div>
                        <span className="ml-4 text-sm text-gray-500">
                          {kr.weight}%
                        </span>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>

            <div className="mt-4 pt-4 border-t border-gray-200 flex justify-between text-sm">
              <div className="text-gray-500">
                Due: {objective.dueDate.toLocaleDateString()}
              </div>
              <div className="text-gray-500">
                Progress: {objective.progress}%
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Objective Form Modal */}
      {showForm && (
        <ObjectiveForm
          departments={departments}
          employees={employees}
          onSubmit={handleAddObjective}
          onCancel={() => setShowForm(false)}
        />
      )}
    </div>
  );
};

export default ObjectivesSection;