import React from 'react';
import { User, FileText, Calendar, Users, ArrowRight } from 'lucide-react';
import { JobApplication } from '../../lib/firebase/recruitment';

interface ApplicationListProps {
  applications: JobApplication[];
  onStatusChange: (id: string, status: JobApplication['status']) => void;
  onView: (application: JobApplication) => void;
}

const ApplicationList: React.FC<ApplicationListProps> = ({ 
  applications, 
  onStatusChange,
  onView
}) => {
  const getStatusColor = (status: JobApplication['status']) => {
    switch (status) {
      case 'New':
        return 'bg-blue-100 text-blue-800';
      case 'Screening':
        return 'bg-yellow-100 text-yellow-800';
      case 'Interview':
        return 'bg-purple-100 text-purple-800';
      case 'Offer':
        return 'bg-green-100 text-green-800';
      case 'Hired':
        return 'bg-brand-100 text-brand-800';
      case 'Rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-4">
      {applications.length === 0 ? (
        <div className="text-center py-12">
          <Users className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No applications yet</h3>
          <p className="mt-1 text-sm text-gray-500">
            Applications will appear here when candidates apply for jobs.
          </p>
        </div>
      ) : (
        applications.map((application) => (
        <div key={application.id} className="card">
          <div className="flex justify-between">
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0">
                <div className="h-10 w-10 bg-gray-100 flex items-center justify-center">
                  <User className="h-6 w-6 text-gray-400" />
                </div>
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-900">
                  {application.firstName} {application.lastName}
                </h3>
                <div className="mt-1 text-sm text-gray-500">
                  {application.email} • {application.phone}
                </div>
                <div className="mt-2 flex items-center space-x-4 text-sm">
                  <div className="flex items-center">
                    <FileText className="h-4 w-4 text-gray-400 mr-1" />
                    {application.experience} years experience
                  </div>
                  {application.interviewStatus && (
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 text-gray-400 mr-1" />
                      Interview {application.interviewStatus}
                      {application.interviewDate && (
                        <span className="ml-1">
                          ({new Date(application.interviewDate).toLocaleDateString()})
                        </span>
                      )}
                    </div>
                  )}
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 text-gray-400 mr-1" />
                    Applied {new Date(application.createdAt).toLocaleDateString()}
                  </div>
                </div>
              </div>
            </div>
            <div className="flex items-start space-x-4">
              <select
                value={application.status}
                onChange={(e) => onStatusChange(application.id!, e.target.value as JobApplication['status'])}
                className={`px-2 py-1 text-xs font-semibold rounded-none border-0 ${getStatusColor(application.status)}`}
              >
                <option value="New">New</option>
                <option value="Screening">Screening</option>
                <option value="Interview">Interview</option>
                <option value="Offer">Offer</option>
                <option value="Hired">Hired</option>
                <option value="Rejected">Rejected</option>
              </select>
              <button
                onClick={() => onView(application)}
                className="text-brand-600 hover:text-brand-900"
              >
                <ArrowRight className="h-5 w-5" />
              </button>
            </div>
          </div>
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <span className="text-sm font-medium text-gray-500">Current Position</span>
              <p className="mt-1 text-sm text-gray-900">
                {application.currentPosition || 'Not specified'}
                {application.currentCompany && ` at ${application.currentCompany}`}
              </p>
            </div>
            <div>
              <span className="text-sm font-medium text-gray-500">Notice Period</span>
              <p className="mt-1 text-sm text-gray-900">
                {application.noticePeriod || 'Not specified'}
              </p>
            </div>
            <div>
              <span className="text-sm font-medium text-gray-500">Expected Salary</span>
              <p className="mt-1 text-sm text-gray-900">
                {application.expectedSalary?.toLocaleString()} ETB
              </p>
            </div>
          </div>
        </div>
        ))
      )}
    </div>
  );
};

export default ApplicationList;