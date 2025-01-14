import React, { useState, useEffect } from 'react';
import { TrendingUp, Plus, User, Building2, Check, X } from 'lucide-react';
import { PromotionRequest, getPromotionRequests, addPromotionRequest, updatePromotionRequest } from '../../lib/firebase/promotions';
import { Department, getDepartments } from '../../lib/firebase/departments';
import { Employee, getEmployees } from '../../lib/firebase/employees';
import { ReviewCycle, getReviewCycles } from '../../lib/firebase/reviews';
import PromotionRequestModal from './PromotionRequestModal';

const PromotionSection: React.FC = () => {
  const [promotions, setPromotions] = useState<PromotionRequest[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [reviewCycles, setReviewCycles] = useState<ReviewCycle[]>([]);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [promotionsData, departmentsData, employeesData, cyclesData] = await Promise.all([
        getPromotionRequests(),
        getDepartments(),
        getEmployees(),
        getReviewCycles()
      ]);
      setPromotions(promotionsData);
      setDepartments(departmentsData);
      setEmployees(employeesData);
      setReviewCycles(cyclesData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleAddPromotion = async (data: Omit<PromotionRequest, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      await addPromotionRequest(data);
      await loadData();
      setShowRequestModal(false);
    } catch (err) {
      setError('Failed to add promotion request');
    }
  };

  const handleApprovePromotion = async (id: string) => {
    try {
      await updatePromotionRequest(id, {
        status: 'Approved',
        approvedAt: new Date(),
      });
      await loadData();
    } catch (err) {
      setError('Failed to approve promotion');
    }
  };

  const handleRejectPromotion = async (id: string) => {
    try {
      await updatePromotionRequest(id, {
        status: 'Rejected',
        approvedAt: new Date(),
      });
      await loadData();
    } catch (err) {
      setError('Failed to reject promotion');
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-medium text-gray-900">Career Progression</h2>
        <button 
          onClick={() => setShowRequestModal(true)}
          className="btn btn-primary"
        >
          <Plus className="h-4 w-4 mr-2" />
          Request Promotion
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3">
          {error}
        </div>
      )}

      {/* Promotion Requests */}
      <div className="space-y-4">
        {promotions.map((promotion) => {
          const employee = employees.find(e => e.id === promotion.employeeId);
          const department = departments.find(d => d.id === promotion.departmentId);
          
          return (
            <div key={promotion.id} className="card">
              <div className="flex justify-between">
                <div>
                  <h3 className="text-lg font-medium text-gray-900">
                    {employee?.firstName} {employee?.fatherName}
                  </h3>
                  <div className="mt-1 text-sm text-gray-500">
                    {department?.name}
                  </div>
                  <div className="mt-2 text-sm">
                    <span className="text-gray-500">Current Position:</span>
                    <span className="ml-2 text-gray-900">{promotion.currentPosition}</span>
                  </div>
                  <div className="mt-1 text-sm">
                    <span className="text-gray-500">Proposed Position:</span>
                    <span className="ml-2 text-gray-900">{promotion.proposedPosition}</span>
                  </div>
                  {promotion.reviewScore && (
                    <div className="mt-1 text-sm">
                      <span className="text-gray-500">Review Score:</span>
                      <span className="ml-2 text-gray-900">{promotion.reviewScore.toFixed(1)}/5</span>
                    </div>
                  )}
                </div>
                <div className="flex items-start space-x-4">
                  <span className={`px-2 py-1 text-xs font-semibold rounded-none ${
                    promotion.status === 'Approved'
                      ? 'bg-green-100 text-green-800'
                      : promotion.status === 'Rejected'
                      ? 'bg-red-100 text-red-800'
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {promotion.status}
                  </span>
                  {promotion.status === 'Pending' && (
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleApprovePromotion(promotion.id!)}
                        className="text-green-600 hover:text-green-900"
                      >
                        <Check className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => handleRejectPromotion(promotion.id!)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <X className="h-5 w-5" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
              {promotion.reason && (
                <div className="mt-4 text-sm text-gray-600">
                  <p className="font-medium text-gray-900">Justification:</p>
                  <p className="mt-1">{promotion.reason}</p>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Promotion Request Modal */}
      {showRequestModal && (
        <PromotionRequestModal
          departments={departments}
          employees={employees}
          reviewCycles={reviewCycles}
          onSubmit={handleAddPromotion}
          onClose={() => setShowRequestModal(false)}
        />
      )}

      {/* Rest of the existing code... */}
    </div>
  );
};

export default PromotionSection;