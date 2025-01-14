import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Briefcase, MapPin, Clock } from 'lucide-react';
import { JobPosting, getJobPostings, updateJobPosting } from '../../lib/firebase/recruitment';
import { Department, getDepartments } from '../../lib/firebase/departments';
import ApplicationList from '../../components/recruitment/ApplicationList';

const JobPostingDetails: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [job, setJob] = useState<JobPosting | null>(null);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, [id]);

  const loadData = async () => {
    try {
      const [jobsData, departmentsData] = await Promise.all([
        getJobPostings(),
        getDepartments()
      ]);
      
      const jobPosting = jobsData.find(j => j.id === id);
      if (!jobPosting) {
        throw new Error('Job posting not found');
      }
      
      setJob(jobPosting);
      setDepartments(departmentsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handlePublish = async () => {
    if (!job?.id) return;
    try {
      await updateJobPosting(job.id, { status: 'Published' });
      await loadData();
    } catch (err) {
      setError('Failed to publish job posting');
    }
  };

  const handleClose = async () => {
    if (!job?.id) return;
    try {
      await updateJobPosting(job.id, { status: 'Closed' });
      await loadData();
    } catch (err) {
      setError('Failed to close job posting');
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div className="text-red-600">{error}</div>;
  if (!job) return <div>Job posting not found</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <button
          onClick={() => navigate('/business/recruitment')}
          className="flex items-center text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="h-5 w-5 mr-2" />
          Back to Recruitment
        </button>
        <div className="flex space-x-3">
          {job.status === 'Draft' && (
            <button
              onClick={handlePublish}
              className="btn btn-primary"
            >
              Publish
            </button>
          )}
          {job.status === 'Published' && (
            <button
              onClick={handleClose}
              className="btn btn-secondary"
            >
              Close Posting
            </button>
          )}
        </div>
      </div>

      <div className="card">
        <div className="flex justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{job.title}</h1>
            <div className="mt-2 flex items-center space-x-4 text-sm text-gray-500">
              <div className="flex items-center">
                <MapPin className="h-4 w-4 mr-1" />
                {departments.find(d => d.id === job.departmentId)?.name}
              </div>
              <div className="flex items-center">
                <Briefcase className="h-4 w-4 mr-1" />
                {job.type}
              </div>
              <div className="flex items-center">
                <Clock className="h-4 w-4 mr-1" />
                Closes {new Date(job.closingDate).toLocaleDateString()}
              </div>
            </div>
          </div>
          <div>
            <span className={`px-2 py-1 text-xs font-semibold rounded-none ${
              job.status === 'Published'
                ? 'bg-green-100 text-green-800'
                : job.status === 'Closed'
                ? 'bg-red-100 text-red-800'
                : 'bg-yellow-100 text-yellow-800'
            }`}>
              {job.status}
            </span>
          </div>
        </div>

        <div className="mt-6 prose max-w-none">
          <h2>Job Description</h2>
          <p>{job.description}</p>

          <h2>Requirements</h2>
          <ul>
            {job.requirements.map((req, index) => (
              <li key={index}>{req}</li>
            ))}
          </ul>

          <h2>Responsibilities</h2>
          <ul>
            {job.responsibilities.map((resp, index) => (
              <li key={index}>{resp}</li>
            ))}
          </ul>

          <h2>Qualifications</h2>
          <ul>
            {job.qualifications.map((qual, index) => (
              <li key={index}>{qual}</li>
            ))}
          </ul>

          {job.experience && (
            <>
              <h2>Experience</h2>
              <p>{job.experience}</p>
            </>
          )}

          {job.salary && (
            <>
              <h2>Compensation</h2>
              <p>
                {job.salary.min.toLocaleString()} - {job.salary.max.toLocaleString()} {job.salary.currency}
              </p>
            </>
          )}
        </div>
      </div>

      {/* Applications section will be added here */}
    </div>
  );
};

export default JobPostingDetails;