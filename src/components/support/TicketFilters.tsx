import React from 'react';
import { Search, Filter } from 'lucide-react';
import { Department } from '../../lib/firebase/departments';

interface TicketFiltersProps {
  departments: Department[];
  filters: {
    status: string;
    priority: string;
    type: string;
    subType?: string;
    departmentId: string;
    search: string;
  };
  onFilterChange: (filters: any) => void;
}

const TicketFilters: React.FC<TicketFiltersProps> = ({
  departments,
  filters,
  onFilterChange,
}) => {
  return (
    <div className="card">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
        <div>
          <label htmlFor="type" className="block text-sm font-medium text-gray-700">
            Category
          </label>
          <select
            id="type"
            value={filters.type}
            onChange={(e) => onFilterChange({ 
              ...filters, 
              type: e.target.value,
              subType: '' // Reset subtype when category changes
            })}
            className="input mt-1"
          >
            <option value="">All Categories</option>
            <option value="technical">Technical Support</option>
            <option value="hr">HR Support</option>
            <option value="payroll">Payroll Support</option>
            <option value="benefits">Benefits Support</option>
          </select>
        </div>
        
        {filters.type === 'technical' && (
          <div>
            <label htmlFor="subType" className="block text-sm font-medium text-gray-700">
              Issue Type
            </label>
            <select
              id="subType"
              value={filters.subType}
              onChange={(e) => onFilterChange({ ...filters, subType: e.target.value })}
              className="input mt-1"
            >
              <option value="">All Types</option>
              <option value="hardware">Hardware</option>
              <option value="software">Software</option>
              <option value="network">Network</option>
              <option value="access">Access</option>
              <option value="other">Other</option>
            </select>
          </div>
        )}

        {filters.type === 'hr' && (
          <div>
            <label htmlFor="subType" className="block text-sm font-medium text-gray-700">
              Issue Type
            </label>
            <select
              id="subType"
              value={filters.subType}
              onChange={(e) => onFilterChange({ ...filters, subType: e.target.value })}
              className="input mt-1"
            >
              <option value="">All Types</option>
              <option value="payroll">Payroll</option>
              <option value="benefits">Benefits</option>
              <option value="workplace">Workplace</option>
              <option value="other">Other</option>
            </select>
          </div>
        )}

        <div>
          <label htmlFor="priority" className="block text-sm font-medium text-gray-700">
            Priority
          </label>
          <select
            id="priority"
            value={filters.priority}
            onChange={(e) => onFilterChange({ ...filters, priority: e.target.value })}
            className="input mt-1"
          >
            <option value="">All Priority</option>
            <option value="urgent">Urgent</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
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
            <option value="open">Open</option>
            <option value="in-progress">In Progress</option>
            <option value="resolved">Resolved</option>
            <option value="closed">Closed</option>
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
              placeholder="Search tickets..."
              className="input pl-10"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default TicketFilters;