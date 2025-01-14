import React, { useState, useEffect } from 'react';
import { BookOpen, Plus, Award, Clock, Users, Search } from 'lucide-react';
import { Training, getTrainings, addTraining } from '../../lib/firebase/learning';
import { Department, getDepartments } from '../../lib/firebase/departments';
import TrainingForm from './TrainingForm';

const LearningSection: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'in-person' | 'online'>('in-person');
  const [trainings, setTrainings] = useState<Training[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [showTrainingForm, setShowTrainingForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [trainingsData, departmentsData] = await Promise.all([
        getTrainings(),
        getDepartments()
      ]);
      setTrainings(trainingsData);
      setDepartments(departmentsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleAddTraining = async (data: Omit<Training, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      await addTraining(data);
      await loadData();
      setShowTrainingForm(false);
    } catch (err) {
      setError('Failed to add training');
    }
  };

  const filteredTrainings = trainings.filter(t => t.type === (activeTab === 'in-person' ? 'In-Person' : 'Online'));

  if (loading) return <div>Loading...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex space-x-4">
          <button
            onClick={() => setActiveTab('in-person')}
            className={`btn ${activeTab === 'in-person' ? 'btn-primary' : 'btn-secondary'}`}
          >
            <Users className="h-4 w-4 mr-2" />
            In-Person Training
          </button>
          <button
            onClick={() => setActiveTab('online')}
            className={`btn ${activeTab === 'online' ? 'btn-primary' : 'btn-secondary'}`}
          >
            <BookOpen className="h-4 w-4 mr-2" />
            Online Courses
          </button>
        </div>
        <button
          onClick={() => setShowTrainingForm(true)}
          className="btn btn-primary"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Training
        </button>
      </div>

      {/* Search and Filters */}
      <div className="card">
        <div className="flex items-center space-x-4">
          <div className="flex-1 relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search trainings..."
              className="input pl-10"
            />
          </div>
          <select className="input w-48">
            <option value="">All Departments</option>
            {departments.map(dept => (
              <option key={dept.id} value={dept.id}>{dept.name}</option>
            ))}
          </select>
          <select className="input w-48">
            <option value="">All Status</option>
            <option value="Active">Active</option>
            <option value="Pending">Pending</option>
            <option value="Completed">Completed</option>
          </select>
        </div>
      </div>

      {/* Training List */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {filteredTrainings.map((training) => (
          <div key={training.id} className="card">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-blue-50 p-3 rounded-none">
                {training.type === 'In-Person' ? (
                  <Users className="h-6 w-6 text-blue-600" />
                ) : (
                  <BookOpen className="h-6 w-6 text-blue-600" />
                )}
              </div>
              <span className={`px-2 py-1 text-xs font-semibold rounded-none ${
                training.status === 'Active'
                  ? 'bg-green-100 text-green-800'
                  : training.status === 'Completed'
                  ? 'bg-blue-100 text-blue-800'
                  : 'bg-yellow-100 text-yellow-800'
              }`}>
                {training.status}
              </span>
            </div>

            <h3 className="text-lg font-medium text-gray-900">{training.title}</h3>
            <p className="mt-1 text-sm text-gray-500">{training.description}</p>

            <div className="mt-4 space-y-3">
              {training.type === 'In-Person' ? (
                <>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Schedule</span>
                    <span className="text-gray-900">
                      {training.startDate?.toLocaleDateString()} - {training.endDate?.toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Location</span>
                    <span className="text-gray-900">{training.location}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Instructor</span>
                    <span className="text-gray-900">{training.instructor}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Participants</span>
                    <span className="text-gray-900">
                      {/* TODO: Add enrollment count */}0/{training.maxParticipants}
                    </span>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Duration</span>
                    <span className="text-gray-900">{training.duration} hours</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Questions</span>
                    <span className="text-gray-900">
                      {training.content?.questions.length || 0}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Passing Score</span>
                    <span className="text-gray-900">{training.passingScore}%</span>
                  </div>
                </>
              )}
              {training.departmentId && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Department</span>
                  <span className="text-gray-900">
                    {departments.find(d => d.id === training.departmentId)?.name}
                  </span>
                </div>
              )}
            </div>

            <div className="mt-6 flex justify-between items-center">
              <div className="flex items-center text-sm text-gray-500">
                <Clock className="h-4 w-4 mr-1" />
                Created {training.createdAt.toLocaleDateString()}
              </div>
              <button className="btn btn-secondary">
                View Details
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Training Form Modal */}
      {showTrainingForm && (
        <TrainingForm
          departments={departments}
          onSubmit={handleAddTraining}
          onCancel={() => setShowTrainingForm(false)}
        />
      )}
    </div>
  );
};

export default LearningSection;