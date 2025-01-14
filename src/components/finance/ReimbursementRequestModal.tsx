import React, { useState } from 'react';
import { Receipt } from 'lucide-react';
import { MedicalReimbursement } from '../../lib/firebase/finance';
import { Employee } from '../../lib/firebase/employees';

interface ReimbursementRequestModalProps {
  maxAmount: number;
  employee: Employee;
  onSubmit: (data: Omit<MedicalReimbursement, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  onClose: () => void;
}

const ReimbursementRequestModal: React.FC<ReimbursementRequestModalProps> = ({
  maxAmount,
  employee,
  onSubmit,
  onClose,
}) => {
  const [formData, setFormData] = useState({
    amount: 0,
    description: '',
    expenseDate: new Date().toISOString().split('T')[0],
    receiptUrl: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      // Validate file size (5MB limit)
      if (selectedFile.size > 5 * 1024 * 1024) {
        setError('File size must be less than 5MB');
        return;
      }
      
      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf'];
      if (!allowedTypes.includes(selectedFile.type)) {
        setError('Only JPG, PNG and PDF files are allowed');
        return;
      }

      setFile(selectedFile);
      setError(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (formData.amount > maxAmount) {
        throw new Error(`Maximum reimbursement amount is ${maxAmount.toLocaleString()} ETB`);
      }

      let receiptUrl = '';
      if (file) {
        // Convert file to base64
        const reader = new FileReader();
        receiptUrl = await new Promise((resolve, reject) => {
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });
      }

      await onSubmit({
        ...formData,
        employeeId: employee.id!,
        receiptUrl,
        expenseDate: new Date(formData.expenseDate),
        status: 'Pending',
      } as MedicalReimbursement);
      
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit request');
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-none shadow-lg max-w-md w-full mx-4">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center">
            <Receipt className="h-6 w-6 text-brand-600 mr-2" />
            <h2 className="text-lg font-medium text-gray-900">Submit Medical Reimbursement</h2>
          </div>
          <button
            onClick={onClose}
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
            <label htmlFor="amount" className="block text-sm font-medium text-gray-700">
              Amount (Max: {maxAmount.toLocaleString()} ETB)
            </label>
            <input
              type="number"
              id="amount"
              value={formData.amount}
              onChange={(e) => setFormData(prev => ({ ...prev, amount: Number(e.target.value) }))}
              className="input mt-1"
              min="0"
              max={maxAmount}
              required
            />
          </div>

          <div>
            <label htmlFor="expenseDate" className="block text-sm font-medium text-gray-700">
              Expense Date
            </label>
            <input
              type="date"
              id="expenseDate"
              value={formData.expenseDate}
              onChange={(e) => setFormData(prev => ({ ...prev, expenseDate: e.target.value }))}
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

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Receipt
            </label>
            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg">
              <div className="space-y-1 text-center">
                <Receipt className="mx-auto h-12 w-12 text-gray-400" />
                <div className="flex text-sm text-gray-600">
                  <label
                    htmlFor="receipt-upload"
                    className="relative cursor-pointer bg-white rounded-md font-medium text-brand-600 hover:text-brand-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-brand-500"
                  >
                    <span>Upload a file</span>
                    <input
                      id="receipt-upload"
                      name="receipt-upload"
                      type="file"
                      className="sr-only"
                      onChange={handleFileChange}
                      accept=".jpg,.jpeg,.png,.pdf"
                    />
                  </label>
                  <p className="pl-1">or drag and drop</p>
                </div>
                <p className="text-xs text-gray-500">
                  PNG, JPG or PDF up to 5MB
                </p>
              </div>
            </div>
            {file && (
              <p className="mt-2 text-sm text-gray-500">
                Selected file: {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
              </p>
            )}
          </div>

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
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
              {loading ? 'Submitting...' : 'Submit Request'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReimbursementRequestModal;