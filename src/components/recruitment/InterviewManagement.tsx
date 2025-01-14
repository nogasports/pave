import React, { useState } from 'react';
import { Calendar, Users, Video, Phone, MapPin, Search } from 'lucide-react';
import { JobApplication } from '../../lib/firebase/recruitment';
import { Employee } from '../../lib/firebase/employees';
import InterviewScheduler from './InterviewScheduler';

interface InterviewManagementProps {
  applications: JobApplication[];
  employees: Employee[];
  onStatusChange: (id: string, status: JobApplication['status']) => Promise<void>;
  onScheduleInterview: (id: string, data: {
    date: Date;
    type: 'phone' | 'video' | 'in-person';
    interviewers: string[];
    location?: string;
  }) => Promise<void>;
}

const InterviewManagement: React.FC<InterviewManagementProps> = ({
  applications,
  employees,
  onStatusChange,
  onScheduleInterview,
}) => {
  const [selectedApplication, setSelectedApplication] = useState<JobApplication | null>(null);
  const [showScheduler, setShowScheduler] = useState(false);
  const [filters, setFilters] = useState({
    type: '',
    status: '',
    search: '',
  });

  const getInterviewIcon = (type?: string) => {
    switch (type) {
      case 'phone':
        return <Phone className="h-5 w-5 text-gray-400" />;
      case 'video':
        return <Video className="h-5 w-5 text-gray-400" />;
      case 'in-person':
        return <MapPin className="h-5 w-5 text-gray-400" />;
      default:
        return <Calendar className="h-5 w-5 text-gray-400" />;
    }
  };

  const filteredApplications = applications.filter(app => {
    if (filters.type && app.interviewType !== filters.type) return false;
    if (filters.status && app.interviewStatus !== filters.status) return false;
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      return (
        app.firstName.toLowerCase().includes(searchTerm) ||
        app.lastName.toLowerCase().includes(searchTerm) ||
        app.email.toLowerCase().includes(searchTerm)
      );
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="card">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div>
            <label htmlFor="typeFilter" className="block text-sm font-medium text-gray-700">
              Interview Type
            </label>
            <select
              id="typeFilter"
              value={filters.type}
              onChange={(e) => setFilters(prev => ({ ...prev, type: e.target.value }))}
              className="input mt-1"
            >
              <option value="">All Types</option>
              <option value="phone">Phone</option>
              <option value="video">Video</option>
              <option value="in-person">In-Person</option>
            </select>
          </div>

          <div>
            <label htmlFor="statusFilter" className="block text-sm font-medium text-gray-700">
              Status
            </label>
            <select
              id="statusFilter"
              value={filters.status}
              onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
              className="input mt-1"
            >
              <option value="">All Status</option>
              <option value="scheduled">Scheduled</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
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
                placeholder="Search candidates..."
                className="input pl-10"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Interviews List */}
      <div className="space-y-4">
        {filteredApplications.length === 0 ? (
          <div className="text-center py-12">
            <Calendar className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No interviews scheduled</h3>
            <p className="mt-1 text-sm text-gray-500">
              Schedule interviews for candidates in the screening phase.
            </p>
          </div>
        ) : (
          filteredApplications.map((application) => (
            <div key={application.id} className="card">
              <div className="flex justify-between">
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    {getInterviewIcon(application.interviewType)}
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">
                      {application.firstName} {application.lastName}
                    </h3>
                    <div className="mt-1 text-sm text-gray-500">
                      {application.interviewType?.charAt(0).toUpperCase() + 
                       application.interviewType?.slice(1)} Interview
                    </div>
                    {application.interviewDate && (
                      <div className="mt-2 text-sm text-gray-700">
                        {new Date(application.interviewDate).toLocaleString()}
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <span className={`px-2 py-1 text-xs font-semibold rounded-none ${
                    application.interviewStatus === 'completed'
                      ? 'bg-green-100 text-green-800'
                      : application.interviewStatus === 'cancelled'
                      ? 'bg-red-100 text-red-800'
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {application.interviewStatus}
                  </span>
                  <button
                    onClick={() => {
                      setSelectedApplication(application);
                      setShowScheduler(true);
                    }}
                    className="btn btn-secondary"
                  >
                    Reschedule
                  </button>
                </div>
              </div>

              {/* Interviewers */}
              {application.interviewers && application.interviewers.length > 0 && (
                <div className="mt-4 flex items-center space-x-2">
                  <Users className="h-4 w-4 text-gray-400" />
                  <div className="text-sm text-gray-500">
                    Interviewers: {application.interviewers.map(id => {
                      const interviewer = employees.find(e => e.id === id);
                      return interviewer ? `${interviewer.firstName} ${interviewer.fatherName}` : '';
                    }).filter(Boolean).join(', ')}
                  </div>
                </div>
              )}

              {/* Location for in-person interviews */}
              {application.interviewType === 'in-person' && application.interviewLocation && (
                <div className="mt-2 flex items-center space-x-2">
                  <MapPin className="h-4 w-4 text-gray-400" />
                  <div className="text-sm text-gray-500">
                    Location: {application.interviewLocation}
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Interview Scheduler Modal */}
      {showScheduler && selectedApplication && (
        <InterviewScheduler
          application={selectedApplication}
          interviewers={employees.filter(e => e.position === 'Manager')}
          onSchedule={(data) => onScheduleInterview(selectedApplication.id!, data)}
          onClose={() => {
            setShowScheduler(false);
            setSelectedApplication(null);
          }}
        />
      )}
    </div>
  );
};

export default InterviewManagement;