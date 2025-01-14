import React, { useState, useEffect } from 'react';
import { LifeBuoy, Search, Filter, Plus, MessageSquare, Clock, AlertCircle } from 'lucide-react';
import { SupportTicket, getTickets, updateTicket } from '../../lib/firebase/support';
import { Department, getDepartments } from '../../lib/firebase/departments';
import { Employee, getEmployees } from '../../lib/firebase/employees';
import TicketList from '../../components/support/TicketList';
import TicketDetails from '../../components/support/TicketDetails';
import TicketFilters from '../../components/support/TicketFilters';

const Support: React.FC = () => {
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [filters, setFilters] = useState({
    status: '',
    priority: '',
    type: '',
    departmentId: '',
    search: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [ticketsData, departmentsData, employeesData] = await Promise.all([
        getTickets(),
        getDepartments(),
        getEmployees()
      ]);
      setTickets(ticketsData);
      setDepartments(departmentsData);
      setEmployees(employeesData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateTicket = async (id: string, updates: Partial<SupportTicket>) => {
    try {
      await updateTicket(id, updates);
      await loadData();
    } catch (err) {
      setError('Failed to update ticket');
    }
  };

  const filteredTickets = tickets.filter(ticket => {
    if (filters.status && ticket.status !== filters.status) return false;
    if (filters.priority && ticket.priority !== filters.priority) return false;
    if (filters.type && ticket.type !== filters.type) return false;
    if (filters.departmentId && ticket.departmentId !== filters.departmentId) return false;
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      return (
        ticket.title.toLowerCase().includes(searchTerm) ||
        ticket.description.toLowerCase().includes(searchTerm)
      );
    }
    return true;
  });

  // Calculate summary statistics
  const stats = {
    totalTickets: tickets.length,
    openTickets: tickets.filter(t => t.status === 'open').length,
    inProgressTickets: tickets.filter(t => t.status === 'in-progress').length,
    urgentTickets: tickets.filter(t => t.priority === 'urgent').length
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-900">Support Management</h1>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3">
          {error}
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <div className="card">
          <div className="flex items-center">
            <div className="bg-blue-50 rounded-none p-3">
              <MessageSquare className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-gray-500">Total Tickets</h3>
              <div className="mt-1">
                <p className="text-2xl font-semibold text-gray-900">{stats.totalTickets}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="bg-yellow-50 rounded-none p-3">
              <Clock className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-gray-500">Open Tickets</h3>
              <div className="mt-1">
                <p className="text-2xl font-semibold text-gray-900">{stats.openTickets}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="bg-green-50 rounded-none p-3">
              <LifeBuoy className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-gray-500">In Progress</h3>
              <div className="mt-1">
                <p className="text-2xl font-semibold text-gray-900">{stats.inProgressTickets}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="bg-red-50 rounded-none p-3">
              <AlertCircle className="h-6 w-6 text-red-600" />
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-gray-500">Urgent Tickets</h3>
              <div className="mt-1">
                <p className="text-2xl font-semibold text-gray-900">{stats.urgentTickets}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <TicketFilters
        departments={departments}
        filters={filters}
        onFilterChange={setFilters}
      />

      {/* Ticket List */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-1">
          <TicketList
            tickets={filteredTickets}
            employees={employees}
            departments={departments}
            selectedTicketId={selectedTicket?.id}
            onSelectTicket={setSelectedTicket}
          />
        </div>

        <div className="lg:col-span-2">
          {selectedTicket ? (
            <TicketDetails
              ticket={selectedTicket}
              employees={employees}
              departments={departments}
              onUpdate={handleUpdateTicket}
              onClose={() => setSelectedTicket(null)}
            />
          ) : (
            <div className="card h-full flex items-center justify-center text-gray-500">
              Select a ticket to view details
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Support;