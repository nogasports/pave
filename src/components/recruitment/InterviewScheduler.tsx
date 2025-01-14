import React, { useState } from 'react';
import { Calendar, Clock, Users, MapPin, Video, Phone, User } from 'lucide-react';
import { JobApplication } from '../../lib/firebase/recruitment';
import { Employee } from '../../lib/firebase/employees';

interface InterviewSchedulerProps {
  application: JobApplication;
  interviewers: Employee[];
  onSchedule: (data: {
    date: Date;
    type: 'phone' | 'video' | 'in-person';
    interviewers: string[];
    location?: string;
  }) => Promise<void>;
  onClose: () => void;
}

const InterviewScheduler: React.FC<InterviewSchedulerProps> = ({
  application,
  interviewers,
  onSchedule,
  onClose,
}) => {
  const [formData, setFormData] = useState({
    date: '',
    time: '',
    type: 'video' as 'phone' | 'video' | 'in-person',
    interviewers: [] as string[],
    location: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const dateTime = new Date(`${formData.date}T${formData.time}`);
      await onSchedule({
        date: dateTime,
        type: formData.type,
        interviewers: formData.interviewers,
        location: formData.location,
      });
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to schedule interview');
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full mx-4">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-medium text-gray-900">Schedule Interview</h2>
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
            <label htmlFor="type" className="block text-sm font-medium text-gray-700">
              Interview Type
            </label>
            <select
              id="type"
              value={formData.type}
              onChange={(e) => setFormData(prev => ({ 
                ...prev, 
                type: e.target.value as typeof formData.type 
              }))}
              className="input mt-1"
              required
            >
              <option value="phone">Phone Interview</option>
              <option value="video">Video Interview</option>
              <option value="in-person">In-Person Interview</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="date" className="block text-sm font-medium text-gray-700">
                Date
              </label>
              <input
                type="date"
                id="date"
                value={formData.date}
                onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                className="input mt-1"
                min={new Date().toISOString().split('T')[0]}
                required
              />
            </div>

            <div>
              <label htmlFor="time" className="block text-sm font-medium text-gray-700">
                Time
              </label>
              <input
                type="time"
                id="time"
                value={formData.time}
                onChange={(e) => setFormData(prev => ({ ...prev, time: e.target.value }))}
                className="input mt-1"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Interviewers
            </label>
            <div className="mt-2 space-y-2">
              {interviewers.map(interviewer => (
                <label key={interviewer.id} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.interviewers.includes(interviewer.id!)}
                    onChange={(e) => {
                      setFormData(prev => ({
                        ...prev,
                        interviewers: e.target.checked
                          ? [...prev.interviewers, interviewer.id!]
                          : prev.interviewers.filter(id => id !== interviewer.id)
                      }));
                    }}
                    className="rounded-none border-gray-300 text-brand-600 focus:ring-brand-600"
                  />
                  <span className="ml-2 text-sm text-gray-700">
                    {interviewer.firstName} {interviewer.fatherName}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {formData.type === 'in-person' && (
            <div>
              <label htmlFor="location" className="block text-sm font-medium text-gray-700">
                Location
              </label>
              <input
                type="text"
                id="location"
                value={formData.location}
                onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                className="input mt-1"
                required
                placeholder="Enter interview location"
              />
            </div>
          )}

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
              {loading ? 'Scheduling...' : 'Schedule Interview'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default InterviewScheduler;