import React, { useState } from 'react';
import { AlertTriangle } from 'lucide-react';
import { DisciplinaryCase } from '../../lib/firebase/disciplinary';
import { Employee } from '../../lib/firebase/employees';

interface DisciplinaryCaseFormProps {
  employees: Employee[];
  onSubmit: (data: Omit<DisciplinaryCase, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  onCancel: () => void;
}

const DisciplinaryCaseForm: React.FC<DisciplinaryCaseFormProps> = ({
  employees,
  onSubmit,
  onCancel,
}) => {
  const [formData, setFormData] = useState({
    defendantId: '',
    plaintiffId: '',
    type: 'Misconduct' as DisciplinaryCase['type'],
    description: '',
    severity: 'Minor' as DisciplinaryCase['severity'],
    nextAction: '',
    dueDate: '',
    notes: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await onSubmit({
        ...formData,
        reportedBy: 'currentUserId', // TODO: Get from auth context
        status: 'Reported',
        dueDate: formData.dueDate ? new Date(formData.dueDate) : undefined,
      } as DisciplinaryCase);
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
            <AlertTriangle className="h-6 w-6 text-brand-600 mr-2" />
            <h2 className="text-lg font-medium text-gray-900">Report Disciplinary Case</h2>
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
              <label htmlFor="defendantId" className="block text-sm font-medium text-gray-700">
                Defendant
              </label>
              <select
                id="defendantId"
                value={formData.defendantId}
                onChange={(e) => setFormData(prev => ({ ...prev, defendantId: e.target.value }))}
                className="input mt-1"
                required
              >
                <option value="">Select employee...</option>
                {employees.map(employee => (
                  <option key={employee.id} value={employee.id}>
                    {employee.firstName} {employee.fatherName}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="plaintiffId" className="block text-sm font-medium text-gray-700">
                Plaintiff (Optional)
              </label>
              <select
                id="plaintiffId"
                value={formData.plaintiffId}
                onChange={(e) => setFormData(prev => ({ ...prev, plaintiffId: e.target.value }))}
                className="input mt-1"
              >
                <option value="">Select employee...</option>
                {employees
                  .filter(e => e.id !== formData.defendantId)
                  .map(employee => (
                    <option key={employee.id} value={employee.id}>
                      {employee.firstName} {employee.fatherName}
                    </option>
                  ))
                }
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div>
              <label htmlFor="type" className="block text-sm font-medium text-gray-700">
                Case Type
              </label>
              <select
                id="type"
                value={formData.type}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  type: e.target.value as DisciplinaryCase['type']
                }))}
                className="input mt-1"
                required
              >
                <option value="Misconduct">Misconduct</option>
                <option value="Performance">Performance</option>
                <option value="Attendance">Attendance</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label htmlFor="severity" className="block text-sm font-medium text-gray-700">
                Severity
              </label>
              <select
                id="severity"
                value={formData.severity}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  severity: e.target.value as DisciplinaryCase['severity']
                }))}
                className="input mt-1"
                required
              >
                <option value="Minor">Minor</option>
                <option value="Moderate">Moderate</option>
                <option value="Major">Major</option>
              </select>
            </div>
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
              rows={4}
              required
              placeholder="Provide a detailed description of the incident or issue..."
            />
          </div>

          <div>
            <label htmlFor="nextAction" className="block text-sm font-medium text-gray-700">
              Next Action
            </label>
            <input
              type="text"
              id="nextAction"
              value={formData.nextAction}
              onChange={(e) => setFormData(prev => ({ ...prev, nextAction: e.target.value }))}
              className="input mt-1"
              placeholder="e.g., Schedule investigation meeting"
            />
          </div>

          <div>
            <label htmlFor="dueDate" className="block text-sm font-medium text-gray-700">
              Due Date
            </label>
            <input
              type="date"
              id="dueDate"
              value={formData.dueDate}
              onChange={(e) => setFormData(prev => ({ ...prev, dueDate: e.target.value }))}
              className="input mt-1"
              min={new Date().toISOString().split('T')[0]}
            />
          </div>

          <div>
            <label htmlFor="notes" className="block text-sm font-medium text-gray-700">
              Additional Notes
            </label>
            <textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              className="input mt-1"
              rows={3}
              placeholder="Any additional information or context..."
            />
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
              {loading ? 'Submitting...' : 'Report Case'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DisciplinaryCaseForm;