import React from 'react';
import { FileText, Download, Archive, Trash2, ExternalLink } from 'lucide-react';
import { Document } from '../../lib/firebase/documents';
import { Department } from '../../lib/firebase/departments';
import { Employee } from '../../lib/firebase/employees';

interface DocumentListProps {
  documents: Document[];
  departments: Department[];
  employees: Employee[];
  onArchive: (id: string) => void;
  onDelete: (id: string) => void;
}

const DocumentList: React.FC<DocumentListProps> = ({
  documents = [], // Provide default empty array
  departments = [],
  employees = [],
  onArchive,
  onDelete,
}) => {
  const getDepartmentName = (id: string) => {
    return departments.find(d => d.id === id)?.name || 'Unknown Department';
  };

  const getEmployeeName = (id: string) => {
    const employee = employees.find(e => e.id === id);
    return employee ? `${employee.firstName} ${employee.fatherName}` : 'Unknown Employee';
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (!Array.isArray(documents)) {
    return (
      <div className="text-center py-12">
        <FileText className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">No documents</h3>
        <p className="mt-1 text-sm text-gray-500">
          Get started by uploading your first document.
        </p>
      </div>
    );
  }

  if (documents.length === 0) {
    return (
      <div className="text-center py-12">
        <FileText className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">No documents found</h3>
        <p className="mt-1 text-sm text-gray-500">
          Try adjusting your filters or upload a new document.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead>
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Document
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Details
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Category
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Status
            </th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {documents.map((doc) => (
            <tr key={doc.id}>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center">
                  <div className="flex-shrink-0 h-10 w-10 bg-gray-100 rounded-lg flex items-center justify-center">
                    <FileText className="h-6 w-6 text-gray-400" />
                  </div>
                  <div className="ml-4">
                    <div className="text-sm font-medium text-gray-900">{doc.title}</div>
                    <div className="text-sm text-gray-500">{doc.fileName}</div>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-900">
                  {doc.type === 'employee' ? getEmployeeName(doc.employeeId!) : getDepartmentName(doc.departmentId!)}
                </div>
                <div className="text-sm text-gray-500">
                  {formatFileSize(doc.fileSize)} • {doc.fileType}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-900">{doc.category}</div>
                <div className="flex flex-wrap gap-1 mt-1">
                  {doc.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-none ${
                  doc.status === 'active'
                    ? 'bg-green-100 text-green-800'
                    : doc.status === 'archived'
                    ? 'bg-gray-100 text-gray-800'
                    : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {doc.status}
                </span>
                {doc.expiryDate && (
                  <div className="text-xs text-gray-500 mt-1">
                    Expires: {doc.expiryDate.toLocaleDateString()}
                  </div>
                )}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <div className="flex justify-end space-x-2">
                  <a
                    href={doc.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-brand-600 hover:text-brand-900"
                  >
                    <Download className="h-5 w-5" />
                  </a>
                  <button
                    onClick={() => onArchive(doc.id!)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <Archive className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => onDelete(doc.id!)}
                    className="text-red-400 hover:text-red-600"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default DocumentList;