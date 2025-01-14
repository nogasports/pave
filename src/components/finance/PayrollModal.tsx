import React from 'react';
import { PayrollRecord } from '../../lib/firebase/finance';
import { FileText } from 'lucide-react';

interface PayrollModalProps {
  payroll: PayrollRecord;
  onClose: () => void;
}

const PayrollModal: React.FC<PayrollModalProps> = ({ payroll, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-none shadow-lg max-w-2xl w-full mx-4">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center">
            <FileText className="h-6 w-6 text-brand-600 mr-2" />
            <h2 className="text-lg font-medium text-gray-900">Payslip Details</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500"
          >
            ×
          </button>
        </div>

        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h3 className="text-sm font-medium text-gray-500">Period</h3>
              <p className="mt-1 text-sm text-gray-900">{payroll.month}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">Status</h3>
              <p className="mt-1">
                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-none ${
                  payroll.status === 'Paid'
                    ? 'bg-green-100 text-green-800'
                    : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {payroll.status}
                </span>
              </p>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-2">Earnings</h3>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Base Salary</span>
                <span className="text-gray-900">{payroll.baseSalary.toLocaleString()} ETB</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Transport Allowance</span>
                <span className="text-gray-900">{payroll.allowances.transport.toLocaleString()} ETB</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Housing Allowance</span>
                <span className="text-gray-900">{payroll.allowances.housing.toLocaleString()} ETB</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Position Allowance</span>
                <span className="text-gray-900">{payroll.allowances.position.toLocaleString()} ETB</span>
              </div>
              {payroll.overtime && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">
                    Overtime ({payroll.overtime.hours} hours @ {payroll.overtime.rate}/hr)
                  </span>
                  <span className="text-gray-900">{payroll.overtime.amount.toLocaleString()} ETB</span>
                </div>
              )}
            </div>
          </div>

          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-2">Deductions</h3>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Income Tax</span>
                <span className="text-gray-900">{payroll.deductions.tax.toLocaleString()} ETB</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Pension Contribution</span>
                <span className="text-gray-900">{payroll.deductions.pension.toLocaleString()} ETB</span>
              </div>
              {payroll.deductions.other > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Other Deductions</span>
                  <span className="text-gray-900">{payroll.deductions.other.toLocaleString()} ETB</span>
                </div>
              )}
            </div>
          </div>

          <div className="border-t border-gray-200 pt-4">
            <div className="flex justify-between">
              <span className="text-base font-medium text-gray-900">Net Salary</span>
              <span className="text-base font-medium text-gray-900">
                {payroll.netSalary.toLocaleString()} ETB
              </span>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              onClick={onClose}
              className="btn btn-primary"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};