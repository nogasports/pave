import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Check, X } from 'lucide-react';
import { HeadcountRequest, getHeadcountRequests, updateHeadcountRequest } from '../../lib/firebase/recruitment';
import { Department, getDepartments } from '../../lib/firebase/departments';
import { Employee, getEmployees } from '../../lib/firebase/employees';

const HeadcountDetails: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [request, setRequest] = useState<HeadcountRequest | null>(null);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, [id]);

  const loadData = async () => {
    try {
      const [requestsData, departmentsData, employeesData] = await Promise.all([
        getHeadcountRequests(),
        getDepartments(),
        getEmployees()
      ]);
      
      const headcountRequest = requestsData.find(r => r.id === id);
      if (!headcountRequest) {
        throw new Error('Headcount request not found');
      }
      
      setRequest(headcountRequest);
      setDepartments(departmentsData);
      setEmployees(employeesData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async () => {
    if (!request?.id) return;
    try {
      await updateHeadcountRequest(request.id, {
        status: 'Approved',
        approvedAt: new Date(),
      });
      await loadData();
    } catch (err) {
      setError('Failed to approve request');
    }
  };

  const handleReject = async () => {
    if (!request?.id) return;
    try {
      await updateHeadcountRequest(request.id, {
        status: 'Rejected',
        approvedAt: new Date(),
      });
      await loadData();
    } catch (err) {
      setError('Failed to reject request');
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div className="text-red-600">{error}</div>;
  if (!request) return <div>Request not found</div>;

  const department = departments.find(d => d.id === request.departmentId);
  const hiringManager = employees.find(e => e.id === request.hiringManagerId);

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
        {request.status === 'Pending' && (
          <div className="flex space-x-3">
            <button
              onClick={handleApprove}
              className="btn btn-primary"
            >
              <Check className="h-4 w-4 mr-2" />
              Approve
            </button>
            <button
              onClick={handleReject}
              className="btn btn-secondary"
            >
              <X className="h-4 w-4 mr-2" />
              Reject
            </button>
          </div>
        )}
      </div>

      <div className="card">
        <div className="flex justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{request.position}</h1>
            <div className="mt-2 text-sm text-gray-500">
              {department?.name} • {request.count} {request.count === 1 ? 'position' : 'positions'}
            </div>
          </div>
          <span className={`px-2 py-1 text-xs font-semibold rounded-none ${
            request.status === 'Approved'
              ? 'bg-green-100 text-green-800'
              : request.status === 'Rejected'
              ? 'bg-red-100 text-red-800'
              : 'bg-yellow-100 text-yellow-800'
          }`}>
            {request.status}
          </span>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div>
            <h3 className="text-sm font-medium text-gray-500">Hiring Manager</h3>
            <p className="mt-1 text-sm text-gray-900">
              {hiringManager ? `${hiringManager.firstName} ${hiringManager.fatherName}` : 'Unknown'}
            </p>
          </div>

          <div>
            <h3 className="text-sm font-medium text-gray-500">Budget Range</h3>
            <p className="mt-1 text-sm text-gray-900">
              {request.budget.min.toLocaleString()} - {request.budget.max.toLocaleString()} {request.budget.currency}
            </p>
          </div>
        </div>

        <div className="mt-6 prose max-w-none">
          <h2>Business Justification</h2>
          <p>{request.justification}</p>

          <h2>Job Description</h2>
          <p>{request.jobDescription}</p>

          <h2>Requirements</h2>
          <p>{request.requirements}</p>

          <h2>Qualifications</h2>
          <p>{request.qualifications}</p>
        </div>

        {request.status === 'Approved' && (
          <div className="mt-6">
            <button
              onClick={() => navigate('/business/recruitment')}
              className="btn btn-primary w-full"
            >
              Create Job Posting
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default HeadcountDetails;