import React, { useState, useRef } from 'react';
import { Upload, Download } from 'lucide-react';
import Papa from 'papaparse';
import { Employee } from '../lib/firebase/employees';

interface BulkUploadSectionProps {
  onUpload: (data: any[]) => Promise<void>;
}

const BulkUploadSection: React.FC<BulkUploadSectionProps> = ({ onUpload }) => {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successCount, setSuccessCount] = useState(0);
  const [failureCount, setFailureCount] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Template fields for employee CSV
  const employeeTemplate = [
    'firstName',
    'fatherName',
    'lastName',
    'title',
    'jobTitle',
    'departmentId',
    'position',
    'workEmail',
    'workPhone',
    'officeLocation',
    'dateJoined',
    'salary',
    'transportAllowance',
    'housingAllowance',
    'positionAllowance',
    'yearsOfExperience'
  ];

  const downloadTemplate = () => {
    const csvContent = Papa.unparse([employeeTemplate]);
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'employee_template.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const processRow = async (row: any) => {
    // Convert string values to appropriate types
    const cleanValue = (value: any) => {
      if (!value) return undefined;
      const cleaned = value?.toString().trim();
      return cleaned || undefined;
    };
    
    const processDate = (dateStr?: string) => {
      if (!dateStr) return undefined;
      // Validate date format (YYYY-MM-DD)
      if (!dateStr.match(/^\d{4}-\d{2}-\d{2}$/)) {
        throw new Error(`Invalid date format: ${dateStr}. Use YYYY-MM-DD format.`);
      }
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) {
        throw new Error(`Invalid date: ${dateStr}`);
      }
      return date;
    };

    const processNumber = (value?: string) => {
      if (!value) return undefined;
      const num = parseFloat(value.replace(/[^\d.-]/g, ''));
      if (isNaN(num)) {
        throw new Error(`Invalid number: ${value}`);
      }
      return num;
    };

    return {
      firstName: cleanValue(row.firstName),
      fatherName: cleanValue(row.fatherName),
      lastName: cleanValue(row.lastName),
      title: cleanValue(row.title),
      jobTitle: cleanValue(row.jobTitle),
      departmentId: cleanValue(row.departmentId)?.trim(),
      position: cleanValue(row.position) || 'Employee',
      workEmail: cleanValue(row.workEmail)?.toLowerCase(),
      workPhone: cleanValue(row.workPhone),
      officeLocation: cleanValue(row.officeLocation),
      dateJoined: processDate(row.dateJoined),
      salary: processNumber(row.salary),
      transportAllowance: processNumber(row.transportAllowance),
      housingAllowance: processNumber(row.housingAllowance),
      positionAllowance: processNumber(row.positionAllowance),
      yearsOfExperience: processNumber(row.yearsOfExperience)
    };
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Reset state
    setError(null);
    setSuccessCount(0);
    setFailureCount(0);
    
    // Validate file type
    if (!file.name.toLowerCase().endsWith('.csv')) {
      setError('Only CSV files are supported');
      return;
    }

    // Validate file size
    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      setError('File size must be less than 5MB');
      return;
    }

    setUploading(true);

    try {
      const text = await file.text();
      Papa.parse(text, {
        header: true,
        skipEmptyLines: true,
        transformHeader: (header) => header.trim(),
        complete: async (results) => {
          try {
            if (results.errors.length > 0) {
              throw new Error('CSV parsing failed: ' + results.errors[0].message);
            }

            // Process each row individually to track success/failure
            const processedData = [];
            const errors = [];

            for (const row of results.data) {
              try {
                const processedRow = await processRow(row);
                processedData.push(processedRow);
              } catch (err) {
                errors.push(`${row.firstName || 'Unknown'}: ${err.message}`);
              }
            }

            if (errors.length > 0) {
              setError(`${errors.length} records failed:\n${errors.join('\n')}`);
              setFailureCount(errors.length);
            }

            if (processedData.length > 0) {
              await onUpload(processedData);
              setSuccessCount(processedData.length);
            }
          } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to process upload');
            setFailureCount(results.data.length);
          } finally {
            setUploading(false);
            if (fileInputRef.current) {
              fileInputRef.current.value = '';
            }
          }
        }
      });
    } catch (err) {
      setError('Failed to read file');
      setUploading(false);
    }
  };

  return (
    <div className="card">
      <h2 className="text-lg font-medium text-gray-900 mb-4">
        Bulk Upload Employees
      </h2>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 mb-4">
          <p className="font-medium">Upload Failed</p>
          <p className="mt-1 whitespace-pre-wrap">{error}</p>
        </div>
      )}

      {(successCount > 0 || failureCount > 0) && (
        <div className="bg-gray-50 px-4 py-3 mb-4">
          <p className="text-sm text-gray-700">
            {successCount > 0 && (
              <span className="text-green-600">{successCount} records uploaded successfully. </span>
            )}
            {failureCount > 0 && (
              <span className="text-red-600">{failureCount} records failed. </span>
            )}
          </p>
        </div>
      )}

      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500 mb-2">
            Download the template CSV file to ensure correct data format.
          </p>
          <button
            onClick={downloadTemplate}
            className="btn btn-secondary"
          >
            <Download className="h-4 w-4 mr-2" />
            Download Template
          </button>
        </div>

        <div className="flex items-center space-x-4">
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv"
            onChange={handleFileUpload}
            className="hidden"
            id="csv-upload"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="btn btn-primary"
            disabled={uploading}
          >
            <Upload className="h-4 w-4 mr-2" />
            {uploading ? 'Uploading...' : 'Upload CSV'}
          </button>
        </div>
      </div>

      <div className="mt-4">
        <h3 className="text-sm font-medium text-gray-700 mb-2">Important Notes:</h3>
        <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
          <li>Use the template to ensure correct data format</li>
          <li>Only CSV files are supported</li>
          <li>Empty cells will be treated as undefined values</li>
          <li>Dates should be in YYYY-MM-DD format</li>
          <li>Required fields: firstName, fatherName, departmentId</li>
        </ul>
      </div>
    </div>
  );
};

export default BulkUploadSection;