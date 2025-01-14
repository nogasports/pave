import React, { useState, useEffect } from 'react';
import { AlertTriangle, Plus, FileText, User, Clock } from 'lucide-react';
import { DisciplinaryCase, getDisciplinaryCases } from '../../lib/firebase/disciplinary';
import { Department, getDepartments } from '../../lib/firebase/departments';
import { Employee, getEmployees } from '../../lib/firebase/employees';
import DisciplinaryCaseForm from './DisciplinaryCaseForm';

const DisciplinarySection: React.FC = () => {
  const [cases, setCases] = useState<DisciplinaryCase[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [showCaseForm, setShowCaseForm] = useState(false);
  const [selectedCase, setSelectedCase] = useState<DisciplinaryCase | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [casesData, departmentsData, employeesData] = await Promise.all([
        getDisciplinaryCases(),
        getDepartments(),
        getEmployees()
      ]);
      setCases(casesData);
      setDepartments(departmentsData);
      setEmployees(employeesData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const getEmployeeName = (id: string) => {
    const employee = employees.find(e => e.id === id);
    return employee ? `${employee.firstName} ${employee.fatherName}` : 'Unknown';
  };

  const getStatusColor = (status: DisciplinaryCase['status']) => {
    switch (status) {
      case 'Reported':
        return 'bg-yellow-100 text-yellow-800';
      case 'Investigation':
        return 'bg-blue-100 text-blue-800';
      case 'Hearing':
        return 'bg-purple-100 text-purple-800';
      case 'Decision':
        return 'bg-orange-100 text-orange-800';
      case 'Appeal':
        return 'bg-red-100 text-red-800';
      case 'Closed':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-medium text-gray-900">Disciplinary Cases</h2>
        <button
          onClick={() => setShowCaseForm(true)}
          className="btn btn-primary"
        >
          <Plus className="h-4 w-4 mr-2" />
          Report Case
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
            <div className="bg-yellow-50 rounded-none p-3">
              <AlertTriangle className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-gray-500">Active Cases</h3>
              <div className="mt-1">
                <p className="text-2xl font-semibold text-gray-900">
                  {cases.filter(c => c.status !== 'Closed').length}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="bg-blue-50 rounded-none p-3">
              <FileText className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-gray-500">Under Investigation</h3>
              <div className="mt-1">
                <p className="text-2xl font-semibold text-gray-900">
                  {cases.filter(c => c.status === 'Investigation').length}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="bg-purple-50 rounded-none p-3">
              <User className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-gray-500">Pending Hearings</h3>
              <div className="mt-1">
                <p className="text-2xl font-semibold text-gray-900">
                  {cases.filter(c => c.status === 'Hearing').length}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="bg-red-50 rounded-none p-3">
              <Clock className="h-6 w-6 text-red-600" />
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-gray-500">Appeals</h3>
              <div className="mt-1">
                <p className="text-2xl font-semibold text-gray-900">
                  {cases.filter(c => c.status === 'Appeal').length}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Cases List */}
      <div className="space-y-4">
        {cases.map((case_) => (
          <div key={case_.id} className="card">
            <div className="flex justify-between">
              <div>
                <div className="flex items-center">
                  <h3 className="text-lg font-medium text-gray-900">
                    {case_.caseNumber}
                  </h3>
                  <span className={`ml-4 px-2 py-1 text-xs font-semibold rounded-none ${getStatusColor(case_.status)}`}>
                    {case_.status}
                  </span>
                  <span className={`ml-2 px-2 py-1 text-xs font-semibold rounded-none ${
                    case_.severity === 'Major'
                      ? 'bg-red-100 text-red-800'
                      : case_.severity === 'Moderate'
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-green-100 text-green-800'
                  }`}>
                    {case_.severity}
                  </span>
                </div>
                <div className="mt-1 text-sm text-gray-500">
                  Reported by: {getEmployeeName(case_.reportedBy)}
                </div>
                <div className="mt-2 text-sm">
                  <span className="text-gray-500">Defendant:</span>
                  <span className="ml-2 text-gray-900">{getEmployeeName(case_.defendantId)}</span>
                </div>
                {case_.plaintiffId && (
                  <div className="mt-1 text-sm">
                    <span className="text-gray-500">Plaintiff:</span>
                    <span className="ml-2 text-gray-900">{getEmployeeName(case_.plaintiffId)}</span>
                  </div>
                )}
              </div>
              <div>
                <button
                  onClick={() => setSelectedCase(case_)}
                  className="btn btn-secondary"
                >
                  View Details
                </button>
              </div>
            </div>
            <div className="mt-4">
              <p className="text-sm text-gray-600">{case_.description}</p>
            </div>
            {case_.nextAction && (
              <div className="mt-4 flex items-center justify-between text-sm">
                <span className="text-gray-500">Next Action:</span>
                <span className="text-brand-600">{case_.nextAction}</span>
              </div>
            )}
            {case_.dueDate && (
              <div className="mt-2 flex items-center justify-between text-sm">
                <span className="text-gray-500">Due Date:</span>
                <span className="text-gray-900">{case_.dueDate.toLocaleDateString()}</span>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Case Form Modal */}
      {showCaseForm && (
        <DisciplinaryCaseForm
          employees={employees}
          onSubmit={async (data) => {
            try {
              // Handle submission
              setShowCaseForm(false);
              await loadData();
            } catch (err) {
              setError('Failed to create case');
            }
          }}
          onCancel={() => setShowCaseForm(false)}
        />
      )}

      {/* Case Details Modal */}
      {selectedCase && (
        <div>
          {/* Implement case details view */}
        </div>
      )}
    </div>
  );
};

export default DisciplinarySection;