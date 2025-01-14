import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Plus, Search } from 'lucide-react';
import { CalendarEvent } from '../../lib/firebase/calendar';
import { Employee } from '../../lib/firebase/employees';
import { Department } from '../../lib/firebase/departments';

interface CalendarViewProps {
  events?: CalendarEvent[];
  employees?: Employee[];
  departments?: Department[];
  onEventClick?: (event: CalendarEvent) => void;
  onAddEvent?: () => void;
}

const CalendarView: React.FC<CalendarViewProps> = ({ 
  events = [], 
  employees = [],
  departments = [],
  onEventClick,
  onAddEvent 
}) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showEventForm, setShowEventForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    startDate: '',
    startTime: '',
    endDate: '',
    endTime: '',
    location: '',
    type: 'meeting' as const,
    attendees: [] as string[],
    departmentId: '',
    isPrivate: false,
    meetingLink: '',
    reminderMinutes: 15,
  });
  const [attendeeSearch, setAttendeeSearch] = useState('');
  const [showAttendeeResults, setShowAttendeeResults] = useState(false);

  // Filter employees based on search
  const filteredEmployees = attendeeSearch.trim()
    ? employees.filter(emp => {
        const fullName = `${emp.firstName} ${emp.fatherName}`.toLowerCase();
        return fullName.includes(attendeeSearch.toLowerCase());
      })
    : [];

  const handleAddEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!onAddEvent) return;
    
    // Validate dates
    const startDateTime = new Date(`${formData.startDate}T${formData.startTime}`);
    const endDateTime = new Date(`${formData.endDate}T${formData.endTime}`);
    
    if (endDateTime <= startDateTime) {
      setError('End time must be after start time');
      return;
    }

    // Check for scheduling conflicts
    const conflicts = await checkScheduleConflicts(
      formData.attendees[0], // Organizer's ID
      startDateTime,
      endDateTime
    );

    if (conflicts.length > 0) {
      setError('There are scheduling conflicts with existing events');
      return;
    }

    await onAddEvent({
      title: formData.title,
      description: formData.description,
      startDate: startDateTime,
      endDate: endDateTime,
      location: formData.location,
      type: formData.type,
      attendees: formData.attendees,
      departmentId: formData.departmentId || undefined,
      isPrivate: formData.isPrivate,
      meetingLink: formData.meetingLink,
      reminderMinutes: formData.reminderMinutes,
      status: 'scheduled',
    });

    setShowEventForm(false);
    setFormData({
      title: '',
      description: '',
      startDate: '',
      startTime: '',
      endDate: '',
      endTime: '',
      location: '',
      type: 'meeting',
      attendees: [],
      departmentId: '',
      isPrivate: false,
      meetingLink: '',
      reminderMinutes: 15,
    });
  };

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const getDayEvents = (date: Date) => {
    const dayEvents = events.filter(event => {
      const eventDate = new Date(event.startDate);
      return (
        eventDate.getDate() === date.getDate() &&
        eventDate.getMonth() === date.getMonth() &&
        eventDate.getFullYear() === date.getFullYear()
      );
    });
    
    // Sort events by start time
    return dayEvents.sort((a, b) => 
      new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
    );
  };

  const renderCalendarDays = () => {
    const days = [];
    const daysInMonth = getDaysInMonth(currentDate);
    const firstDay = getFirstDayOfMonth(currentDate);

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="h-24 bg-gray-50" />);
    }

    // Add cells for each day of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
      const isToday = new Date().toDateString() === date.toDateString();
      const isSelected = selectedDate?.toDateString() === date.toDateString();
      const dayEvents = getDayEvents(date);

      days.push(
        <div
          key={day}
          onClick={() => {
            setSelectedDate(date);
          }}
          className={`h-24 border border-gray-200 p-2 cursor-pointer hover:bg-gray-50 ${
            isToday ? 'bg-brand-50' : ''
          } ${isSelected ? 'ring-2 ring-brand-500' : ''}`}
        >
          <div className="flex justify-between items-center">
            <span className={`text-sm ${isToday ? 'font-bold text-brand-600' : ''}`}>
              {day}
            </span>
            {dayEvents.length > 0 && (
              <span className="text-xs bg-brand-100 text-brand-600 px-2 py-0.5 rounded-full">
                {dayEvents.length}
              </span>
            )}
          </div>
          <div className="mt-1 space-y-1">
            {dayEvents.slice(0, 2).map((event) => (
              <button
                key={event.id}
                onClick={(e) => {
                  e.stopPropagation();
                  onEventClick?.(event);
                }}
                className="w-full text-left text-xs truncate p-1 rounded bg-brand-50 text-brand-600"
              >
                {event.title}
              </button>
            ))}
            {dayEvents.length > 2 && (
              <div className="text-xs text-gray-500 text-center">
                +{dayEvents.length - 2} more
              </div>
            )}
          </div>
        </div>
      );
    }

    return days;
  };

  const goToPreviousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  return (
    <div className="bg-white rounded-lg shadow">
      {/* Calendar Header */}
      <div className="p-4 flex items-center justify-between border-b border-gray-200">
        <div className="flex items-center">
          <button
            onClick={() => setShowEventForm(true)}
            className="btn btn-primary"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Event
          </button>
          <div className="mx-4 border-l border-gray-200 h-6" />
          <button
            onClick={goToPreviousMonth}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <ChevronLeft className="h-5 w-5 text-gray-600" />
          </button>
          <h2 className="mx-4 text-lg font-semibold text-gray-900">
            {currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
          </h2>
          <button
            onClick={goToNextMonth}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <ChevronRight className="h-5 w-5 text-gray-600" />
          </button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="p-4">
        {/* Weekday Headers */}
        <div className="grid grid-cols-7 gap-2 mb-2">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="text-sm font-medium text-gray-500 text-center">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Days */}
        <div className="grid grid-cols-7 gap-2">
          {renderCalendarDays()}
        </div>
      </div>

      {/* Event Form Modal */}
      {showEventForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-2xl w-full mx-4">
            <h2 className="text-lg font-medium text-gray-900 mb-6">Add New Event</h2>
            <form onSubmit={handleAddEvent} className="space-y-6">
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
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
                  <label htmlFor="type" className="block text-sm font-medium text-gray-700">
                    Event Type
                  </label>
                  <select
                    id="type"
                    value={formData.type}
                    onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value as 'meeting' | 'training' | 'review' | 'event' }))}
                    className="input mt-1"
                    required
                  >
                    <option value="meeting">Meeting</option>
                    <option value="training">Training</option>
                    <option value="review">Review</option>
                    <option value="event">Event</option>
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
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div>
                  <label htmlFor="startDate" className="block text-sm font-medium text-gray-700">
                    Start Date
                  </label>
                  <input
                    type="date"
                    id="startDate"
                    value={formData.startDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
                    className="input mt-1"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="startTime" className="block text-sm font-medium text-gray-700">
                    Start Time
                  </label>
                  <input
                    type="time"
                    id="startTime"
                    value={formData.startTime}
                    onChange={(e) => setFormData(prev => ({ ...prev, startTime: e.target.value }))}
                    className="input mt-1"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="endDate" className="block text-sm font-medium text-gray-700">
                    End Date
                  </label>
                  <input
                    type="date"
                    id="endDate"
                    value={formData.endDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
                    className="input mt-1"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="endTime" className="block text-sm font-medium text-gray-700">
                    End Time
                  </label>
                  <input
                    type="time"
                    id="endTime"
                    value={formData.endTime}
                    onChange={(e) => setFormData(prev => ({ ...prev, endTime: e.target.value }))}
                    className="input mt-1"
                    required
                  />
                </div>
              </div>

              <div>
                <label htmlFor="departmentId" className="block text-sm font-medium text-gray-700">
                  Department
                </label>
                <select
                  id="departmentId"
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

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Attendees
                </label>
                <div className="relative mt-1">
                  <div className="flex items-center">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="text"
                      value={attendeeSearch}
                      onChange={(e) => {
                        setAttendeeSearch(e.target.value);
                        setShowAttendeeResults(true);
                      }}
                      className="input pl-10"
                      placeholder="Search attendees..."
                    />
                  </div>
                  {showAttendeeResults && filteredEmployees.length > 0 && (
                    <div className="absolute z-10 w-full mt-1 bg-white shadow-lg rounded-lg border border-gray-200">
                      {filteredEmployees.map(emp => (
                        <div
                          key={emp.id}
                          className="px-4 py-2 hover:bg-gray-50 cursor-pointer"
                          onClick={() => {
                            if (emp.id && !formData.attendees.includes(emp.id)) {
                              setFormData(prev => ({
                                ...prev,
                                attendees: [...prev.attendees, emp.id!]
                              }));
                            }
                            setAttendeeSearch('');
                            setShowAttendeeResults(false);
                          }}
                        >
                          {emp.firstName} {emp.fatherName}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <div className="mt-2 flex flex-wrap gap-2">
                  {formData.attendees.map(attendeeId => {
                    const attendee = employees.find(emp => emp.id === attendeeId);
                    return attendee ? (
                      <span
                        key={attendeeId}
                        className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-gray-100"
                      >
                        {attendee.firstName} {attendee.fatherName}
                        <button
                          type="button"
                          onClick={() => setFormData(prev => ({
                            ...prev,
                            attendees: prev.attendees.filter(id => id !== attendeeId)
                          }))}
                          className="ml-1 text-gray-400 hover:text-gray-600"
                        >
                          ×
                        </button>
                      </span>
                    ) : null;
                  })}
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
                    placeholder="https://..."
                  />
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
                  </select>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="isPrivate"
                    checked={formData.isPrivate}
                    onChange={(e) => setFormData(prev => ({ ...prev, isPrivate: e.target.checked }))}
                    className="rounded-none border-gray-300 text-brand-600 focus:ring-brand-600"
                  />
                  <label htmlFor="isPrivate" className="ml-2 text-sm text-gray-700">
                    Private Event
                  </label>
                </div>
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowEventForm(false)}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                >
                  Create Event
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CalendarView;