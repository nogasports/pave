import React, { useState } from 'react';
import { BookOpen, Plus, Minus } from 'lucide-react';
import { Training, AssessmentQuestion } from '../../lib/firebase/learning';
import { Department } from '../../lib/firebase/departments';

interface TrainingFormProps {
  departments: Department[];
  onSubmit: (data: Omit<Training, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  onCancel: () => void;
}

const TrainingForm: React.FC<TrainingFormProps> = ({
  departments,
  onSubmit,
  onCancel,
}) => {
  const [formData, setFormData] = useState<Omit<Training, 'id' | 'createdAt' | 'updatedAt'>>({
    title: '',
    description: '',
    type: 'In-Person',
    departmentId: '',
    startDate: new Date(),
    endDate: new Date(),
    location: '',
    instructor: '',
    maxParticipants: 20,
    duration: 1,
    content: {
      pdfData: '',
      questions: [],
    },
    passingScore: 80,
    status: 'Draft',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      // Convert PDF to base64
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setFormData(prev => ({
          ...prev,
          content: {
            ...prev.content,
            pdfData: base64String.split(',')[1] // Remove data URL prefix
          }
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddQuestion = () => {
    setFormData(prev => ({
      ...prev,
      content: {
        ...prev.content,
        questions: [
          ...(prev.content?.questions || []),
          {
            id: String(Date.now()),
            question: '',
            options: ['', '', '', ''],
            correctAnswer: 0
          }
        ]
      }
    }));
  };

  const handleRemoveQuestion = (index: number) => {
    setFormData(prev => ({
      ...prev,
      content: {
        ...prev.content,
        questions: prev.content?.questions?.filter((_, i) => i !== index) || []
      }
    }));
  };

  const handleQuestionChange = (index: number, field: keyof AssessmentQuestion, value: any) => {
    setFormData(prev => ({
      ...prev,
      content: {
        ...prev.content,
        questions: prev.content?.questions?.map((q, i) => 
          i === index ? { ...q, [field]: value } : q
        ) || []
      }
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
            <BookOpen className="h-6 w-6 text-brand-600 mr-2" />
            <h2 className="text-lg font-medium text-gray-900">
              {formData.type === 'In-Person' ? 'Create In-Person Training' : 'Add Online Course'}
            </h2>
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
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div>
              <label htmlFor="type" className="block text-sm font-medium text-gray-700">
                Training Type
              </label>
              <select
                id="type"
                value={formData.type}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  type: e.target.value as 'In-Person' | 'Online'
                }))}
                className="input mt-1"
                required
              >
                <option value="In-Person">In-Person Training</option>
                <option value="Online">Online Course</option>
              </select>
            </div>

            <div>
              <label htmlFor="departmentId" className="block text-sm font-medium text-gray-700">
                Department
              </label>
              <select
                id="departmentId"
                value={formData.departmentId}
                onChange={(e) => setFormData(prev => ({ ...prev, departmentId: e.target.value }))}
                className="input mt-1"
              >
                <option value="">All Departments</option>
                {departments.map(dept => (
                  <option key={dept.id} value={dept.id}>{dept.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700">
              Title
            </label>
            <input
              type="text"
              id="title"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              className="input mt-1"
              required
            />
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700">
              Description
            </label>
            <textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              className="input mt-1"
              rows={3}
              required
            />
          </div>

          {formData.type === 'In-Person' ? (
            <>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div>
                  <label htmlFor="startDate" className="block text-sm font-medium text-gray-700">
                    Start Date
                  </label>
                  <input
                    type="date"
                    id="startDate"
                    value={formData.startDate?.toISOString().split('T')[0]}
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
                    value={formData.endDate?.toISOString().split('T')[0]}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      endDate: new Date(e.target.value)
                    }))}
                    className="input mt-1"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div>
                  <label htmlFor="location" className="block text-sm font-medium text-gray-700">
                    Location
                  </label>
                  <input
                    type="text"
                    id="location"
                    value={formData.location}
                    onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                    className="input mt-1"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="instructor" className="block text-sm font-medium text-gray-700">
                    Instructor
                  </label>
                  <input
                    type="text"
                    id="instructor"
                    value={formData.instructor}
                    onChange={(e) => setFormData(prev => ({ ...prev, instructor: e.target.value }))}
                    className="input mt-1"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div>
                  <label htmlFor="maxParticipants" className="block text-sm font-medium text-gray-700">
                    Maximum Participants
                  </label>
                  <input
                    type="number"
                    id="maxParticipants"
                    value={formData.maxParticipants}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      maxParticipants: Number(e.target.value)
                    }))}
                    className="input mt-1"
                    min="1"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="duration" className="block text-sm font-medium text-gray-700">
                    Duration (hours)
                  </label>
                  <input
                    type="number"
                    id="duration"
                    value={formData.duration}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      duration: Number(e.target.value)
                    }))}
                    className="input mt-1"
                    min="1"
                    required
                  />
                </div>
              </div>
            </>
          ) : (
            <>
              <div>
                <label htmlFor="pdfUpload" className="block text-sm font-medium text-gray-700">
                  Course Content (PDF)
                </label>
                <input
                  type="file"
                  id="pdfUpload"
                  accept=".pdf"
                  onChange={handleFileChange}
                  className="input mt-1"
                  required
                />
                {selectedFile && (
                  <p className="mt-1 text-sm text-gray-500">
                    Selected file: {selectedFile.name}
                  </p>
                )}
              </div>

              <div>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-sm font-medium text-gray-700">Assessment Questions</h3>
                  <button
                    type="button"
                    onClick={handleAddQuestion}
                    className="text-brand-600 hover:text-brand-700"
                  >
                    <Plus className="h-5 w-5" />
                  </button>
                </div>
                <div className="space-y-4">
                  {formData.content?.questions?.map((question, index) => (
                    <div key={question.id} className="card">
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
                            Question Text
                          </label>
                          <input
                            type="text"
                            value={question.question}
                            onChange={(e) => handleQuestionChange(index, 'question', e.target.value)}
                            className="input mt-1"
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="block text-sm font-medium text-gray-700">
                            Options
                          </label>
                          {question.options.map((option, optionIndex) => (
                            <div key={optionIndex} className="flex items-center space-x-2">
                              <input
                                type="radio"
                                checked={question.correctAnswer === optionIndex}
                                onChange={() => handleQuestionChange(index, 'correctAnswer', optionIndex)}
                                className="rounded-none border-gray-300 text-brand-600 focus:ring-brand-600"
                              />
                              <input
                                type="text"
                                value={option}
                                onChange={(e) => {
                                  const newOptions = [...question.options];
                                  newOptions[optionIndex] = e.target.value;
                                  handleQuestionChange(index, 'options', newOptions);
                                }}
                                className="input flex-1"
                                placeholder={`Option ${optionIndex + 1}`}
                                required
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label htmlFor="passingScore" className="block text-sm font-medium text-gray-700">
                  Passing Score (%)
                </label>
                <input
                  type="number"
                  id="passingScore"
                  value={formData.passingScore}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    passingScore: Number(e.target.value)
                  }))}
                  className="input mt-1"
                  min="0"
                  max="100"
                  required
                />
              </div>
            </>
          )}

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
              {loading ? 'Creating...' : 'Create Training'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TrainingForm;