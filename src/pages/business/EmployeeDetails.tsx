import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Edit2 } from 'lucide-react';
import { Employee, getEmployees, updateEmployee } from '../../lib/firebase/employees';
import { Department, getDepartments } from '../../lib/firebase/departments';
import { EmployeeForm } from '../../components/EmployeeForm';

const EmployeeDetails: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [managers, setManagers] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    loadData();
  }, [id]);

  const loadData = async () => {
    try {
      const [employeesData, departmentsData] = await Promise.all([
        getEmployees(),
        getDepartments()
      ]);

      const currentEmployee = employeesData.find(emp => emp.id === id);
      if (!currentEmployee) {
        throw new Error('Employee not found');
      }

      setEmployee(currentEmployee);
      setDepartments(departmentsData);
      setManagers(employeesData.filter(emp => emp.position === 'Manager'));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load employee data');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateEmployee = async (data: Omit<Employee, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (!employee?.id) return;
    try {
      await updateEmployee(employee.id, data);
      await loadData();
      setIsEditing(false);
    } catch (err) {
      setError('Failed to update employee');
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div className="text-red-600">{error}</div>;
  if (!employee) return <div>Employee not found</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center">
          <Link 
            to="/business/organization"
            className="mr-4 text-gray-500 hover:text-gray-700"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">
              {employee.firstName} {employee.fatherName}
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              {employee.jobTitle} • {departments.find(d => d.id === employee.departmentId)?.name}
            </p>
          </div>
        </div>
        <button 
          onClick={() => setIsEditing(!isEditing)}
          className="btn btn-primary"
        >
          <Edit2 className="h-4 w-4 mr-2" />
          {isEditing ? 'Cancel Edit' : 'Edit Employee'}
        </button>
      </div>

      {isEditing ? (
        <div className="card">
          <EmployeeForm
            departments={departments}
            managers={managers}
            initialData={employee}
            onSubmit={handleUpdateEmployee}
            onCancel={() => setIsEditing(false)}
          />
        </div>
      ) : (
        <div className="space-y-6">
          {/* Employee details sections */}
          <div className="card">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Personal Information</h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-500">Employee ID</label>
                <div className="mt-1 text-sm text-gray-900">{employee.employeeId}</div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500">Full Name</label>
                <div className="mt-1 text-sm text-gray-900">
                  {employee.title} {employee.firstName} {employee.fatherName} {employee.lastName}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500">Gender</label>
                <div className="mt-1 text-sm text-gray-900">{employee.gender}</div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500">Date of Birth</label>
                <div className="mt-1 text-sm text-gray-900">
                  {employee.dateOfBirth?.toLocaleDateString()}
                </div>
              </div>
            </div>
          </div>

          <div className="card">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Employment Details</h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-500">Department</label>
                <div className="mt-1 text-sm text-gray-900">
                  {departments.find(d => d.id === employee.departmentId)?.name}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500">Position</label>
                <div className="mt-1 text-sm text-gray-900">{employee.position}</div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500">Employment Type</label>
                <div className="mt-1 text-sm text-gray-900">{employee.employmentType}</div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500">Join Date</label>
                <div className="mt-1 text-sm text-gray-900">
                  {employee.dateJoined?.toLocaleDateString()}
                </div>
              </div>
            </div>
          </div>

          <div className="card">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Contact Information</h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-500">Work Email</label>
                <div className="mt-1 text-sm text-gray-900">{employee.workEmail}</div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500">Work Phone</label>
                <div className="mt-1 text-sm text-gray-900">{employee.workPhone}</div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500">Office Location</label>
                <div className="mt-1 text-sm text-gray-900">{employee.officeLocation}</div>
              </div>
            </div>
          </div>

          <div className="card">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Compensation</h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-500">Base Salary</label>
                <div className="mt-1 text-sm text-gray-900">
                  {employee.salary?.toLocaleString()} {employee.salaryCurrency}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500">Pay Frequency</label>
                <div className="mt-1 text-sm text-gray-900">{employee.payFrequency}</div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500">Transport Allowance</label>
                <div className="mt-1 text-sm text-gray-900">
                  {employee.transportAllowance?.toLocaleString()} {employee.salaryCurrency}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500">Housing Allowance</label>
                <div className="mt-1 text-sm text-gray-900">
                  {employee.housingAllowance?.toLocaleString()} {employee.salaryCurrency}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployeeDetails;