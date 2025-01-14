import React, { useState } from 'react';
import { Target, Plus, Minus, Upload, X } from 'lucide-react';
import { Objective, KeyResult } from '../../lib/firebase/objectives';
import { Department } from '../../lib/firebase/departments';
import { Employee } from '../../lib/firebase/employees';

interface ObjectiveFormProps {
  departments: Department[];
  employees: Employee[];
  onSubmit: (data: Omit<Objective, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  onCancel: () => void;
}

const ObjectiveForm: React.FC<ObjectiveFormProps> = ({
  departments,
  employees,
  onSubmit,
  onCancel,
}) => {
  const [formData, setFormData] = useState<Omit<Objective, 'id' | 'createdAt' | 'updatedAt'>>({
    title: '',
    description: '',
    keyResults: [{
      id: '1',
      title: '',
      target: 0,
      current: 0,
      unit: 'percentage',
      weight: 100,
      status: 'Not Started'
    }],
    type: 'Department',
    assigneeId: '',
    startDate: new Date(),
    dueDate: new Date(),
    status: 'Not Started',
    progress: 0,
    priority: 'Medium',
    createdBy: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [attachments, setAttachments] = useState<File[]>([]);

  const handleAddKeyResult = () => {
    setFormData(prev => ({
      ...prev,
      keyResults: [
        ...prev.keyResults,
        {
          id: String(prev.keyResults.length + 1),
          title: '',
          target: 0,
          current: 0,
          unit: 'percentage',
          weight: 0,
          status: 'Not Started'
        }
      ]
    }));
  };

  const handleRemoveKeyResult = (index: number) => {
    setFormData(prev => ({
      ...prev,
      keyResults: prev.keyResults.filter((_, i) => i !== index)
    }));
  };

  const handleKeyResultChange = (index: number, field: keyof KeyResult, value: any) => {
    setFormData(prev => ({
      ...prev,
      keyResults: prev.keyResults.map((kr, i) => 
        i === index ? { ...kr, [field]: value } : kr
      )
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setAttachments(prev => [...prev, ...files]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Upload attachments if any
      const uploadedAttachments = await Promise.all(
        attachments.map(async file => {
          const url = await uploadFile(`objectives/${Date.now()}_${file.name}`, file);
          return {
            id: Date.now().toString(),
            name: file.name,
            url,
            type: file.type,
            uploadedBy: currentUser.id,
            uploadedAt: new Date()
          };
        })
      );

      await onSubmit({
        ...formData,
        attachments: uploadedAttachments,
        startDate: new Date(formData.startDate),
        dueDate: new Date(formData.dueDate),
      } as Objective);
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
            <Target className="h-6 w-6 text-brand-600 mr-2" />
            <h2 className="text-lg font-medium text-gray-900">Create Objective</h2>
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
            <label htmlFor="title" className="block text-sm font-medium text-gray-700">
              Objective Title
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

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div>
              <label htmlFor="type" className="block text-sm font-medium text-gray-700">
                Type
              </label>
              <select
                id="type"
                value={formData.type}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  type: e.target.value as 'Department' | 'Employee',
                  assigneeId: '' // Reset assignee when type changes
                }))}
                className="input mt-1"
                required
              >
                <option value="Department">Department</option>
                <option value="Employee">Employee</option>
              </select>
            </div>

            <div>
              <label htmlFor="assigneeId" className="block text-sm font-medium text-gray-700">
                {formData.type === 'Department' ? 'Department' : 'Employee'}
              </label>
              <select
                id="assigneeId"
                value={formData.assigneeId}
                onChange={(e) => setFormData(prev => ({ ...prev, assigneeId: e.target.value }))}
                className="input mt-1"
                required
              >
                <option value="">Select {formData.type.toLowerCase()}...</option>
                {formData.type === 'Department'
                  ? departments.map(dept => (
                      <option key={dept.id} value={dept.id}>{dept.name}</option>
                    ))
                  : employees.map(emp => (
                      <option key={emp.id} value={emp.id}>
                        {emp.firstName} {emp.fatherName}
                      </option>
                    ))
                }
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
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
              <label htmlFor="dueDate" className="block text-sm font-medium text-gray-700">
                Due Date
              </label>
              <input
                type="date"
                id="dueDate"
                value={formData.dueDate.toISOString().split('T')[0]}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  dueDate: new Date(e.target.value)
                }))}
                className="input mt-1"
                required
              />
            </div>

            <div>
              <label htmlFor="priority" className="block text-sm font-medium text-gray-700">
                Priority
              </label>
              <select
                id="priority"
                value={formData.priority}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  priority: e.target.value as 'Low' | 'Medium' | 'High'
                }))}
                className="input mt-1"
                required
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
              </select>
            </div>
          </div>

          {/* Key Results */}
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">Key Results</h3>
              <button
                type="button"
                onClick={handleAddKeyResult}
                className="text-brand-600 hover:text-brand-700"
              >
                <Plus className="h-5 w-5" />
              </button>
            </div>
            <div className="space-y-4">
              {formData.keyResults.map((kr, index) => (
                <div key={index} className="card">
                  <div className="flex justify-between mb-4">
                    <h4 className="text-sm font-medium text-gray-700">Key Result {index + 1}</h4>
                    <button
                      type="button"
                      onClick={() => handleRemoveKeyResult(index)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Minus className="h-5 w-5" />
                    </button>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Title
                      </label>
                      <input
                        type="text"
                        value={kr.title}
                        onChange={(e) => handleKeyResultChange(index, 'title', e.target.value)}
                        className="input mt-1"
                        required
                        placeholder="e.g., Increase customer satisfaction score"
                      />
                    </div>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Target Value
                        </label>
                        <input
                          type="number"
                          value={kr.target}
                          onChange={(e) => handleKeyResultChange(index, 'target', Number(e.target.value))}
                          className="input mt-1"
                          required
                          min="0"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Unit
                        </label>
                        <select
                          value={kr.unit}
                          onChange={(e) => handleKeyResultChange(index, 'unit', e.target.value)}
                          className="input mt-1"
                          required
                        >
                          <option value="percentage">Percentage</option>
                          <option value="number">Number</option>
                          <option value="currency">Currency (ETB)</option>
                          <option value="days">Days</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Weight (%)
                        </label>
                        <input
                          type="number"
                          value={kr.weight}
                          onChange={(e) => handleKeyResultChange(index, 'weight', Number(e.target.value))}
                          className="input mt-1"
                          required
                          min="0"
                          max="100"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Attachments */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Attachments
            </label>
            <div className="mt-1 flex items-center space-x-4">
              <label className="btn btn-secondary cursor-pointer">
                <Upload className="h-4 w-4 mr-2" />
                Add Files
                <input
                  type="file"
                  className="hidden"
                  multiple
                  onChange={handleFileChange}
                />
              </label>
              {attachments.length > 0 && (
                <span className="text-sm text-gray-500">
                  {attachments.length} file(s) selected
                </span>
              )}
            </div>
            {attachments.length > 0 && (
              <ul className="mt-2 text-sm text-gray-500">
                {attachments.map((file, index) => (
                  <li key={index} className="flex items-center">
                    <Upload className="h-4 w-4 mr-1" />
                    {file.name}
                    <button
                      type="button"
                      onClick={() => setAttachments(prev => prev.filter((_, i) => i !== index))}
                      className="ml-2 text-red-600 hover:text-red-800"
                    >
                      ×
                    </button>
                  </li>
                ))}
              </ul>
            )}
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
              {loading ? 'Creating...' : 'Create Objective'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ObjectiveForm;