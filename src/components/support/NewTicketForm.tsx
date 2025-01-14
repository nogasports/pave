import React, { useState } from 'react';
import { LifeBuoy, Paperclip } from 'lucide-react';
import { SupportTicket } from '../../lib/firebase/support';
import { Employee } from '../../lib/firebase/employees';

interface NewTicketFormProps {
  currentUser: Employee;
  onSubmit: (data: Omit<SupportTicket, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  onClose: () => void;
}

const NewTicketForm: React.FC<NewTicketFormProps> = ({
  currentUser,
  onSubmit,
  onClose,
}) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'technical' as SupportTicket['category'],
    type: 'hardware' as SupportTicket['type'],
    priority: 'medium' as SupportTicket['priority'],
    hrRequestType: undefined as SupportTicket['hrRequestType'] | undefined,
  });

  const [attachments, setAttachments] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Handle file uploads if present
      let attachmentUrls: string[] = [];
      if (attachments.length > 0) {
        // Upload files and get URLs
        // attachmentUrls = await Promise.all(attachments.map(file => uploadFile(file)));
      }

      await onSubmit({
        ...formData,
        submittedBy: currentUser.id!,
        departmentId: currentUser.departmentId,
        attachments: attachmentUrls,
        messages: [],
        history: [],
      });
      
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create ticket');
      setLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setAttachments(prev => [...prev, ...files]);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-xl max-w-2xl w-full mx-4">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center">
            <LifeBuoy className="h-6 w-6 text-brand-600 mr-2" />
            <h2 className="text-lg font-medium text-gray-900">Create Support Ticket</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500"
          >
            ×
          </button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 mb-6">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700">
              Title
            </label>
            <input
              type="text"
              id="title"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              className="input mt-1"
              required
            />
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-700">
                Support Category
              </label>
              <select
                id="category"
                value={formData.category}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  category: e.target.value as SupportTicket['category'],
                  // Reset type when category changes
                  type: e.target.value === 'technical' ? 'hardware' : 'payroll'
                }))}
                className="input mt-1"
                required
              >
                <option value="technical">Technical Support</option>
                <option value="hr">HR Support</option>
                <option value="payroll">Payroll Support</option>
                <option value="benefits">Benefits Support</option>
                <option value="assets">Asset Support</option>
              </select>
            </div>

            <div>
              <label htmlFor="type" className="block text-sm font-medium text-gray-700">
                Issue Type
              </label>
              <select
                id="type"
                value={formData.type}
                onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value as SupportTicket['type'] }))}
                className="input mt-1"
                required
              >
                {formData.category === 'technical' ? (
                  <>
                    <option value="hardware">Hardware</option>
                    <option value="software">Software</option>
                    <option value="network">Network</option>
                    <option value="access">Access</option>
                    <option value="other">Other</option>
                  </>
                ) : formData.category === 'hr' ? (
                  <>
                    <option value="payroll">Payroll</option>
                    <option value="benefits">Benefits</option>
                    <option value="leave">Leave</option>
                    <option value="workplace">Workplace</option>
                    <option value="other">Other</option>
                  </>
                ) : formData.category === 'payroll' ? (
                  <>
                    <option value="salary">Salary</option>
                    <option value="deductions">Deductions</option>
                    <option value="allowances">Allowances</option>
                    <option value="other">Other</option>
                  </>
                ) : formData.category === 'benefits' ? (
                  <>
                    <option value="health">Health Insurance</option>
                    <option value="leave">Leave Benefits</option>
                    <option value="retirement">Retirement Benefits</option>
                    <option value="other">Other</option>
                  </>
                ) : (
                  <>
                    <option value="request">Asset Request</option>
                    <option value="issue">Asset Issue</option>
                    <option value="return">Asset Return</option>
                  </>
                )}
              </select>
            </div>

            <div>
              <label htmlFor="priority" className="block text-sm font-medium text-gray-700">
                Priority
              </label>
              <select
                id="priority"
                value={formData.priority}
                onChange={(e) => setFormData(prev => ({ ...prev, priority: e.target.value as SupportTicket['priority'] }))}
                className="input mt-1"
                required
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700">
              Description
            </label>
            <textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              className="input mt-1"
              rows={4}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Attachments
            </label>
            <div className="mt-1 flex items-center space-x-4">
              <label className="btn btn-secondary cursor-pointer">
                <Paperclip className="h-4 w-4 mr-2" />
                Add Files
                <input
                  type="file"
                  className="hidden"
                  multiple
                  onChange={handleFileChange}
                />
              </label>
              {attachments.length > 0 && (
                <span className="text-sm text-gray-500">
                  {attachments.length} file(s) selected
                </span>
              )}
            </div>
            {attachments.length > 0 && (
              <ul className="mt-2 text-sm text-gray-500">
                {attachments.map((file, index) => (
                  <li key={index} className="flex items-center">
                    <Paperclip className="h-4 w-4 mr-1" />
                    {file.name}
                    <button
                      type="button"
                      onClick={() => setAttachments(prev => prev.filter((_, i) => i !== index))}
                      className="ml-2 text-red-600 hover:text-red-800"
                    >
                      ×
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="btn btn-secondary"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? 'Creating...' : 'Create Ticket'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NewTicketForm;