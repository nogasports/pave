import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Briefcase, MapPin, Clock, ChevronRight } from 'lucide-react';
import { JobPosting, getJobPostings } from '../../lib/firebase/recruitment';
import { Department, getDepartments } from '../../lib/firebase/departments';
import JobApplicationForm from '../../components/recruitment/JobApplicationForm';

const JobDetails: React.FC = () => {
  const { id } = useParams();
  const [job, setJob] = useState<JobPosting | null>(null);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [showApplicationForm, setShowApplicationForm] = useState(false);
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

  const getDepartmentName = (deptId: string) => {
    return departments.find(d => d.id === deptId)?.name || '';
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div className="text-red-600">{error}</div>;
  if (!job) return <div>Job posting not found</div>;

  return (
    <div className="bg-white">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <Link 
            to="/careers"
            className="flex items-center text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Back to Careers
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{job.title}</h1>
              <div className="mt-4 flex flex-wrap gap-4 text-sm text-gray-500">
                <div className="flex items-center">
                  <MapPin className="h-4 w-4 mr-1" />
                  {getDepartmentName(job.departmentId)}
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

            <div className="prose max-w-none">
              <h2>About the Role</h2>
              <p>{job.description}</p>

              <h2>Key Responsibilities</h2>
              <ul>
                {job.responsibilities.map((resp, index) => (
                  <li key={index}>{resp}</li>
                ))}
              </ul>

              <h2>Requirements</h2>
              <ul>
                {job.requirements.map((req, index) => (
                  <li key={index}>{req}</li>
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
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-8 space-y-6">
              <div className="card">
                <h3 className="text-lg font-medium text-gray-900">Job Summary</h3>
                <dl className="mt-4 space-y-4">
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Department</dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      {getDepartmentName(job.departmentId)}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Employment Type</dt>
                    <dd className="mt-1 text-sm text-gray-900">{job.type}</dd>
                  </div>
                  {job.salary && (
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Salary Range</dt>
                      <dd className="mt-1 text-sm text-gray-900">
                        {job.salary.min.toLocaleString()} - {job.salary.max.toLocaleString()} {job.salary.currency}
                      </dd>
                    </div>
                  )}
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Closing Date</dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      {new Date(job.closingDate).toLocaleDateString()}
                    </dd>
                  </div>
                </dl>

                <div className="mt-6">
                  <button
                    onClick={() => setShowApplicationForm(true)}
                    className="btn btn-primary w-full"
                  >
                    Apply Now
                    <ChevronRight className="h-4 w-4 ml-2" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showApplicationForm && (
        <Link 
          to={`/careers/${job.id}/apply`}
          state={{ job }}
          className="hidden"
        />
      )}
    </div>
  );
};

export default JobDetails;