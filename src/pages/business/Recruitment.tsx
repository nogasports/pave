import React, { useState, useEffect } from 'react';
import { Users, FileText, Calendar, CheckCircle, Plus, Eye, Edit2, Check, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { 
  HeadcountRequest, JobPosting, JobApplication,
  getHeadcountRequests, getJobPostings, getJobApplications,
  addHeadcountRequest, updateHeadcountRequest,
  addJobPosting, updateJobPosting, updateJobApplication
} from '../../lib/firebase/recruitment';
import { Department, getDepartments } from '../../lib/firebase/departments';
import { Employee, getEmployees } from '../../lib/firebase/employees';
import OnboardingOffboardingSection from '../../components/recruitment/OnboardingOffboardingSection';
import HeadcountRequestForm from '../../components/recruitment/HeadcountRequestForm';
import JobPostingForm from '../../components/recruitment/JobPostingForm';
import ApplicationList from '../../components/recruitment/ApplicationList';
import InterviewManagement from '../../components/recruitment/InterviewManagement';

const Recruitment: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'headcount' | 'jobs' | 'applications' | 'interviews' | 'onboarding' | 'offboarding'>('headcount');
  const [headcountRequests, setHeadcountRequests] = useState<HeadcountRequest[]>([]);
  const [jobPostings, setJobPostings] = useState<JobPosting[]>([]);
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showHeadcountForm, setShowHeadcountForm] = useState(false);
  const [showJobPostingForm, setShowJobPostingForm] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [headcountData, jobsData, applicationsData, departmentsData, employeesData] = await Promise.all([
        getHeadcountRequests(),
        getJobPostings(),
        getJobApplications(),
        getDepartments(),
        getEmployees()
      ]);

      setHeadcountRequests(headcountData);
      setJobPostings(jobsData);
      setApplications(applicationsData);
      setDepartments(departmentsData);
      setEmployees(employeesData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleAddHeadcount = async (data: Omit<HeadcountRequest, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      await addHeadcountRequest(data);
      await loadData();
      setShowHeadcountForm(false);
    } catch (err) {
      setError('Failed to add headcount request');
    }
  };

  const handleAddJobPosting = async (data: Omit<JobPosting, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      await addJobPosting(data);
      await loadData();
      setShowJobPostingForm(false);
    } catch (err) {
      setError('Failed to add job posting');
    }
  };

  const handleApproveHeadcount = async (id: string) => {
    try {
      await updateHeadcountRequest(id, {
        status: 'Approved',
        approvedAt: new Date(),
      });
      await loadData();
    } catch (err) {
      setError('Failed to approve headcount request');
    }
  };

  const handleRejectHeadcount = async (id: string) => {
    try {
      await updateHeadcountRequest(id, {
        status: 'Rejected',
        approvedAt: new Date(),
      });
      await loadData();
    } catch (err) {
      setError('Failed to reject headcount request');
    }
  };

  const handlePublishJob = async (id: string) => {
    try {
      await updateJobPosting(id, { status: 'Published' });
      await loadData();
    } catch (err) {
      setError('Failed to publish job posting');
    }
  };

  const handleStatusChange = async (id: string, status: string) => {
    try {
      await updateJobApplication(id, { status });
      await loadData();
    } catch (err) {
      setError('Failed to update application status');
    }
  };

  const handleScheduleInterview = async (applicationId: string, interviewDetails: any) => {
    try {
      // Implement interview scheduling logic
      await loadData();
    } catch (err) {
      setError('Failed to schedule interview');
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-900">Recruitment</h1>
        <div className="flex space-x-3">
          {activeTab === 'headcount' && (
            <button
              onClick={() => setShowHeadcountForm(true)}
              className="btn btn-primary"
            >
              <Plus className="h-4 w-4 mr-2" />
              Request Headcount
            </button>
          )}
          {activeTab === 'jobs' && (
            <button
              onClick={() => setShowJobPostingForm(true)}
              className="btn btn-primary"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Job Posting
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('headcount')}
            className={`
              group inline-flex items-center py-4 px-1 border-b-2 font-medium text-sm
              ${activeTab === 'headcount'
                ? 'border-brand-600 text-brand-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}
            `}
          >
            Headcount Requests
          </button>
          <button
            onClick={() => setActiveTab('jobs')}
            className={`
              group inline-flex items-center py-4 px-1 border-b-2 font-medium text-sm
              ${activeTab === 'jobs'
                ? 'border-brand-600 text-brand-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}
            `}
          >
            Job Postings
          </button>
          <button
            onClick={() => setActiveTab('applications')}
            className={`
              group inline-flex items-center py-4 px-1 border-b-2 font-medium text-sm
              ${activeTab === 'applications'
                ? 'border-brand-600 text-brand-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}
            `}
          >
            Applications
          </button>
          <button
            onClick={() => setActiveTab('interviews')}
            className={`
              group inline-flex items-center py-4 px-1 border-b-2 font-medium text-sm
              ${activeTab === 'interviews'
                ? 'border-brand-600 text-brand-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}
            `}
          >
            Interviews
          </button>
          <button
            onClick={() => setActiveTab('onboarding')}
            className={`
              group inline-flex items-center py-4 px-1 border-b-2 font-medium text-sm
              ${activeTab === 'onboarding'
                ? 'border-brand-600 text-brand-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}
            `}
          >
            Onboarding
          </button>
          <button
            onClick={() => setActiveTab('offboarding')}
            className={`
              group inline-flex items-center py-4 px-1 border-b-2 font-medium text-sm
              ${activeTab === 'offboarding'
                ? 'border-brand-600 text-brand-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}
            `}
          >
            Offboarding
          </button>
        </nav>
      </div>

      {/* Content */}
      {activeTab === 'headcount' && (
        <div className="space-y-6">
          {headcountRequests.map((request) => (
            <div key={request.id} className="card">
              <div className="flex justify-between">
                <div>
                  <h3 className="text-lg font-medium text-gray-900">
                    {request.position}
                  </h3>
                  <div className="mt-1 text-sm text-gray-500">
                    {departments.find(d => d.id === request.departmentId)?.name}
                  </div>
                  <div className="mt-4 text-sm text-gray-700">
                    {request.justification}
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <span className={`px-2 py-1 text-xs font-semibold rounded-none ${
                    request.status === 'Approved'
                      ? 'bg-green-100 text-green-800'
                      : request.status === 'Rejected'
                      ? 'bg-red-100 text-red-800'
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {request.status}
                  </span>
                  {request.status === 'Pending' && (
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleApproveHeadcount(request.id!)}
                        className="text-green-600 hover:text-green-900"
                      >
                        <Check className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => handleRejectHeadcount(request.id!)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <X className="h-5 w-5" />
                      </button>
                    </div>
                  )}
                  <button
                    onClick={() => navigate(`/business/recruitment/headcount/${request.id}`)}
                    className="text-brand-600 hover:text-brand-900"
                  >
                    <Eye className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'jobs' && (
        <div className="space-y-6">
          {jobPostings.map((job) => (
            <div key={job.id} className="card">
              <div className="flex justify-between">
                <div>
                  <h3 className="text-lg font-medium text-gray-900">
                    {job.title}
                  </h3>
                  <div className="mt-1 text-sm text-gray-500">
                    {departments.find(d => d.id === job.departmentId)?.name}
                  </div>
                  <div className="mt-2 flex items-center space-x-4 text-sm">
                    <span className="text-gray-500">{job.type}</span>
                    <span className="text-gray-500">
                      Closes: {new Date(job.closingDate).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <span className={`px-2 py-1 text-xs font-semibold rounded-none ${
                    job.status === 'Published'
                      ? 'bg-green-100 text-green-800'
                      : job.status === 'Closed'
                      ? 'bg-red-100 text-red-800'
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {job.status}
                  </span>
                  {job.status === 'Draft' && (
                    <button
                      onClick={() => handlePublishJob(job.id!)}
                      className="text-brand-600 hover:text-brand-900"
                    >
                      Publish
                    </button>
                  )}
                  <button
                    onClick={() => navigate(`/business/recruitment/job/${job.id}`)}
                    className="text-brand-600 hover:text-brand-900"
                  >
                    <Eye className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'applications' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-medium text-gray-900">Job Applications</h2>
          </div>
          <ApplicationList
            applications={applications}
            onStatusChange={async (id, status) => {
              try {
                await updateJobApplication(id, { status });
                await loadData();
              } catch (err) {
                setError('Failed to update application status');
              }
            }}
            onView={(application) => {
              navigate(`/business/recruitment/applications/${application.id}`);
            }}
          />
        </div>
      )}

      {activeTab === 'interviews' && (
        <InterviewManagement 
          applications={applications.filter(a => a.status === 'Interview')}
          employees={employees}
          onStatusChange={handleStatusChange}
          onScheduleInterview={handleScheduleInterview}
        />
      )}

      {activeTab === 'onboarding' && (
        <OnboardingOffboardingSection
          type="onboarding"
          employees={employees}
        />
      )}

      {activeTab === 'offboarding' && (
        <OnboardingOffboardingSection
          type="offboarding"
          employees={employees} 
        />
      )}

      {/* Forms */}
      {showHeadcountForm && (
        <HeadcountRequestForm
          departments={departments}
          managers={employees.filter(e => e.position === 'Manager')}
          onSubmit={handleAddHeadcount}
          onCancel={() => setShowHeadcountForm(false)}
        />
      )}

      {showJobPostingForm && (
        <JobPostingForm
          departments={departments}
          headcountRequests={headcountRequests.filter(r => r.status === 'Approved')}
          onSubmit={handleAddJobPosting}
          onCancel={() => setShowJobPostingForm(false)}
        />
      )}
    </div>
  );
};

export default Recruitment;