import React, { useState } from 'react';
import { Eye, Trash2, User, Search, Filter, Download } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Employee } from '../lib/firebase/employees';
import { Department } from '../lib/firebase/departments';

const ITEMS_PER_PAGE = 10;

interface EmployeeListProps {
  employees: Employee[];
  departments: Department[];
  onViewEmployee: (id: string) => void;
  onDelete: (id: string) => void;
}

const EmployeeList: React.FC<EmployeeListProps> = ({
  employees,
  departments,
  onViewEmployee,
  onDelete,
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState({
    departmentId: '',
    employmentType: '',
    position: '',
    search: ''
  });

  const getDepartmentName = (departmentId: string) => {
    const department = departments.find(d => d.id === departmentId);
    return department ? department.name : 'No Department';
  };

  // Filter employees
  const filteredEmployees = employees.filter(emp => {
    if (filters.departmentId && emp.departmentId !== filters.departmentId) return false;
    if (filters.employmentType && emp.employmentType !== filters.employmentType) return false;
    if (filters.position && emp.position !== filters.position) return false;
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      return (
        (emp.firstName?.toLowerCase() || '').includes(searchTerm) ||
        (emp.fatherName?.toLowerCase() || '').includes(searchTerm) ||
        emp.lastName?.toLowerCase().includes(searchTerm) ||
        (emp.employeeId?.toLowerCase() || '').includes(searchTerm) ||
        emp.workEmail?.toLowerCase().includes(searchTerm)
      );
    }
    return true;
  });
  // Calculate pagination
  const totalPages = Math.ceil(filteredEmployees.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedEmployees = filteredEmployees.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="card">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
          <div>
            <label htmlFor="departmentFilter" className="block text-sm font-medium text-gray-700">
              Department
            </label>
            <select
              id="departmentFilter"
              value={filters.departmentId}
              onChange={(e) => setFilters(prev => ({ ...prev, departmentId: e.target.value }))}
              className="input mt-1"
            >
              <option value="">All Departments</option>
              {departments.map(dept => (
                <option key={dept.id} value={dept.id}>{dept.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="employmentType" className="block text-sm font-medium text-gray-700">
              Employment Type
            </label>
            <select
              id="employmentType"
              value={filters.employmentType}
              onChange={(e) => setFilters(prev => ({ ...prev, employmentType: e.target.value }))}
              className="input mt-1"
            >
              <option value="">All Types</option>
              <option value="Permanent">Permanent</option>
              <option value="Contract">Contract</option>
            </select>
          </div>

          <div>
            <label htmlFor="position" className="block text-sm font-medium text-gray-700">
              Position Level
            </label>
            <select
              id="position"
              value={filters.position}
              onChange={(e) => setFilters(prev => ({ ...prev, position: e.target.value }))}
              className="input mt-1"
            >
              <option value="">All Levels</option>
              <option value="Employee">Employee</option>
              <option value="Manager">Manager</option>
            </select>
          </div>

          <div>
            <label htmlFor="search" className="block text-sm font-medium text-gray-700">
              Search
            </label>
            <div className="relative mt-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                id="search"
                value={filters.search}
                onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                placeholder="Search employees..."
                className="input pl-10"
              />
            </div>
          </div>
        </div>
      </div>
      <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead>
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Employee
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Department
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Position
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Staff ID
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Contact
            </th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {paginatedEmployees.map((employee) => (
            <tr key={employee.id}>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center">
                  <div className="flex-shrink-0 h-10 w-10">
                    {employee.photo ? (
                      <img
                        className="h-10 w-10 object-cover"
                        src={employee.photo}
                        alt={`${employee.firstName} ${employee.lastName}`}
                      />
                    ) : (
                      <div className="h-10 w-10 bg-gray-100 flex items-center justify-center">
                        <User className="h-6 w-6 text-gray-400" />
                      </div>
                    )}
                  </div>
                  <div className="ml-4">
                    <div className="text-sm font-medium text-gray-900">
                      {employee.title} {employee.firstName} {employee.fatherName}
                    </div>
                    <div className="text-sm text-gray-500">{employee.jobTitle}</div>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-900">
                  {getDepartmentName(employee.departmentId || '')}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className={`px-2 inline-flex text-xs leading-5 font-semibold ${
                  employee.position === 'Manager'
                    ? 'bg-brand-100 text-brand-800'
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {employee.position}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {employee.staffId}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-900">{employee.workEmail}</div>
                <div className="text-sm text-gray-500">{employee.workPhone}</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <button
                  onClick={() => employee.id && onViewEmployee(employee.id)}
                  className="text-brand-600 hover:text-brand-900 mr-3"
                >
                  <Eye className="h-4 w-4" />
                </button>
                <button
                  onClick={() => employee.id && onDelete(employee.id)}
                  className="text-red-600 hover:text-red-900"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-between items-center border-t border-gray-200 pt-4">
          <div className="text-sm text-gray-500">
            Showing {startIndex + 1} to {Math.min(startIndex + ITEMS_PER_PAGE, filteredEmployees.length)} of {filteredEmployees.length} employees
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="btn btn-secondary px-3 py-1"
            >
              Previous
            </button>
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="btn btn-secondary px-3 py-1"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployeeList;