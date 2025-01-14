import React, { useState } from 'react';
import { Star, Plus, Minus } from 'lucide-react';
import { ReviewCycle, ReviewQuestion } from '../../lib/firebase/reviews';

interface ReviewCycleFormProps {
  onSubmit: (data: Omit<ReviewCycle, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  onCancel: () => void;
}

const ReviewCycleForm: React.FC<ReviewCycleFormProps> = ({
  onSubmit,
  onCancel,
}) => {
  const [formData, setFormData] = useState<Omit<ReviewCycle, 'id' | 'createdAt' | 'updatedAt'>>({
    name: '',
    startDate: new Date(),
    endDate: new Date(),
    status: 'Draft',
    reviewers: {
      self: true,
      manager: true,
      peer: false,
    },
    questions: [
      {
        id: '1',
        category: 'Performance',
        question: '',
        type: 'rating',
        required: true,
      }
    ],
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAddQuestion = () => {
    setFormData(prev => ({
      ...prev,
      questions: [
        ...prev.questions,
        {
          id: String(prev.questions.length + 1),
          category: 'Performance',
          question: '',
          type: 'rating',
          required: true,
        }
      ]
    }));
  };

  const handleRemoveQuestion = (index: number) => {
    setFormData(prev => ({
      ...prev,
      questions: prev.questions.filter((_, i) => i !== index)
    }));
  };

  const handleQuestionChange = (index: number, field: keyof ReviewQuestion, value: any) => {
    setFormData(prev => ({
      ...prev,
      questions: prev.questions.map((q, i) => 
        i === index ? { ...q, [field]: value } : q
      )
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await onSubmit(formData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-none shadow-lg max-w-2xl w-full mx-4 my-8 overflow-y-auto max-h-[90vh]">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center">
            <Star className="h-6 w-6 text-brand-600 mr-2" />
            <h2 className="text-lg font-medium text-gray-900">Create Review Cycle</h2>
          </div>
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-500"
          >
            ×
          </button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 mb-6">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">
              Cycle Name
            </label>
            <input
              type="text"
              id="name"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              className="input mt-1"
              required
              placeholder="e.g., Q1 2024 Performance Review"
            />
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div>
              <label htmlFor="startDate" className="block text-sm font-medium text-gray-700">
                Start Date
              </label>
              <input
                type="date"
                id="startDate"
                value={formData.startDate.toISOString().split('T')[0]}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  startDate: new Date(e.target.value)
                }))}
                className="input mt-1"
                required
              />
            </div>

            <div>
              <label htmlFor="endDate" className="block text-sm font-medium text-gray-700">
                End Date
              </label>
              <input
                type="date"
                id="endDate"
                value={formData.endDate.toISOString().split('T')[0]}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  endDate: new Date(e.target.value)
                }))}
                className="input mt-1"
                required
              />
            </div>
          </div>

          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-2">Review Types</h3>
            <div className="space-y-2">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.reviewers.self}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    reviewers: { ...prev.reviewers, self: e.target.checked }
                  }))}
                  className="rounded-none border-gray-300 text-brand-600 focus:ring-brand-600"
                />
                <span className="ml-2 text-sm text-gray-700">Self Review</span>
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.reviewers.manager}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    reviewers: { ...prev.reviewers, manager: e.target.checked }
                  }))}
                  className="rounded-none border-gray-300 text-brand-600 focus:ring-brand-600"
                />
                <span className="ml-2 text-sm text-gray-700">Manager Review</span>
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.reviewers.peer}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    reviewers: { ...prev.reviewers, peer: e.target.checked }
                  }))}
                  className="rounded-none border-gray-300 text-brand-600 focus:ring-brand-600"
                />
                <span className="ml-2 text-sm text-gray-700">Peer Review</span>
              </label>
            </div>
          </div>

          {/* Questions */}
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-sm font-medium text-gray-700">Review Questions</h3>
              <button
                type="button"
                onClick={handleAddQuestion}
                className="text-brand-600 hover:text-brand-700"
              >
                <Plus className="h-5 w-5" />
              </button>
            </div>
            <div className="space-y-4">
              {formData.questions.map((question, index) => (
                <div key={index} className="card">
                  <div className="flex justify-between mb-4">
                    <h4 className="text-sm font-medium text-gray-700">Question {index + 1}</h4>
                    <button
                      type="button"
                      onClick={() => handleRemoveQuestion(index)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Minus className="h-5 w-5" />
                    </button>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Category
                      </label>
                      <select
                        value={question.category}
                        onChange={(e) => handleQuestionChange(index, 'category', e.target.value)}
                        className="input mt-1"
                        required
                      >
                        <option value="Performance">Performance</option>
                        <option value="Leadership">Leadership</option>
                        <option value="Values">Values</option>
                        <option value="Skills">Skills</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Question
                      </label>
                      <input
                        type="text"
                        value={question.question}
                        onChange={(e) => handleQuestionChange(index, 'question', e.target.value)}
                        className="input mt-1"
                        required
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Response Type
                        </label>
                        <select
                          value={question.type}
                          onChange={(e) => handleQuestionChange(index, 'type', e.target.value)}
                          className="input mt-1"
                          required
                        >
                          <option value="rating">Rating (1-5)</option>
                          <option value="text">Text</option>
                        </select>
                      </div>
                      <div>
                        <label className="flex items-center mt-6">
                          <input
                            type="checkbox"
                            checked={question.required}
                            onChange={(e) => handleQuestionChange(index, 'required', e.target.checked)}
                            className="rounded-none border-gray-300 text-brand-600 focus:ring-brand-600"
                          />
                          <span className="ml-2 text-sm text-gray-700">Required</span>
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onCancel}
              className="btn btn-secondary"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? 'Creating...' : 'Create Review Cycle'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReviewCycleForm;