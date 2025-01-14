import React, { useState, useEffect } from 'react';
import { MessageSquare, Plus } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { Employee, findEmployeeByEmail } from '../../lib/firebase/employees';
import { ChatRoom, ChatMessage, createChatRoom, subscribeToRooms, sendMessage } from '../../lib/firebase/chat';
import ChatWindow from '../../components/chat/ChatWindow';

const StaffChat: React.FC = () => {
  const { user } = useAuth();
  const [currentUser, setCurrentUser] = useState<Employee | null>(null);
  const [rooms, setRooms] = useState<ChatRoom[]>([]);
  const [selectedRoom, setSelectedRoom] = useState<ChatRoom | null>(null);
  const [message, setMessage] = useState('');
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

      // Subscribe to chat rooms
      const unsubscribe = subscribeToRooms(currentEmployee.id!, (updatedRooms) => {
        setRooms(updatedRooms);
        setLoading(false);
      });

      return () => unsubscribe();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data');
      setLoading(false);
    }
  };

  const handleCreateTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || !currentUser?.id) return;
    setLoading(true);
    setError(null);
    
    try {
      const roomId = await createChatRoom({
        type: 'ticket',
        title: message.split('\n')[0].slice(0, 100), // First line as title
        participants: [currentUser.id],
        category: 'general',
        status: 'open',
        priority: 'normal'
      });

      await sendMessage({
        roomId,
        senderId: currentUser.id,
        content: message,
        type: 'text',
        read: false,
        readBy: [],
        senderName: `${currentUser.firstName} ${currentUser.fatherName}`,
      });

      setMessage('');
      // Wait for room to appear in subscription
      setTimeout(() => {
        const newRoom = rooms.find(r => r.id === roomId);
        if (newRoom) setSelectedRoom(newRoom);
      }, 500);
    } catch (err) {
      setError('Failed to create support ticket');
      console.error('Error creating chat room:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div className="text-red-600">{error}</div>;
  if (!currentUser) return <div>Employee not found</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-900">Support Chat</h1>
        <button
          onClick={handleCreateTicket}
          className="btn btn-primary"
          disabled={!message.trim() || loading}
        >
          <Plus className="h-4 w-4 mr-2" />
          New Support Ticket
        </button>
      </div>

      {/* New Ticket Form */}
      <div className="card">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Create Support Ticket</h2>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Describe your issue..."
          className="w-full h-32 p-2 border border-gray-300 rounded-lg focus:ring-brand-500 focus:border-brand-500"
          disabled={loading}
        />
      </div>

      {/* Tickets List */}
      <div className="space-y-4">
        {rooms.map(room => (
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
                </div>
              </div>
              <button
                onClick={() => setSelectedRoom(room)}
                className="btn btn-secondary"
              >
                View Conversation
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Chat Window Modal */}
      {selectedRoom && (
        <ChatWindow
          room={selectedRoom}
          currentUser={currentUser}
          onClose={() => setSelectedRoom(null)}
        />
      )}
    </div>
  );
};

export default StaffChat;