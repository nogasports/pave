import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Users, Search, Filter, Download } from 'lucide-react';
import { JobApplication, getJobApplications, updateJobApplication } from '../../lib/firebase/recruitment';
import { useNavigate } from 'react-router-dom';
import { JobPosting, getJobPostings } from '../../lib/firebase/recruitment';
import ApplicationList from '../../components/recruitment/ApplicationList';
import { wrapFirebaseOperation } from '../../lib/utils/errorHandling';

const ApplicationManagement: React.FC = () => {
  const navigate = useNavigate();
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [jobs, setJobs] = useState<JobPosting[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    jobId: '',
    status: '',
    search: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [applicationsData, jobsData] = await Promise.all([
        wrapFirebaseOperation(() => getJobApplications(), 'Error loading applications'),
        wrapFirebaseOperation(() => getJobPostings(), 'Error loading jobs')
      ]);
      setApplications(applicationsData);
      setJobs(jobsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const filteredApplications = applications.filter(app => {
    if (filters.jobId && app.jobPostingId !== filters.jobId) return false;
    if (filters.status && app.status !== filters.status) return false;
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

  const exportApplications = () => {
    // TODO: Implement CSV export
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-900">Job Applications</h1>
        <button
          onClick={exportApplications}
          className="btn btn-secondary"
        >
          <Download className="h-4 w-4 mr-2" />
          Export
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3">
          {error}
        </div>
      )}

      {/* Filters */}
      <div className="card">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div>
            <label htmlFor="jobFilter" className="block text-sm font-medium text-gray-700">
              Job Posting
            </label>
            <select
              id="jobFilter"
              value={filters.jobId}
              onChange={(e) => setFilters(prev => ({ ...prev, jobId: e.target.value }))}
              className="input mt-1"
            >
              <option value="">All Positions</option>
              {jobs.map(job => (
                <option key={job.id} value={job.id}>{job.title}</option>
              ))}
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
              <option value="New">New</option>
              <option value="Screening">Screening</option>
              <option value="Interview">Interview</option>
              <option value="Offer">Offer</option>
              <option value="Hired">Hired</option>
              <option value="Rejected">Rejected</option>
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
                placeholder="Search applications..."
                className="input pl-10"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Applications List */}
      <ApplicationList
        applications={filteredApplications}
        onStatusChange={async (id, status) => {
          try {
            await wrapFirebaseOperation(
              () => updateJobApplication(id, { status }),
              'Error updating application status'
            );
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
  );
};

export default ApplicationManagement;