import React, { useState } from 'react';
import { Paperclip, Send, X, User } from 'lucide-react';
import { SupportTicket } from '../../lib/firebase/support';
import { Employee } from '../../lib/firebase/employees';
import { Department } from '../../lib/firebase/departments';

interface TicketDetailsProps {
  ticket: SupportTicket;
  currentUser: Employee;
  employees?: Employee[];
  departments?: Department[];
  onUpdate?: (id: string, updates: Partial<SupportTicket>) => Promise<void>;
  onClose: () => void;
}

const TicketDetails: React.FC<TicketDetailsProps> = ({
  ticket,
  currentUser,
  employees,
  departments,
  onUpdate,
  onClose,
}) => {
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() && !selectedFile) return;
    
    setLoading(true);
    setError(null);

    try {
      let attachments: string[] = [];
      
      // Handle file upload if present
      if (selectedFile) {
        // Upload file and get URL
        // attachments.push(fileUrl);
      }

      await onUpdate?.(ticket.id!, {
        messages: [
          ...ticket.messages,
          {
            id: Date.now().toString(),
            content: message,
            senderId: currentUser.id!,
            timestamp: new Date(),
            attachments
          }
        ]
      });

      setMessage('');
      setSelectedFile(null);
    } catch (err) {
      setError('Failed to send message');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (status: SupportTicket['status']) => {
    try {
      await onUpdate?.(ticket.id!, { 
        status,
        ...(status === 'resolved' ? { resolvedAt: new Date() } : {}),
        ...(status === 'closed' ? { closedAt: new Date() } : {})
      });
    } catch (err) {
      setError('Failed to update status');
    }
  };

  const handleAssigneeChange = async (employeeId: string) => {
    try {
      await onUpdate?.(ticket.id!, { assignedTo: employeeId });
    } catch (err) {
      setError('Failed to update assignee');
    }
  };

  const handleAddFeedback = async (rating: number, comment: string) => {
    try {
      await onUpdate(ticket.id!, {
        feedback: {
          rating,
          comment,
          givenAt: new Date()
        }
      });
    } catch (err) {
      setError('Failed to add feedback');
    }
  };

  const getEmployeeName = (id: string) => {
    const employee = employees?.find(e => e.id === id);
    return employee ? `${employee.firstName} ${employee.fatherName}` : 'Unknown';
  };

  return (
    <div className="card h-full flex flex-col">
      {/* Header */}
      <div className="flex justify-between items-start pb-4 border-b border-gray-200">
        <div>
          <h2 className="text-lg font-medium text-gray-900">{ticket.title}</h2>
          <div className="mt-1 flex items-center space-x-4">
            <span className={`px-2 py-1 text-xs font-semibold rounded-none ${
              ticket.priority === 'urgent'
                ? 'bg-red-100 text-red-800'
                : ticket.priority === 'high'
                ? 'bg-orange-100 text-orange-800'
                : ticket.priority === 'medium'
                ? 'bg-yellow-100 text-yellow-800'
                : 'bg-blue-100 text-blue-800'
            }`}>
              {ticket.priority}
            </span>
            <span className={`px-2 py-1 text-xs font-semibold rounded-none ${
              ticket.status === 'open'
                ? 'bg-green-100 text-green-800'
                : ticket.status === 'in-progress'
                ? 'bg-yellow-100 text-yellow-800'
                : ticket.status === 'resolved'
                ? 'bg-blue-100 text-blue-800'
                : 'bg-gray-100 text-gray-800'
            }`}>
              {ticket.status}
            </span>
          </div>
        </div>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-500"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Details */}
      <div className="py-4 border-b border-gray-200">
        <dl className="grid grid-cols-1 gap-x-4 gap-y-4 sm:grid-cols-2">
          <div>
            <dt className="text-sm font-medium text-gray-500">Category</dt>
            <dd className="mt-1 text-sm text-gray-900">
              {ticket.category.charAt(0).toUpperCase() + ticket.category.slice(1)} Support
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Type</dt>
            <dd className="mt-1 text-sm text-gray-900">
              {ticket.type.charAt(0).toUpperCase() + ticket.type.slice(1)}
            </dd>
          </div>
          {ticket.hrRequestType && (
            <div>
              <dt className="text-sm font-medium text-gray-500">HR Request Type</dt>
              <dd className="mt-1 text-sm text-gray-900">
                {ticket.hrRequestType.charAt(0).toUpperCase() + ticket.hrRequestType.slice(1)}
              </dd>
            </div>
          )}
          <div>
            <dt className="text-sm font-medium text-gray-500">Submitted By</dt>
            <dd className="mt-1 text-sm text-gray-900">
              {getEmployeeName(ticket.submittedBy)}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Created</dt>
            <dd className="mt-1 text-sm text-gray-900">
              {new Date(ticket.createdAt).toLocaleString()}
            </dd>
          </div>
          {ticket.assignedTo && (
            <div>
              <dt className="text-sm font-medium text-gray-500">Assigned To</dt>
              <dd className="mt-1 text-sm text-gray-900">
                {getEmployeeName(ticket.assignedTo)}
              </dd>
            </div>
          )}
          {ticket.departmentId && departments && (
            <div>
              <dt className="text-sm font-medium text-gray-500">Department</dt>
              <dd className="mt-1 text-sm text-gray-900">
                {departments.find(d => d.id === ticket.departmentId)?.name}
              </dd>
            </div>
          )}
        </dl>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {ticket.messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.senderId === currentUser.id ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`max-w-[70%] ${message.senderId === currentUser.id ? 'order-2' : 'order-1'}`}>
              {message.senderId !== currentUser.id && (
                <div className="flex items-center mb-1">
                  <User className="h-4 w-4 text-gray-400 mr-1" />
                  <span className="text-xs text-gray-500">
                    {getEmployeeName(message.senderId)}
                  </span>
                </div>
              )}
              <div className={`rounded-lg px-4 py-2 ${
                message.senderId === currentUser.id
                  ? 'bg-brand-600 text-white'
                  : 'bg-gray-100 text-gray-900'
              }`}>
                <p className="text-sm whitespace-pre-wrap break-words">
                  {message.content}
                </p>
                {message.attachments?.map((url, index) => (
                  <a
                    key={index}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block mt-2 text-xs underline"
                  >
                    Attachment {index + 1}
                  </a>
                ))}
                <div className="mt-1 text-xs opacity-75 text-right">
                  {new Date(message.timestamp).toLocaleTimeString()}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Status Updates */}
      {ticket.status === 'resolved' && !ticket.feedback && (
        <div className="mt-4 p-4 bg-gray-50 rounded-lg">
          <h4 className="text-sm font-medium text-gray-900 mb-2">Provide Feedback</h4>
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => handleAddFeedback(star, '')}
                  className={`text-2xl ${
                    (ticket.feedback?.rating || 0) >= star
                      ? 'text-yellow-400'
                      : 'text-gray-300'
                  }`}
                >
                  ★
                </button>
              ))}
            </div>
            <textarea
              placeholder="Add a comment (optional)"
              className="input w-full"
              rows={2}
              onChange={(e) => handleAddFeedback(ticket.feedback?.rating || 0, e.target.value)}
            />
          </div>
        </div>
      )}

      {ticket.feedback && (
        <div className="mt-4 p-4 bg-gray-50 rounded-lg">
          <h4 className="text-sm font-medium text-gray-900 mb-2">Feedback</h4>
          <div className="flex items-center space-x-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <span
                key={star}
                className={`text-2xl ${
                  (ticket.feedback?.rating || 0) >= star
                    ? 'text-yellow-400'
                    : 'text-gray-300'
                }`}
              >
                ★
              </span>
            ))}
          </div>
          {ticket.feedback.comment && (
            <p className="mt-2 text-sm text-gray-600">{ticket.feedback.comment}</p>
          )}
        </div>
      )}

      {/* Message Input */}
      <div className="border-t border-gray-200 p-4">
        <form onSubmit={handleSendMessage} className="flex items-end space-x-4">
          <div className="flex-1">
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type your message..."
              className="input resize-none"
              rows={3}
            />
            {error && (
              <p className="mt-1 text-sm text-red-600">{error}</p>
            )}
          </div>
          <div className="flex space-x-2">
            <label className="btn btn-secondary cursor-pointer">
              <input
                type="file"
                className="hidden"
                onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
              />
              <Paperclip className="h-5 w-5" />
            </label>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading || (!message.trim() && !selectedFile)}
            >
              <Send className="h-5 w-5" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TicketDetails;