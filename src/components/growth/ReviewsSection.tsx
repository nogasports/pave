import React, { useState, useEffect } from 'react';
import { Star, Plus, Calendar, Users, CheckCircle } from 'lucide-react';
import { ReviewCycle, Review, getReviewCycles, getReviews, addReviewCycle } from '../../lib/firebase/reviews';
import { Employee, getEmployees } from '../../lib/firebase/employees';
import ReviewCycleForm from './ReviewCycleForm';

const ReviewsSection: React.FC = () => {
  const [cycles, setCycles] = useState<ReviewCycle[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [showCycleForm, setShowCycleForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [cyclesData, reviewsData, employeesData] = await Promise.all([
        getReviewCycles(),
        getReviews(),
        getEmployees()
      ]);
      setCycles(cyclesData);
      setReviews(reviewsData);
      setEmployees(employeesData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleAddCycle = async (data: Omit<ReviewCycle, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      await addReviewCycle(data);
      await loadData();
      setShowCycleForm(false);
    } catch (err) {
      setError('Failed to create review cycle');
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div className="text-red-600">{error}</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-medium text-gray-900">Performance Reviews</h2>
        <button 
          onClick={() => setShowCycleForm(true)}
          className="btn btn-primary"
        >
          <Plus className="h-4 w-4 mr-2" />
          New Review Cycle
        </button>
      </div>

      {/* Review Cycles */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {cycles.map((cycle) => (
          <div key={cycle.id} className="card">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-lg font-medium text-gray-900">{cycle.name}</h3>
                <div className="mt-1 flex items-center text-sm text-gray-500">
                  <Calendar className="h-4 w-4 mr-1" />
                  {new Date(cycle.startDate).toLocaleDateString()} - {new Date(cycle.endDate).toLocaleDateString()}
                </div>
              </div>
              <span className={`px-2 py-1 text-xs font-semibold rounded-none ${
                cycle.status === 'Active'
                  ? 'bg-green-100 text-green-800'
                  : cycle.status === 'Completed'
                  ? 'bg-blue-100 text-blue-800'
                  : 'bg-yellow-100 text-yellow-800'
              }`}>
                {cycle.status}
              </span>
            </div>
            
            <div className="mt-4 space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Review Types</span>
                <div className="space-x-2">
                  {cycle.reviewers.self && <span className="text-gray-900">Self</span>}
                  {cycle.reviewers.manager && <span className="text-gray-900">Manager</span>}
                  {cycle.reviewers.peer && <span className="text-gray-900">Peer</span>}
                </div>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Questions</span>
                <span className="text-gray-900">{cycle.questions.length}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Completion</span>
                <span className="text-gray-900">
                  {Math.round((reviews.filter(r => 
                    r.cycleId === cycle.id && 
                    r.status === 'Completed'
                  ).length / reviews.filter(r => 
                    r.cycleId === cycle.id
                  ).length) * 100)}%
                </span>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-gray-200">
              <button className="btn btn-secondary w-full">
                View Details
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Reviews Overview */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="card">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Reviews to Complete</h3>
          <div className="space-y-4">
            {reviews
              .filter(r => r.status !== 'Completed')
              .slice(0, 5)
              .map((review) => (
              <div key={review.id} className="flex items-center justify-between p-4 bg-gray-50">
                <div>
                  <p className="font-medium text-gray-900">
                    {employees.find(e => e.id === review.employeeId)?.firstName} {employees.find(e => e.id === review.employeeId)?.fatherName}
                  </p>
                  <p className="text-sm text-gray-500">
                    {review.reviewerType} Review • {review.status}
                  </p>
                </div>
                <button className="btn btn-secondary">Start Review</button>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Completed Reviews</h3>
          <div className="space-y-4">
            {reviews
              .filter(r => r.status === 'Completed')
              .slice(0, 5)
              .map((review) => (
              <div key={review.id} className="flex items-center justify-between p-4 bg-gray-50">
                <div>
                  <p className="font-medium text-gray-900">
                    {employees.find(e => e.id === review.employeeId)?.firstName} {employees.find(e => e.id === review.employeeId)?.fatherName}
                  </p>
                  <div className="flex items-center mt-1">
                    <Star className="h-4 w-4 text-yellow-400" />
                    <span className="ml-1 text-sm text-gray-500">{review.rating}/5</span>
                  </div>
                </div>
                <button className="text-brand-600 hover:text-brand-700">View Details</button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Review Cycle Form */}
      {showCycleForm && (
        <ReviewCycleForm
          onSubmit={handleAddCycle}
          onCancel={() => setShowCycleForm(false)}
        />
      )}
    </div>
  );
};

export default ReviewsSection;