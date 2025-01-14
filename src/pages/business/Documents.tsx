import React, { useState, useEffect } from 'react';
import { FileText, Upload, Filter, Search, Plus } from 'lucide-react';
import { Document, getDocuments, addDocument, updateDocument, deleteDocument } from '../../lib/firebase/documents';
import { Department, getDepartments } from '../../lib/firebase/departments';
import { Employee, getEmployees } from '../../lib/firebase/employees';
import DocumentUploadModal from '../../components/documents/DocumentUploadModal';
import DocumentViewer from '../../components/documents/DocumentViewer';
import { useAuth } from '../../contexts/AuthContext';

const Documents: React.FC = () => {
  const { user } = useAuth();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [viewingDocument, setViewingDocument] = useState<Document | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    type: '',
    departmentId: '',
    search: '',
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [documentsData, departmentsData, employeesData] = await Promise.all([
        getDocuments(),
        getDepartments(),
        getEmployees()
      ]);
      setDocuments(documentsData);
      setDepartments(departmentsData);
      setEmployees(employeesData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (data: Omit<Document, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      await addDocument(data);
      await loadData();
      setShowUploadModal(false);
    } catch (err) {
      setError('Failed to upload document');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this document?')) return;
    try {
      await deleteDocument(id);
      await loadData();
    } catch (err) {
      setError('Failed to delete document');
    }
  };

  const filteredDocuments = documents.filter(doc => {
    if (filters.type && doc.type !== filters.type) return false;
    if (filters.departmentId && doc.departmentId !== filters.departmentId) return false;
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      return (
        doc.title.toLowerCase().includes(searchTerm) ||
        doc.description?.toLowerCase().includes(searchTerm) ||
        doc.fileName.toLowerCase().includes(searchTerm)
      );
    }
    return true;
  });

  if (loading) return <div>Loading...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-900">Documents</h1>
        <div className="flex space-x-3">
          <button
            onClick={() => setShowUploadModal(true)}
            className="btn btn-primary"
          >
            <Upload className="h-4 w-4 mr-2" />
            Upload Document
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3">
          {error}
        </div>
      )}

      {/* Filters */}
      <div className="card">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div>
            <label htmlFor="typeFilter" className="block text-sm font-medium text-gray-700">
              Document Type
            </label>
            <select
              id="typeFilter"
              value={filters.type}
              onChange={(e) => setFilters(prev => ({ ...prev, type: e.target.value }))}
              className="input mt-1"
            >
              <option value="">All Types</option>
              <option value="policy">Policy</option>
              <option value="procedure">Procedure</option>
              <option value="form">Form</option>
              <option value="contract">Contract</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div>
            <label htmlFor="departmentFilter" className="block text-sm font-medium text-gray-700">
              Department
            </label>
            <select
              id="departmentFilter"
              value={filters.departmentId}
              onChange={(e) => setFilters(prev => ({ ...prev, departmentId: e.target.value }))}
              className="input mt-1"
            >
              <option value="">All Departments</option>
              {departments.map(dept => (
                <option key={dept.id} value={dept.id}>{dept.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="search" className="block text-sm font-medium text-gray-700">
              Search
            </label>
            <div className="relative mt-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                id="search"
                value={filters.search}
                onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                placeholder="Search documents..."
                className="input pl-10"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Documents List */}
      <div className="space-y-4">
        {filteredDocuments.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No documents</h3>
            <p className="mt-1 text-sm text-gray-500">
              Get started by uploading your first document.
            </p>
          </div>
        ) : (
          filteredDocuments.map((doc) => (
            <div key={doc.id} className="card hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <FileText className="h-8 w-8 text-gray-400" />
                  <div className="ml-4">
                    <h3 className="text-lg font-medium text-gray-900">{doc.title}</h3>
                    <p className="text-sm text-gray-500">
                      {doc.fileType} • {(doc.fileSize / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <a
                    href={doc.fileUrl}
                    onClick={(e) => {
                      e.preventDefault();
                      setViewingDocument(doc);
                    }}
                    download={doc.fileName}
                    className="text-brand-600 hover:text-brand-900"
                  >
                    Download
                  </a>
                  <button
                    onClick={() => doc.id && handleDelete(doc.id)}
                    className="text-red-600 hover:text-red-900"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <DocumentUploadModal
          departments={departments}
          onUpload={handleUpload}
          onClose={() => setShowUploadModal(false)}
        />
      )}
      
      {/* Document Viewer */}
      {viewingDocument && (
        <DocumentViewer
          document={viewingDocument}
          onClose={() => setViewingDocument(null)}
        />
      )}
    </div>
  );
};

export default Documents;