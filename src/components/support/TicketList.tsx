import React from 'react';
import { MessageSquare, Clock, AlertCircle } from 'lucide-react';
import { SupportTicket } from '../../lib/firebase/support';
import { Employee } from '../../lib/firebase/employees';
import { Department } from '../../lib/firebase/departments';

interface TicketListProps {
  tickets: SupportTicket[];
  employees?: Employee[];
  departments?: Department[];
  selectedTicketId?: string;
  onSelectTicket: (ticket: SupportTicket) => void;
}

const TicketList: React.FC<TicketListProps> = ({
  tickets,
  employees,
  departments,
  selectedTicketId,
  onSelectTicket,
}) => {
  const getEmployeeName = (id: string) => {
    const employee = employees?.find(e => e.id === id);
    return employee ? `${employee.firstName} ${employee.fatherName}` : 'Unknown';
  };

  const getDepartmentName = (id: string) => {
    return departments?.find(d => d.id === id)?.name || 'Unknown Department';
  };

  const getPriorityIcon = (priority: SupportTicket['priority']) => {
    switch (priority) {
      case 'urgent':
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      case 'high':
        return <AlertCircle className="h-5 w-5 text-orange-500" />;
      case 'medium':
        return <Clock className="h-5 w-5 text-yellow-500" />;
      default:
        return <MessageSquare className="h-5 w-5 text-blue-500" />;
    }
  };

  return (
    <div className="space-y-4">
      {tickets.length === 0 ? (
        <div className="text-center py-12">
          <MessageSquare className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No tickets</h3>
          <p className="mt-1 text-sm text-gray-500">
            Get started by creating a new support ticket
          </p>
        </div>
      ) : (
        tickets.map((ticket) => (
          <div
            key={ticket.id}
            onClick={() => onSelectTicket(ticket)}
            className={`card cursor-pointer hover:shadow-md transition-shadow ${
              selectedTicketId === ticket.id ? 'ring-2 ring-brand-500' : ''
            }`}
          >
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0">
                {getPriorityIcon(ticket.priority)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-medium text-gray-900 truncate">
                    {ticket.title}
                  </h3>
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
                <div className="mt-1">
                  <p className="text-sm text-gray-500 truncate">
                    {ticket.description}
                  </p>
                </div>
                <div className="mt-2 flex items-center justify-between text-xs text-gray-500">
                  <div>
                    By: {getEmployeeName(ticket.submittedBy)}
                  </div>
                  <div>
                    {new Date(ticket.createdAt).toLocaleDateString()}
                  </div>
                </div>
                {ticket.departmentId && (
                  <div className="mt-1 text-xs text-gray-500">
                    {getDepartmentName(ticket.departmentId)}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default TicketList;