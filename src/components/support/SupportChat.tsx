import React, { useState, useEffect } from 'react';
import { MessageSquare, Send, Paperclip } from 'lucide-react';
import { SupportTicket } from '../../lib/firebase/support';
import { Employee } from '../../lib/firebase/employees';

interface SupportChatProps {
  ticket: SupportTicket;
  currentUser: Employee;
  onSendMessage: (content: string, attachments?: File[]) => Promise<void>;
  onClose: () => void;
}

const SupportChat: React.FC<SupportChatProps> = ({
  ticket,
  currentUser,
  onSendMessage,
  onClose,
}) => {
  const [message, setMessage] = useState('');
  const [attachments, setAttachments] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() && attachments.length === 0) return;

    setLoading(true);
    try {
      await onSendMessage(message, attachments);
      setMessage('');
      setAttachments([]);
    } catch (err) {
      setError('Failed to send message');
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setAttachments(prev => [...prev, ...files]);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex justify-between items-center p-4 border-b">
        <div>
          <h3 className="text-lg font-medium text-gray-900">{ticket.title}</h3>
          <p className="text-sm text-gray-500">#{ticket.id}</p>
        </div>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-500">×</button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {ticket.messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.senderId === currentUser.id ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`max-w-[70%] ${msg.senderId === currentUser.id ? 'bg-brand-600 text-white' : 'bg-gray-100'} rounded-lg p-3`}>
              <p className="text-sm">{msg.content}</p>
              {msg.attachments?.map((url, i) => (
                <a
                  key={i}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs underline block mt-1"
                >
                  Attachment {i + 1}
                </a>
              ))}
              <span className="text-xs opacity-75 block mt-1">
                {new Date(msg.timestamp).toLocaleTimeString()}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} className="p-4 border-t">
        {error && <p className="text-red-600 text-sm mb-2">{error}</p>}
        <div className="flex items-end space-x-2">
          <div className="flex-1">
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="input w-full resize-none"
              rows={3}
              placeholder="Type your message..."
            />
            {attachments.length > 0 && (
              <div className="mt-2 space-y-1">
                {attachments.map((file, i) => (
                  <div key={i} className="flex items-center text-sm">
                    <Paperclip className="h-4 w-4 mr-1" />
                    <span>{file.name}</span>
                    <button
                      type="button"
                      onClick={() => setAttachments(prev => prev.filter((_, index) => index !== i))}
                      className="ml-2 text-red-600"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="flex space-x-2">
            <label className="btn btn-secondary cursor-pointer">
              <input
                type="file"
                className="hidden"
                multiple
                onChange={handleFileChange}
              />
              <Paperclip className="h-5 w-5" />
            </label>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading || (!message.trim() && attachments.length === 0)}
            >
              <Send className="h-5 w-5" />
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default SupportChat;