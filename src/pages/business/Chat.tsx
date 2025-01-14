import React, { useState, useEffect } from 'react';
import { MessageSquare, Filter, Search } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { Employee, findEmployeeByEmail } from '../../lib/firebase/employees';
import { ChatRoom, ChatMessage, subscribeToRooms } from '../../lib/firebase/chat';
import ChatWindow from '../../components/chat/ChatWindow';

const BusinessChat: React.FC = () => {
  const { user } = useAuth();
  const [currentUser, setCurrentUser] = useState<Employee | null>(null);
  const [rooms, setRooms] = useState<ChatRoom[]>([]);
  const [selectedRoom, setSelectedRoom] = useState<ChatRoom | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    status: '',
    priority: '',
    search: ''
  });

  useEffect(() => {
    loadData();
  }, [user]);

  const loadData = async () => {
    try {
      // Get current user
      const currentEmployee = await findEmployeeByEmail(user?.email || '');
      if (!currentEmployee) throw new Error('Employee not found');
      setCurrentUser(currentEmployee);

      // Subscribe to support tickets
      const unsubscribe = subscribeToRooms(currentEmployee.id!, (updatedRooms: ChatRoom[]) => {
        setRooms(updatedRooms.filter(r => r.type === 'ticket'));
        setLoading(false);
      });

      return () => unsubscribe();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data');
      setLoading(false);
    }
  };

  const filteredRooms = rooms.filter(room => {
    if (filters.status && room.status !== filters.status) return false;
    if (filters.priority && room.priority !== filters.priority) return false;
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      return (
        room.title?.toLowerCase().includes(searchTerm) ||
        room.ticketNumber?.toLowerCase().includes(searchTerm)
      );
    }
    return true;
  });

  if (loading) return <div>Loading...</div>;
  if (error) return <div className="text-red-600">{error}</div>;
  if (!currentUser) return <div>Employee not found</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-900">Support Tickets</h1>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div>
            <label htmlFor="status" className="block text-sm font-medium text-gray-700">
              Status
            </label>
            <select
              id="status"
              value={filters.status}
              onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
              className="input mt-1"
            >
              <option value="">All Status</option>
              <option value="open">Open</option>
              <option value="closed">Closed</option>
            </select>
          </div>

          <div>
            <label htmlFor="priority" className="block text-sm font-medium text-gray-700">
              Priority
            </label>
            <select
              id="priority"
              value={filters.priority}
              onChange={(e) => setFilters(prev => ({ ...prev, priority: e.target.value }))}
              className="input mt-1"
            >
              <option value="">All Priority</option>
              <option value="urgent">Urgent</option>
              <option value="high">High</option>
              <option value="normal">Normal</option>
              <option value="low">Low</option>
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
                placeholder="Search tickets..."
                className="input pl-10"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Tickets List */}
      <div className="space-y-4">
        {filteredRooms.map(room => (
          <div key={room.id} className="card hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-lg font-medium text-gray-900">
                  {room.title || `Ticket #${room.ticketNumber}`}
                </h3>
                {room.lastMessage && (
                  <p className="mt-1 text-sm text-gray-500">
                    {room.lastMessage.content}
                  </p>
                )}
                <div className="mt-2 flex items-center space-x-4">
                  <span className={`px-2 py-1 text-xs font-semibold rounded-none ${
                    room.status === 'open' 
                      ? 'bg-green-100 text-green-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {room.status}
                  </span>
                  {room.priority && (
                    <span className={`px-2 py-1 text-xs font-semibold rounded-none ${
                      room.priority === 'urgent'
                        ? 'bg-red-100 text-red-800'
                        : room.priority === 'high'
                        ? 'bg-orange-100 text-orange-800'
                        : 'bg-blue-100 text-blue-800'
                    }`}>
                      {room.priority}
                    </span>
                  )}
                  <span className="text-sm text-gray-500">
                    Created {room.createdAt.toLocaleDateString()}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setSelectedRoom(room)}
                className="btn btn-secondary"
              >
                View Ticket
              </button>
            </div>
          </div>
        ))}

        {filteredRooms.length === 0 && (
          <div className="text-center py-12">
            <MessageSquare className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No tickets found</h3>
            <p className="mt-1 text-sm text-gray-500">
              No support tickets match your current filters
            </p>
          </div>
        )}
      </div>

      {/* Chat Window Modal */}
      {selectedRoom && (
        <ChatWindow
          room={selectedRoom}
          currentUser={currentUser}
          onClose={() => setSelectedRoom(null)}
          isAdmin={true}
        />
      )}
    </div>
  );
};

export default BusinessChat;