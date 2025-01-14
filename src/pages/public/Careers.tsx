import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Briefcase, MapPin, Clock, ChevronRight, Building2, Users, Award } from 'lucide-react';
import { JobPosting, getJobPostings } from '../../lib/firebase/recruitment';
import { Department, getDepartments } from '../../lib/firebase/departments';

const Careers: React.FC = () => {
  const [jobs, setJobs] = useState<JobPosting[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [jobsData, departmentsData] = await Promise.all([
        getJobPostings('Published'),
        getDepartments()
      ]);
      setJobs(jobsData);
      setDepartments(departmentsData);
    } catch (err) {
      setError('Failed to load job postings');
    } finally {
      setLoading(false);
    }
  };

  const getDepartmentName = (id: string) => {
    return departments.find(d => d.id === id)?.name || '';
  };

  const benefits = [
    {
      icon: Award,
      title: "Competitive Compensation",
      description: "Attractive salary packages with performance bonuses and annual increments"
    },
    {
      icon: Users,
      title: "Professional Development",
      description: "Continuous learning opportunities and career growth paths"
    },
    {
      icon: Building2,
      title: "Modern Workplace",
      description: "State-of-the-art facilities and collaborative work environment"
    }
  ];

  if (loading) return <div>Loading...</div>;
  if (error) return <div className="text-red-600">{error}</div>;

  return (
    <div className="bg-white">
      {/* Hero Section */}
      <div className="relative bg-brand-700">
        <div className="absolute inset-0">
          <img
            className="w-full h-full object-cover"
            src="https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?q=80&w=2070&auto=format&fit=crop"
            alt="Careers at Pave Logistics"
          />
          <div className="absolute inset-0 bg-brand-700 mix-blend-multiply" />
        </div>
        <div className="relative max-w-7xl mx-auto py-24 px-4 sm:py-32 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold text-white sm:text-5xl md:text-6xl">
            ወደ ቡድናችን ይቀላቀሉ<br/>
            <span className="text-brand-100">Join Our Team</span>
          </h1>
          <p className="mt-6 max-w-3xl text-xl text-brand-100">
            Be part of Ethiopia's leading logistics company and help shape the future of transportation.
          </p>
        </div>
      </div>

      {/* Benefits Section */}
      <div className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900">Why Work With Us</h2>
            <p className="mt-4 text-lg text-gray-500">
              Join a team that values innovation, growth, and excellence
            </p>
          </div>

          <div className="mt-16 grid grid-cols-1 gap-8 md:grid-cols-3">
            {benefits.map((benefit, index) => (
              <div key={index} className="card group hover:shadow-lg transition-all duration-300">
                <benefit.icon className="h-10 w-10 text-brand-600 group-hover:scale-110 transition-transform duration-300" />
                <h3 className="mt-4 text-lg font-medium text-gray-900">{benefit.title}</h3>
                <p className="mt-2 text-base text-gray-500">{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Job Listings */}
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900">Open Positions</h2>
          <p className="mt-4 text-lg text-gray-500">
            Explore opportunities to grow your career with Pave Logistics
          </p>
        </div>

        <div className="space-y-8">
          {jobs.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">No open positions at the moment.</p>
            </div>
          ) : (
            jobs.map((job) => (
              <div key={job.id} className="card hover:shadow-md transition-shadow group">
                <div className="flex flex-col sm:flex-row justify-between">
                  <div className="space-y-4">
                    <div>
                      <h2 className="text-xl font-semibold text-gray-900 group-hover:text-brand-600 transition-colors">
                        {job.title}
                      </h2>
                      <div className="mt-1 flex items-center text-sm text-gray-500">
                        <MapPin className="h-4 w-4 mr-1" />
                        {getDepartmentName(job.departmentId)}
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                      <div className="flex items-center">
                        <Briefcase className="h-4 w-4 mr-1" />
                        {job.type}
                      </div>
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 mr-1" />
                        Closes {new Date(job.closingDate).toLocaleDateString()}
                      </div>
                    </div>

                    <p className="text-gray-600 line-clamp-2">{job.description}</p>
                  </div>

                  <div className="mt-4 sm:mt-0 sm:ml-4 flex items-start">
                    <Link 
                      to={`/careers/${job.id}`}
                      className="btn btn-primary flex items-center group-hover:bg-brand-700"
                    >
                      View Details
                      <ChevronRight className="h-4 w-4 ml-2" />
                    </Link>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Careers;