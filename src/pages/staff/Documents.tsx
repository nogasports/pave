import React, { useState, useEffect } from 'react';
import { FileText, Upload, Search } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { Employee, getEmployees } from '../../lib/firebase/employees';
import { Document, getDocuments, addDocument } from '../../lib/firebase/documents';
import DocumentUploadModal from '../../components/documents/DocumentUploadModal';

const Documents: React.FC = () => {
  const { user } = useAuth();
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadData();
  }, [user]);

  const loadData = async () => {
    try {
      // Get employee record
      const employees = await wrapFirebaseOperation(() => getEmployees(), 'Error loading employees');
      const currentEmployee = employees.find(emp => emp.workEmail === user?.email);
      if (!currentEmployee) {
        throw new Error('Employee record not found');
      }
      setEmployee(currentEmployee);

      // Load employee documents
      const documentsData = await wrapFirebaseOperation(
        () => getDocuments({
          employeeId: currentEmployee.id,
          status: 'active'
        }),
        'Error loading documents'
      );
      setDocuments(documentsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (data: Omit<Document, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      await addDocument({
        ...data,
        employeeId: employee?.id,
        uploadedBy: employee?.id!
      });
      await loadData();
      setShowUploadModal(false);
    } catch (err) {
      setError('Failed to upload document');
    }
  };

  const filteredDocuments = documents.filter(doc => {
    if (!searchQuery) return true;
    const searchTerm = searchQuery.toLowerCase();
    return (
      doc.title.toLowerCase().includes(searchTerm) ||
      doc.description?.toLowerCase().includes(searchTerm) ||
      doc.fileName.toLowerCase().includes(searchTerm) ||
      doc.tags.some(tag => tag.toLowerCase().includes(searchTerm))
    );
  });

  if (loading) return <div>Loading...</div>;
  if (error) return <div className="text-red-600">{error}</div>;
  if (!employee) return <div>No employee record found</div>;

  return (
    <div className="space-y-6">
      {/* ... Rest of the component implementation ... */}
    </div>
  );
};

export default Documents;