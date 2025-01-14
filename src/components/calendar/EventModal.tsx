import React, { useState, useEffect } from 'react';
import { X, Clock, MapPin, Users, Link as LinkIcon } from 'lucide-react';
import { CalendarEvent } from '../../lib/firebase/calendar';
import { Employee } from '../../lib/firebase/employees';
import { Department } from '../../lib/firebase/departments';

interface EventModalProps {
  event?: CalendarEvent;
  employees: Employee[];
  departments: Department[];
  currentUser: Employee;
  onSubmit: (data: Omit<CalendarEvent, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  onClose: () => void;
}

const EventModal: React.FC<EventModalProps> = ({
  event,
  employees,
  departments,
  currentUser,
  onSubmit,
  onClose,
}) => {
  const [formData, setFormData] = useState({
    title: event?.title || '',
    description: event?.description || '',
    startDate: event?.startDate ? new Date(event.startDate).toISOString().slice(0, 16) : '',
    endDate: event?.endDate ? new Date(event.endDate).toISOString().slice(0, 16) : '',
    location: event?.location || '',
    type: event?.type || 'meeting',
    status: event?.status || 'scheduled',
    departmentId: event?.departmentId || '',
    isPrivate: event?.isPrivate || false,
    meetingLink: event?.meetingLink || '',
    reminderMinutes: event?.reminderMinutes || 15,
    attendees: event?.attendees || [currentUser.id!],
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showAttendeeSearch, setShowAttendeeSearch] = useState(false);
  const [attendeeSearch, setAttendeeSearch] = useState('');

  const filteredEmployees = employees.filter(emp => {
    if (!attendeeSearch) return !formData.attendees.includes(emp.id!);
    const fullName = `${emp.firstName} ${emp.fatherName}`.toLowerCase();
    return (
      !formData.attendees.includes(emp.id!) &&
      fullName.includes(attendeeSearch.toLowerCase())
    );
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await onSubmit({
        ...formData,
        startDate: new Date(formData.startDate),
        endDate: new Date(formData.endDate),
        organizer: currentUser.id!,
      } as CalendarEvent);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save event');
      setLoading(false);
    }
  };

  const handleAddAttendee = (employeeId: string) => {
    setFormData(prev => ({
      ...prev,
      attendees: [...prev.attendees, employeeId]
    }));
    setAttendeeSearch('');
    setShowAttendeeSearch(false);
  };

  const handleRemoveAttendee = (employeeId: string) => {
    setFormData(prev => ({
      ...prev,
      attendees: prev.attendees.filter(id => id !== employeeId)
    }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4">
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">
            {event ? 'Edit Event' : 'New Event'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3">
              {error}
            </div>
          )}

          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700">
              Event Title
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

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700">
              Description
            </label>
            <textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              className="input mt-1"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div>
              <label htmlFor="startDate" className="block text-sm font-medium text-gray-700">
                Start Date & Time
              </label>
              <input
                type="datetime-local"
                id="startDate"
                value={formData.startDate}
                onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
                className="input mt-1"
                required
              />
            </div>

            <div>
              <label htmlFor="endDate" className="block text-sm font-medium text-gray-700">
                End Date & Time
              </label>
              <input
                type="datetime-local"
                id="endDate"
                value={formData.endDate}
                onChange={(e) => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
                className="input mt-1"
                required
                min={formData.startDate}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div>
              <label htmlFor="type" className="block text-sm font-medium text-gray-700">
                Event Type
              </label>
              <select
                id="type"
                value={formData.type}
                onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value as CalendarEvent['type'] }))}
                className="input mt-1"
                required
              >
                <option value="meeting">Meeting</option>
                <option value="training">Training</option>
                <option value="review">Review</option>
                <option value="event">Event</option>
              </select>
            </div>

            <div>
              <label htmlFor="department" className="block text-sm font-medium text-gray-700">
                Department
              </label>
              <select
                id="department"
                value={formData.departmentId}
                onChange={(e) => setFormData(prev => ({ ...prev, departmentId: e.target.value }))}
                className="input mt-1"
              >
                <option value="">All Departments</option>
                {departments.map(dept => (
                  <option key={dept.id} value={dept.id}>{dept.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
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
                placeholder="Room name or address"
              />
            </div>

            <div>
              <label htmlFor="meetingLink" className="block text-sm font-medium text-gray-700">
                Meeting Link
              </label>
              <input
                type="url"
                id="meetingLink"
                value={formData.meetingLink}
                onChange={(e) => setFormData(prev => ({ ...prev, meetingLink: e.target.value }))}
                className="input mt-1"
                placeholder="Video conference link"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Attendees
            </label>
            <div className="mt-1 space-y-2">
              <div className="relative">
                <input
                  type="text"
                  value={attendeeSearch}
                  onChange={(e) => {
                    setAttendeeSearch(e.target.value);
                    setShowAttendeeSearch(true);
                  }}
                  className="input"
                  placeholder="Search employees..."
                />
                {showAttendeeSearch && filteredEmployees.length > 0 && (
                  <div className="absolute z-10 w-full mt-1 bg-white shadow-lg max-h-60 rounded-lg border border-gray-200 overflow-auto">
                    {filteredEmployees.map(emp => (
                      <button
                        key={emp.id}
                        type="button"
                        onClick={() => handleAddAttendee(emp.id!)}
                        className="w-full px-4 py-2 text-left hover:bg-gray-50"
                      >
                        <div className="text-sm font-medium text-gray-900">
                          {emp.firstName} {emp.fatherName}
                        </div>
                        <div className="text-sm text-gray-500">{emp.jobTitle}</div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.attendees.map(attendeeId => {
                  const attendee = employees.find(emp => emp.id === attendeeId);
                  return (
                    <div
                      key={attendeeId}
                      className="inline-flex items-center px-2 py-1 rounded-full text-sm bg-gray-100"
                    >
                      <span className="text-gray-900">
                        {attendee ? `${attendee.firstName} ${attendee.fatherName}` : 'Unknown'}
                      </span>
                      {attendeeId !== currentUser.id && (
                        <button
                          type="button"
                          onClick={() => handleRemoveAttendee(attendeeId)}
                          className="ml-1 text-gray-400 hover:text-gray-600"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div>
              <label htmlFor="reminderMinutes" className="block text-sm font-medium text-gray-700">
                Reminder
              </label>
              <select
                id="reminderMinutes"
                value={formData.reminderMinutes}
                onChange={(e) => setFormData(prev => ({ ...prev, reminderMinutes: Number(e.target.value) }))}
                className="input mt-1"
              >
                <option value="0">No reminder</option>
                <option value="5">5 minutes before</option>
                <option value="15">15 minutes before</option>
                <option value="30">30 minutes before</option>
                <option value="60">1 hour before</option>
                <option value="1440">1 day before</option>
              </select>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="isPrivate"
                checked={formData.isPrivate}
                onChange={(e) => setFormData(prev => ({ ...prev, isPrivate: e.target.checked }))}
                className="h-4 w-4 text-brand-600 focus:ring-brand-500 border-gray-300 rounded"
              />
              <label htmlFor="isPrivate" className="ml-2 block text-sm text-gray-900">
                Private event
              </label>
            </div>
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
              {loading ? 'Saving...' : event ? 'Update Event' : 'Create Event'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EventModal;