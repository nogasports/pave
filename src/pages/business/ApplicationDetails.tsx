import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Download, Mail, Phone, Calendar, Building2, Check } from 'lucide-react';
import { JobApplication, getJobApplications, updateJobApplication } from '../../lib/firebase/recruitment';
import { JobPosting, getJobPostings } from '../../lib/firebase/recruitment';
import { wrapFirebaseOperation } from '../../lib/utils/errorHandling';

const ApplicationDetails: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [application, setApplication] = useState<JobApplication | null>(null);
  const [job, setJob] = useState<JobPosting | null>(null);
  const [showInterviewScheduler, setShowInterviewScheduler] = useState(false);
  const [interviewers, setInterviewers] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, [id]);

  const loadData = async () => {
    try {
      const applications = await wrapFirebaseOperation(
        () => getJobApplications(),
        'Error loading application'
      );
      const application = applications.find(a => a.id === id);
      if (!application) {
        throw new Error('Application not found');
      }
      setApplication(application);

      const jobs = await wrapFirebaseOperation(
        () => getJobPostings(),
        'Error loading job posting'
      );
      const job = jobs.find(j => j.id === application.jobPostingId);
      setJob(job || null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (status: JobApplication['status']) => {
    if (!application?.id) return;
    try {
      await wrapFirebaseOperation(
        () => updateJobApplication(application.id!, { status }),
        'Error updating status'
      );
      await loadData();
    } catch (err) {
      setError('Failed to update application status');
    }
  };

  const handleScheduleInterview = async (interviewData: {
    date: Date;
    type: 'phone' | 'video' | 'in-person';
    interviewers: string[];
    location?: string;
  }) => {
    if (!application?.id) return;
    
    try {
      await updateJobApplication(application.id, {
        status: 'Interview',
        interviewStatus: 'scheduled',
        interviewDate: interviewData.date,
        interviewType: interviewData.type,
        interviewers: interviewData.interviewers,
        interviewLocation: interviewData.location,
      });
      
      // Create calendar event for interviewers
      await addCalendarEvent({
        title: `Interview: ${application.firstName} ${application.lastName}`,
        description: `Job: ${job?.title}\nCandidate: ${application.firstName} ${application.lastName}\nType: ${interviewData.type}`,
        startDate: interviewData.date,
        endDate: new Date(interviewData.date.getTime() + 60 * 60 * 1000), // 1 hour duration
        location: interviewData.location,
        type: 'meeting',
        status: 'scheduled',
        organizer: user!.uid,
        attendees: [...interviewData.interviewers, user!.uid],
        isPrivate: true,
        reminderMinutes: 15,
      });
      
      await loadData();
    } catch (err) {
      setError('Failed to schedule interview');
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div className="text-red-600">{error}</div>;
  if (!application || !job) return <div>Application not found</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <button
          onClick={() => navigate('/business/recruitment/applications')}
          className="flex items-center text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="h-5 w-5 mr-2" />
          Back to Applications
        </button>
        <div className="flex space-x-3">
          <select
            value={application.status}
            onChange={(e) => handleStatusChange(e.target.value as JobApplication['status'])}
            className="input"
          >
            <option value="New">New</option>
            <option value="Screening">Screening</option>
            <option value="Interview">Interview</option>
            <option value="Offer">Offer</option>
            <option value="Hired">Hired</option>
            <option value="Rejected">Rejected</option>
          </select>
          {application.status === 'Screening' && (
            <button
              onClick={() => setShowInterviewScheduler(true)}
              className="btn btn-primary"
            >
              Schedule Interview
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          <div className="card">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Application Details</h2>
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-gray-500">Applied Position</h3>
                <p className="mt-1 text-sm text-gray-900">{job.title}</p>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-500">Cover Letter</h3>
                <p className="mt-1 text-sm text-gray-900 whitespace-pre-wrap">
                  {application.coverLetter}
                </p>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-500">Work Experience</h3>
                <p className="mt-1 text-sm text-gray-900 whitespace-pre-wrap">
                  {application.workExperience}
                </p>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-500">Education</h3>
                <p className="mt-1 text-sm text-gray-900 whitespace-pre-wrap">
                  {application.education}
                </p>
              </div>
            </div>
          </div>

          <div className="card">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Notes & Interview Feedback</h2>
            <textarea
              value={application.notes || ''}
              onChange={async (e) => {
                try {
                  await wrapFirebaseOperation(
                    () => updateJobApplication(application.id!, { notes: e.target.value }),
                    'Error updating notes'
                  );
                  await loadData();
                } catch (err) {
                  setError('Failed to update notes');
                }
              }}
              className="input w-full"
              rows={4}
              placeholder="Add notes about the candidate..."
            />
          </div>

          {application.interviewStatus === 'completed' && (
            <div className="card">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Interview Feedback</h2>
              <div className="space-y-4">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Technical Skills
                    </label>
                    <input
                      type="number"
                      value={application.interviewFeedback?.technical || 0}
                      onChange={async (e) => {
                        try {
                          await updateJobApplication(application.id!, {
                            interviewFeedback: {
                              ...application.interviewFeedback,
                              technical: Number(e.target.value)
                            }
                          });
                          await loadData();
                        } catch (err) {
                          setError('Failed to update feedback');
                        }
                      }}
                      className="input mt-1"
                      min="1"
                      max="5"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Communication
                    </label>
                    <input
                      type="number"
                      value={application.interviewFeedback?.communication || 0}
                      onChange={async (e) => {
                        try {
                          await updateJobApplication(application.id!, {
                            interviewFeedback: {
                              ...application.interviewFeedback,
                              communication: Number(e.target.value)
                            }
                          });
                          await loadData();
                        } catch (err) {
                          setError('Failed to update feedback');
                        }
                      }}
                      className="input mt-1"
                      min="1"
                      max="5"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Comments
                  </label>
                  <textarea
                    value={application.interviewFeedback?.comments || ''}
                    onChange={async (e) => {
                      try {
                        await updateJobApplication(application.id!, {
                          interviewFeedback: {
                            ...application.interviewFeedback,
                            comments: e.target.value
                          }
                        });
                        await loadData();
                      } catch (err) {
                        setError('Failed to update feedback');
                      }
                    }}
                    className="input mt-1"
                    rows={4}
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <div className="card">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Candidate Information</h2>
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-gray-500">Name</h3>
                <p className="mt-1 text-sm text-gray-900">
                  {application.firstName} {application.lastName}
                </p>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-500">Contact</h3>
                <div className="mt-1 space-y-2">
                  <a 
                    href={`mailto:${application.email}`}
                    className="flex items-center text-sm text-brand-600 hover:text-brand-700"
                  >
                    <Mail className="h-4 w-4 mr-2" />
                    {application.email}
                  </a>
                  <a
                    href={`tel:${application.phone}`}
                    className="flex items-center text-sm text-brand-600 hover:text-brand-700"
                  >
                    <Phone className="h-4 w-4 mr-2" />
                    {application.phone}
                  </a>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-500">Current Employment</h3>
                <div className="mt-1 space-y-1">
                  {application.currentCompany && (
                    <div className="flex items-center text-sm text-gray-900">
                      <Building2 className="h-4 w-4 mr-2 text-gray-400" />
                      {application.currentPosition} at {application.currentCompany}
                    </div>
                  )}
                  <div className="flex items-center text-sm text-gray-900">
                    <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                    {application.experience} years experience
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-500">Documents</h3>
                <div className="mt-2 space-y-2">
                  <a
                    href={application.resumeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-secondary w-full flex items-center justify-center"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download Resume
                  </a>
                </div>
              </div>
            </div>
          </div>

          <div className="card">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Application Timeline</h2>
            <div className="space-y-4">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
                    <Check className="h-4 w-4 text-green-600" />
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-900">Application Submitted</p>
                  <p className="text-sm text-gray-500">
                    {new Date(application.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
              {/* Add more timeline events based on status changes */}
            </div>
          </div>
        </div>
      </div>

      {/* Interview Scheduler Modal */}
      {showInterviewScheduler && (
        <InterviewScheduler
          application={application}
          interviewers={interviewers}
          onSchedule={handleScheduleInterview}
          onClose={() => setShowInterviewScheduler(false)}
        />
      )}
    </div>
  );
};

export default ApplicationDetails;