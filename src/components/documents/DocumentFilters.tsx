import React from 'react';
import { Filter, Search } from 'lucide-react';
import { Department } from '../../lib/firebase/departments';

interface DocumentFiltersProps {
  departments: Department[];
  filters: {
    type: string;
    departmentId: string;
    status: string;
    search: string;
  };
  onFilterChange: (filters: any) => void;
}

const DocumentFilters: React.FC<DocumentFiltersProps> = ({
  departments,
  filters,
  onFilterChange,
}) => {
  return (
    <div className="card">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
        <div>
          <label htmlFor="type" className="block text-sm font-medium text-gray-700">
            Document Type
          </label>
          <select
            id="type"
            value={filters.type}
            onChange={(e) => onFilterChange({ ...filters, type: e.target.value })}
            className="input mt-1"
          >
            <option value="">All Types</option>
            <option value="policy">Policy</option>
            <option value="procedure">Procedure</option>
            <option value="form">Form</option>
            <option value="contract">Contract</option>
            <option value="employee">Employee</option>
            <option value="other">Other</option>
          </select>
        </div>

        <div>
          <label htmlFor="department" className="block text-sm font-medium text-gray-700">
            Department
          </label>
          <select
            id="department"
            value={filters.departmentId}
            onChange={(e) => onFilterChange({ ...filters, departmentId: e.target.value })}
            className="input mt-1"
          >
            <option value="">All Departments</option>
            {departments.map(dept => (
              <option key={dept.id} value={dept.id}>{dept.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="status" className="block text-sm font-medium text-gray-700">
            Status
          </label>
          <select
            id="status"
            value={filters.status}
            onChange={(e) => onFilterChange({ ...filters, status: e.target.value })}
            className="input mt-1"
          >
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="archived">Archived</option>
            <option value="draft">Draft</option>
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
              onChange={(e) => onFilterChange({ ...filters, search: e.target.value })}
              placeholder="Search documents..."
              className="input pl-10"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default DocumentFilters;