import React, { useState, useEffect } from 'react';
import { ArrowLeft } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { Employee, addEmployee } from '../../lib/firebase/employees';
import { Department, getDepartments } from '../../lib/firebase/departments';
import { EmployeeForm } from '../../components/EmployeeForm';
import BulkUploadSection from '../../components/BulkUploadSection';

const AddEmployee: React.FC = () => {
  const navigate = useNavigate();
  const [departments, setDepartments] = useState<Department[]>([]);
  const [managers, setManagers] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<'single' | 'bulk'>('single');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const departmentsData = await getDepartments();
      setDepartments(departmentsData);
      setLoading(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data');
      setLoading(false);
    }
  };

  const handleAddEmployee = async (data: Omit<Employee, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      await addEmployee(data);
      navigate('/business/organization');
    } catch (err) {
      setError('Failed to add employee');
      throw err;
    }
  };

  const handleBulkUpload = async (data: any[]) => {
    try {
      let successCount = 0;
      let failureCount = 0;
      const errors: string[] = [];

      for (const employeeData of data) {
        try {
          await addEmployee(employeeData);
          successCount++;
        } catch (err) {
          failureCount++;
          const errorMessage = err instanceof Error ? err.message : 'Unknown error';
          errors.push(`Failed to add employee ${employeeData.firstName}: ${errorMessage}`);
        }
      }

      if (failureCount > 0) {
        setError(`${failureCount} records failed to upload:\n${errors.join('\n')}`);
      }

      if (successCount > 0) {
        navigate('/business/organization');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to process bulk upload');
    }
  };

  if (loading) return <div>Loading...</div>;

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
            <h1 className="text-2xl font-semibold text-gray-900">Add Employee</h1>
            <p className="mt-1 text-sm text-gray-500">
              Add a new employee to your organization
            </p>
          </div>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={() => setMode('single')}
            className={`btn ${mode === 'single' ? 'btn-primary' : 'btn-secondary'}`}
          >
            Single Employee
          </button>
          <button
            onClick={() => setMode('bulk')}
            className={`btn ${mode === 'bulk' ? 'btn-primary' : 'btn-secondary'}`}
          >
            Bulk Upload
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3">
          {error}
        </div>
      )}

      {mode === 'single' ? (
        <div className="card">
          <EmployeeForm
            departments={departments}
            managers={managers}
            onSubmit={handleAddEmployee}
            onCancel={() => navigate('/business/organization')}
          />
        </div>
      ) : (
        <BulkUploadSection onUpload={handleBulkUpload} />
      )}
    </div>
  );
};

export default AddEmployee;