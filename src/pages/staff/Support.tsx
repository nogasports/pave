import React, { useState, useEffect } from 'react';
import { LifeBuoy, Plus, MessageSquare, Clock, AlertCircle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { Employee, findEmployeeByEmail } from '../../lib/firebase/employees';
import { SupportTicket, getTickets, addTicket } from '../../lib/firebase/support';
import TicketList from '../../components/support/TicketList';
import TicketDetails from '../../components/support/TicketDetails';
import NewTicketForm from '../../components/support/NewTicketForm';

const StaffSupport: React.FC = () => {
  const { user } = useAuth();
  const [currentUser, setCurrentUser] = useState<Employee | null>(null);
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [showNewTicketForm, setShowNewTicketForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, [user]);

  const loadData = async () => {
    try {
      // Get current user
      const currentEmployee = await findEmployeeByEmail(user?.email || '');
      if (!currentEmployee) throw new Error('Employee not found');
      setCurrentUser(currentEmployee);

      // Load tickets
      const ticketsData = await getTickets({ userId: currentEmployee.id });
      setTickets(ticketsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTicket = async (data: Omit<SupportTicket, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      await addTicket({
        ...data,
        submittedBy: currentUser!.id!,
        status: 'open',
        messages: [],
      });
      await loadData();
      setShowNewTicketForm(false);
    } catch (err) {
      setError('Failed to create ticket');
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div className="text-red-600">{error}</div>;
  if (!currentUser) return <div>Employee not found</div>;

  // Calculate summary statistics
  const stats = {
    totalTickets: tickets.length,
    openTickets: tickets.filter(t => t.status === 'open').length,
    inProgressTickets: tickets.filter(t => t.status === 'in-progress').length,
    resolvedTickets: tickets.filter(t => t.status === 'resolved').length
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-900">Support</h1>
        <button
          onClick={() => setShowNewTicketForm(true)}
          className="btn btn-primary"
        >
          <Plus className="h-4 w-4 mr-2" />
          New Support Ticket
        </button>
      </div>

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
            <div className="bg-indigo-50 rounded-none p-3">
              <AlertCircle className="h-6 w-6 text-indigo-600" />
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-gray-500">Resolved</h3>
              <div className="mt-1">
                <p className="text-2xl font-semibold text-gray-900">{stats.resolvedTickets}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Ticket List and Details */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-1">
          <TicketList
            tickets={tickets}
            selectedTicketId={selectedTicket?.id}
            onSelectTicket={setSelectedTicket}
          />
        </div>

        <div className="lg:col-span-2">
          {selectedTicket ? (
            <TicketDetails
              ticket={selectedTicket}
              currentUser={currentUser}
              onClose={() => setSelectedTicket(null)}
            />
          ) : (
            <div className="card h-full flex items-center justify-center text-gray-500">
              Select a ticket to view details
            </div>
          )}
        </div>
      </div>

      {/* New Ticket Form Modal */}
      {showNewTicketForm && (
        <NewTicketForm
          currentUser={currentUser}
          onSubmit={handleCreateTicket}
          onClose={() => setShowNewTicketForm(false)}
        />
      )}
    </div>
  );
};

export default StaffSupport;