import React, { useState, useEffect } from 'react';
import { Star, BookOpen, TrendingUp, Target } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { Employee, getEmployees } from '../../lib/firebase/employees';
import { 
  Objective,
  getObjectives,
  KeyResult,
  updateObjective 
} from '../../lib/firebase/objectives';
import {
  Training,
  getTrainings
} from '../../lib/firebase/learning';
import {
  PromotionRequest,
  getPromotionRequests,
  addPromotionRequest
} from '../../lib/firebase/promotions';

const Growth: React.FC = () => {
  const { user } = useAuth();
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [objectives, setObjectives] = useState<Objective[]>([]);
  const [trainings, setTrainings] = useState<Training[]>([]);
  const [promotions, setPromotions] = useState<PromotionRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, [user]);

  const loadData = async () => {
    try {
      // Get employee record
      const employees = await getEmployees();
      const currentEmployee = employees.find(emp => emp.workEmail === user?.email);
      if (!currentEmployee) {
        throw new Error('Employee record not found');
      }
      setEmployee(currentEmployee);

      // Load growth data
      const [objectivesData, trainingsData, promotionsData] = await Promise.all([
        getObjectives(currentEmployee.id),
        getTrainings(currentEmployee.departmentId),
        getPromotionRequests(currentEmployee.id)
      ]);

      setObjectives(objectivesData);
      setTrainings(trainingsData);
      setPromotions(promotionsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateKeyResult = async (objectiveId: string, keyResult: KeyResult) => {
    try {
      const objective = objectives.find(o => o.id === objectiveId);
      if (!objective) return;

      const updatedKeyResults = objective.keyResults.map(kr =>
        kr.id === keyResult.id ? keyResult : kr
      );

      await updateObjective(objectiveId, {
        keyResults: updatedKeyResults,
        progress: calculateProgress(updatedKeyResults)
      });

      await loadData();
    } catch (err) {
      setError('Failed to update key result');
    }
  };

  const calculateProgress = (keyResults: KeyResult[]) => {
    const totalWeight = keyResults.reduce((sum, kr) => sum + kr.weight, 0);
    const weightedProgress = keyResults.reduce((sum, kr) => {
      const progress = (kr.current / kr.target) * 100;
      return sum + (progress * kr.weight);
    }, 0);
    return Math.round(weightedProgress / totalWeight);
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div className="text-red-600">{error}</div>;
  if (!employee) return <div>No employee record found</div>;

  return (
    <div className="space-y-6">
      {/* ... Rest of the component implementation ... */}
    </div>
  );
};

export default Growth;