import React, { useState, useEffect } from 'react';
import { Building2, Users, Plus, UserPlus, Network, Building, Shield, Download } from 'lucide-react';
import { Department, getDepartments, addDepartment, updateDepartment, deleteDepartment } from '../../lib/firebase/departments';
import { Employee, getEmployees, addEmployee, updateEmployee, deleteEmployee } from '../../lib/firebase/employees';
import { Company, getCompanies, addCompany, updateCompany, deleteCompany } from '../../lib/firebase/companies';
import { AdminUser, getAdminUsers, addAdminUser, updateAdminUser, deleteAdminUser } from '../../lib/firebase/users';
import DepartmentForm from '../../components/DepartmentForm';
import { EmployeeForm } from '../../components/EmployeeForm';
import UserManagementSection from '../../components/UserManagementSection';
import EmployeeList from '../../components/EmployeeList';
import CompanyForm from '../../components/CompanyForm';
import CompanyList from '../../components/CompanyList';
import { Link, useNavigate } from 'react-router-dom';

const Organization: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'employees' | 'departments' | 'company' | 'users'>('employees');
  const [departments, setDepartments] = useState<Department[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [adminUsers, setAdminUsers] = useState<AdminUser[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [showEmployeeForm, setShowEmployeeForm] = useState(false);
  const [showCompanyForm, setShowCompanyForm] = useState(false);
  const [editingDepartment, setEditingDepartment] = useState<Department | null>(null);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [editingCompany, setEditingCompany] = useState<Company | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [departmentsData, employeesData, adminUsersData, companiesData] = await Promise.all([
        getDepartments(),
        getEmployees(),
        getAdminUsers(),
        getCompanies()
      ]);
      setDepartments(departmentsData);
      setEmployees(employeesData);
      setAdminUsers(adminUsersData);
      setCompanies(companiesData);
    } catch (err) {
      setError('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleAddDepartment = async (data: Omit<Department, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      await addDepartment(data);
      await loadData();
      setShowForm(false);
    } catch (err) {
      setError('Failed to add department');
    }
  };

  const handleUpdateDepartment = async (data: Omit<Department, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (!editingDepartment?.id) return;
    try {
      await updateDepartment(editingDepartment.id, data);
      await loadData();
      setEditingDepartment(null);
    } catch (err) {
      setError('Failed to update department');
    }
  };

  const handleDeleteDepartment = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this department?')) return;
    try {
      await deleteDepartment(id);
      await loadData();
    } catch (err) {
      setError('Failed to delete department');
    }
  };

  const handleAddEmployee = async (data: Omit<Employee, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      await addEmployee(data);
      await loadData();
      setShowEmployeeForm(false);
    } catch (err) {
      setError('Failed to add employee');
    }
  };

  const handleUpdateEmployee = async (data: Omit<Employee, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (!editingEmployee?.id) return;
    try {
      await updateEmployee(editingEmployee.id, data);
      await loadData();
      setEditingEmployee(null);
    } catch (err) {
      setError('Failed to update employee');
    }
  };

  const handleDeleteEmployee = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this employee?')) return;
    try {
      await deleteEmployee(id);
      await loadData();
    } catch (err) {
      setError('Failed to delete employee');
    }
  };

  const handleAddCompany = async (data: Omit<Company, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      await addCompany(data);
      await loadData();
      setShowCompanyForm(false);
    } catch (err) {
      setError('Failed to add company');
    }
  };

  const handleUpdateCompany = async (data: Omit<Company, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (!editingCompany?.id) return;
    try {
      await updateCompany(editingCompany.id, data);
      await loadData();
      setEditingCompany(null);
    } catch (err) {
      setError('Failed to update company');
    }
  };

  const handleDeleteCompany = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this company?')) return;
    try {
      await deleteCompany(id);
      await loadData();
    } catch (err) {
      setError('Failed to delete company');
    }
  };

  const handleViewEmployee = (id: string) => {
    navigate(`/business/organization/employee/${id}`);
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Organization</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage your organization structure and personnel
          </p>
        </div>
        <div className="flex space-x-3">
          <button 
            onClick={() => setShowForm(true)}
            className="btn btn-secondary"
          >
            <Building2 className="h-4 w-4 mr-2" />
            Add Department
          </button>
          <Link 
            to="/business/organization/add-employee"
            className="btn btn-primary"
          >
            <UserPlus className="h-4 w-4 mr-2" />
            Add Employee
          </Link>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('employees')}
            className={`
              group inline-flex items-center py-4 px-1 border-b-2 font-medium text-sm
              ${activeTab === 'employees'
                ? 'border-brand-600 text-brand-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}
            `}
          >
            <Users className="h-5 w-5 mr-2" />
            Employees
          </button>
          <button
            onClick={() => setActiveTab('departments')}
            className={`
              group inline-flex items-center py-4 px-1 border-b-2 font-medium text-sm
              ${activeTab === 'departments'
                ? 'border-brand-600 text-brand-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}
            `}
          >
            <Building2 className="h-5 w-5 mr-2" />
            Departments
          </button>
          <button
            onClick={() => setActiveTab('company')}
            className={`
              group inline-flex items-center py-4 px-1 border-b-2 font-medium text-sm
              ${activeTab === 'company'
                ? 'border-brand-600 text-brand-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}
            `}
          >
            <Building className="h-5 w-5 mr-2" />
            Company
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`
              group inline-flex items-center py-4 px-1 border-b-2 font-medium text-sm
              ${activeTab === 'users'
                ? 'border-brand-600 text-brand-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}
            `}
          >
            <Shield className="h-5 w-5 mr-2" />
            User Management
          </button>
        </nav>
      </div>
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3">
          {error}
        </div>
      )}

      {/* Tab Content */}
      {activeTab === 'employees' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-lg font-medium text-gray-900">Employees</h2>
              <p className="mt-1 text-sm text-gray-500">
                {employees.length} total employees
              </p>
            </div>
            <div className="flex space-x-3">
              <button className="btn btn-secondary">
                <Download className="h-4 w-4 mr-2" />
                Export
              </button>
              <Link 
                to="/business/organization/add-employee"
                className="btn btn-primary"
              >
                <UserPlus className="h-4 w-4 mr-2" />
                Add Employee
              </Link>
            </div>
          </div>

          <EmployeeList
            employees={employees}
            departments={departments}
            onViewEmployee={handleViewEmployee}
            onDelete={handleDeleteEmployee}
          />
        </div>
      )}

      {activeTab === 'departments' && (
        <div className="space-y-6">
          {/* Department Cards */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {departments.map((dept) => (
            <div key={dept.id} className="card">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  <Building2 className="h-6 w-6 text-brand-600" />
                  <div className="ml-2">
                    <h3 className="text-lg font-medium text-gray-900">{dept.name}</h3>
                    <p className="text-sm text-gray-500">{dept.departmentId}</p>
                  </div>
                </div>
                <button 
                  onClick={() => setEditingDepartment(dept)}
                  className="btn btn-secondary"
                >
                  Edit
                </button>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center text-sm">
                  <Users className="h-4 w-4 text-gray-400 mr-2" />
                  <span className="text-gray-500">{dept.employees} Employees</span>
                </div>
                
                <div className="flex items-center text-sm">
                  <Plus className="h-4 w-4 text-gray-400 mr-2" />
                  <span className="text-gray-500">{dept.openPositions} Open Positions</span>
                </div>

                <div className="pt-4 border-t border-gray-200">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Department Head</span>
                    <span className="font-medium text-gray-900">{dept.head}</span>
                  </div>
                  <div className="flex justify-between text-sm mt-2">
                    <span className="text-gray-500">Annual Budget</span>
                    <span className="font-medium text-gray-900">{dept.budget}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
          </div>
          
          {/* Organogram */}
          <div className="card">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Organization Chart</h2>
          <div className="flex justify-center">
            <div className="space-y-8">
              {/* CEO Level */}
              <div className="flex justify-center">
                <div className="card w-64 text-center">
                  <h3 className="text-lg font-medium text-gray-900">CEO</h3>
                  <p className="text-sm text-gray-500">Anteneh Alemu</p>
                </div>
              </div>

              {/* Department Heads Level */}
              <div className="flex justify-center space-x-4">
                {departments.map(dept => (
                  <div key={dept.id} className="card w-48 text-center">
                    <h3 className="text-sm font-medium text-gray-900">{dept.name}</h3>
                    <p className="text-xs text-gray-500">{dept.head}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
          </div>
        </div>
      )}

      {activeTab === 'company' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-medium text-gray-900">Companies</h2>
            <button
              onClick={() => setShowCompanyForm(true)}
              className="btn btn-primary"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Company
            </button>
          </div>
          
          <CompanyList
            companies={companies}
            onEdit={setEditingCompany}
            onDelete={handleDeleteCompany}
          />
        </div>
      )}

      {activeTab === 'users' && (
        <UserManagementSection
          users={adminUsers}
          allEmployees={employees}
          onAddUser={addAdminUser}
          onUpdateUser={updateAdminUser}
          onDeleteUser={deleteAdminUser}
        />
      )}

      {/* Forms */}
      {(showForm || editingDepartment) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-2xl w-full mx-4">
            <h2 className="text-lg font-medium text-gray-900 mb-4">
              {editingDepartment ? 'Edit Department' : 'Add New Department'}
            </h2>
            <DepartmentForm
              initialData={editingDepartment || undefined}
              onSubmit={editingDepartment ? handleUpdateDepartment : handleAddDepartment}
              onCancel={() => {
                setShowForm(false);
                setEditingDepartment(null);
              }}
            />
          </div>
        </div>
      )}

      {(showEmployeeForm || editingEmployee) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-4xl w-full mx-4">
            <h2 className="text-lg font-medium text-gray-900 mb-4">
              {editingEmployee ? 'Edit Employee' : 'Add New Employee'}
            </h2>
            <EmployeeForm
              departments={departments}
              managers={employees.filter(e => e.position === 'Manager')}
              initialData={editingEmployee || undefined}
              onSubmit={editingEmployee ? handleUpdateEmployee : handleAddEmployee}
              onCancel={() => {
                setShowEmployeeForm(false);
                setEditingEmployee(null);
              }}
            />
          </div>
        </div>
      )}

      {/* Company Form Modal */}
      {(showCompanyForm || editingCompany) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-4xl w-full mx-4">
            <h2 className="text-lg font-medium text-gray-900 mb-4">
              {editingCompany ? 'Edit Company' : 'Add New Company'}
            </h2>
            <CompanyForm
              companies={companies}
              initialData={editingCompany || undefined}
              onSubmit={editingCompany ? handleUpdateCompany : handleAddCompany}
              onCancel={() => {
                setShowCompanyForm(false);
                setEditingCompany(null);
              }}
            />
          </div>
        </div>
      )}

    </div>
  );
};

export default Organization;