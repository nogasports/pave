import React, { useState, useEffect } from 'react';
import { User, Mail, Phone, MapPin, Building2, Calendar, FileText, Edit2, GraduationCap, Heart } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { Employee, getEmployees, updateEmployee } from '../../lib/firebase/employees';
import { Department, getDepartments } from '../../lib/firebase/departments';
import { Document, getDocuments } from '../../lib/firebase/documents';
import { EmployeeForm } from '../../components/EmployeeForm';

const Profile: React.FC = () => {
  const { user } = useAuth();
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [department, setDepartment] = useState<Department | null>(null);
  const [manager, setManager] = useState<Employee | null>(null);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'personal' | 'employment' | 'education' | 'family' | 'documents'>('personal');
  const [isEditing, setIsEditing] = useState(false);
  
  const loadData = async () => {
    try {
      const [employees, departmentsData, documentsData] = await Promise.all([
        getEmployees(),
        getDepartments(),
        getDocuments({ employeeId: employee?.id })
      ]);
      
      // Find employee by work email
      const currentEmployee = employees.find(emp => emp.workEmail === user?.email);
      if (!currentEmployee) {
        throw new Error('Employee record not found');
      }
      setEmployee(currentEmployee);

      // Get department info
      const dept = departmentsData.find(d => d.id === currentEmployee.departmentId);
      setDepartment(dept || null);

      // Get manager info if exists
      if (currentEmployee.managerId) {
        const mgr = employees.find(emp => emp.id === currentEmployee.managerId);
        setManager(mgr || null);
      }
      
      // Set documents
      setDocuments(documentsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [user]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div className="text-red-600">{error}</div>;
  if (!employee) return <div>No employee record found</div>;

  const handleUpdateProfile = async (data: Omit<Employee, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      if (!employee.id) return;
      await updateEmployee(employee.id, data);
      await loadData();
      setIsEditing(false);
    } catch (err) {
      setError('Failed to update profile');
    }
  };

  // Calculate time with company
  const joinDate = employee.dateJoined ? new Date(employee.dateJoined) : null;
  const timeWithCompany = joinDate ? Math.floor((new Date().getTime() - joinDate.getTime()) / (1000 * 60 * 60 * 24 * 30)) : 0;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-900">Employee Profile</h1>
        <button 
          onClick={() => setIsEditing(!isEditing)} 
          className="btn btn-primary"
        >
          <Edit2 className="h-4 w-4 mr-2" />
          {isEditing ? 'Cancel Edit' : 'Edit Profile'}
        </button>
      </div>

      {isEditing ? (
        <div className="card">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Edit Profile</h2>
          <EmployeeForm
            departments={[department!]}
            managers={[manager!]}
            initialData={employee}
            onSubmit={handleUpdateProfile}
            onCancel={() => setIsEditing(false)}
          />
        </div>
      ) : (
        <div className="card">
          {/* Profile Overview Card */}
          <div className="flex items-start space-x-6">
            <div className="flex-shrink-0">
              {employee.photo ? (
                <img 
                  src={employee.photo} 
                  alt={`${employee.firstName} ${employee.fatherName}`}
                  className="h-24 w-24 object-cover"
                />
              ) : (
                <div className="h-24 w-24 bg-brand-50 flex items-center justify-center border-2 border-brand-200">
                  <span className="text-3xl font-semibold text-brand-700">
                    {`${employee.firstName?.charAt(0) || ''}${employee.fatherName?.charAt(0) || ''}`}
                  </span>
                </div>
              )}
            </div>
            <div className="flex-1">
              <div className="flex justify-between">
                <div>
                  <h2 className="text-2xl font-semibold text-gray-900">
                    {employee.title} {employee.firstName} {employee.fatherName}
                  </h2>
                  <p className="text-lg text-gray-500">{employee.jobTitle}</p>
                </div>
                <button className="btn btn-secondary">
                  Change Photo
                </button>
              </div>
              <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div className="flex items-center">
                  <Mail className="h-5 w-5 text-gray-400" />
                  <span className="ml-2 text-sm text-gray-500">{employee.workEmail}</span>
                </div>
                <div className="flex items-center">
                  <Phone className="h-5 w-5 text-gray-400" />
                  <span className="ml-2 text-sm text-gray-500">{employee.workPhone}</span>
                </div>
                <div className="flex items-center">
                  <MapPin className="h-5 w-5 text-gray-400" />
                  <span className="ml-2 text-sm text-gray-500">{employee.officeLocation}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('personal')}
            className={`
              group inline-flex items-center py-4 px-1 border-b-2 font-medium text-sm
              ${activeTab === 'personal'
                ? 'border-brand-600 text-brand-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}
            `}
          >
            <User className="h-5 w-5 mr-2" />
            Personal Details
          </button>
          <button
            onClick={() => setActiveTab('employment')}
            className={`
              group inline-flex items-center py-4 px-1 border-b-2 font-medium text-sm
              ${activeTab === 'employment'
                ? 'border-brand-600 text-brand-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}
            `}
          >
            <Building2 className="h-5 w-5 mr-2" />
            Employment
          </button>
          <button
            onClick={() => setActiveTab('education')}
            className={`
              group inline-flex items-center py-4 px-1 border-b-2 font-medium text-sm
              ${activeTab === 'education'
                ? 'border-brand-600 text-brand-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}
            `}
          >
            <GraduationCap className="h-5 w-5 mr-2" />
            Education & Experience
          </button>
          <button
            onClick={() => setActiveTab('family')}
            className={`
              group inline-flex items-center py-4 px-1 border-b-2 font-medium text-sm
              ${activeTab === 'family'
                ? 'border-brand-600 text-brand-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}
            `}
          >
            <Heart className="h-5 w-5 mr-2" />
            Family & Emergency
          </button>
          <button
            onClick={() => setActiveTab('documents')}
            className={`
              group inline-flex items-center py-4 px-1 border-b-2 font-medium text-sm
              ${activeTab === 'documents'
                ? 'border-brand-600 text-brand-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}
            `}
          >
            <FileText className="h-5 w-5 mr-2" />
            Documents
          </button>
        </nav>
      </div>

      <div className="space-y-6">
          {activeTab === 'personal' && (
            <div className="space-y-6">
              <div className="card">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Personal Details</h3>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Date of Birth</label>
                    <div className="mt-1 text-sm text-gray-900">
                      {employee.dateOfBirth ? new Date(employee.dateOfBirth).toLocaleDateString() : 'Not set'}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Gender</label>
                    <div className="mt-1 text-sm text-gray-900">{employee.gender}</div>
                  </div>
                </div>
              </div>

              <div className="card">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Contact Information</h3>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Email</label>
                    <div className="mt-1 text-sm text-gray-900">{employee.workEmail}</div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Phone</label>
                    <div className="mt-1 text-sm text-gray-900">{employee.workPhone}</div>
                  </div>
                </div>
              </div>

              <div className="card">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Address</h3>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-500">City</label>
                    <div className="mt-1 text-sm text-gray-900">{employee.address?.city}</div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Woreda</label>
                    <div className="mt-1 text-sm text-gray-900">{employee.address?.woreda}</div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500">House Number</label>
                    <div className="mt-1 text-sm text-gray-900">{employee.address?.houseNumber}</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'employment' && (
            <div className="space-y-6">
              <div className="card">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Employment Details</h3>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Employee ID</label>
                    <div className="mt-1 text-sm text-gray-900">{employee.employeeId}</div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Department</label>
                    <div className="mt-1 text-sm text-gray-900">{department?.name}</div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Position</label>
                    <div className="mt-1 text-sm text-gray-900">{employee.position}</div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Job Grade</label>
                    <div className="mt-1 text-sm text-gray-900">{employee.jobGrade}</div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Employment Type</label>
                    <div className="mt-1 text-sm text-gray-900">{employee.employmentType}</div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Join Date</label>
                    <div className="mt-1 text-sm text-gray-900">
                      {employee.dateJoined ? new Date(employee.dateJoined).toLocaleDateString() : 'N/A'}
                    </div>
                  </div>
                </div>
              </div>

              <div className="card">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Compensation</h3>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Base Salary</label>
                    <div className="mt-1 text-sm text-gray-900">
                      {employee.salary?.toLocaleString()} {employee.salaryCurrency}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Pay Frequency</label>
                    <div className="mt-1 text-sm text-gray-900">{employee.payFrequency}</div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Transport Allowance</label>
                    <div className="mt-1 text-sm text-gray-900">
                      {employee.transportAllowance?.toLocaleString()} {employee.salaryCurrency}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Housing Allowance</label>
                    <div className="mt-1 text-sm text-gray-900">
                      {employee.housingAllowance?.toLocaleString()} {employee.salaryCurrency}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'education' && (
            <div className="space-y-6">
              <div className="card">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Education</h3>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Level</label>
                    <div className="mt-1 text-sm text-gray-900">{employee.education?.level}</div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Field of Study</label>
                    <div className="mt-1 text-sm text-gray-900">{employee.education?.fieldOfStudy}</div>
                  </div>
                </div>
              </div>

              <div className="card">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Work Experience</h3>
                <div className="space-y-4">
                  {employee.externalExperience?.map((exp, index) => (
                    <div key={index} className="border-t border-gray-200 pt-4 first:border-0 first:pt-0">
                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div>
                          <label className="block text-sm font-medium text-gray-500">Company</label>
                          <div className="mt-1 text-sm text-gray-900">{exp.company}</div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-500">Position</label>
                          <div className="mt-1 text-sm text-gray-900">{exp.position}</div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-500">Duration</label>
                          <div className="mt-1 text-sm text-gray-900">
                            {new Date(exp.startDate).toLocaleDateString()} - 
                            {exp.endDate ? new Date(exp.endDate).toLocaleDateString() : 'Present'}
                          </div>
                        </div>
                      </div>
                      <div className="mt-2">
                        <label className="block text-sm font-medium text-gray-500">Description</label>
                        <div className="mt-1 text-sm text-gray-900">{exp.description}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'family' && (
            <div className="space-y-6">
              <div className="card">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Family Information</h3>
                {employee.dependents?.spouse && (
                  <div className="mb-6">
                    <h4 className="text-sm font-medium text-gray-900 mb-2">Spouse</h4>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div>
                        <label className="block text-sm font-medium text-gray-500">Name</label>
                        <div className="mt-1 text-sm text-gray-900">{employee.dependents.spouse.name}</div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-500">Phone</label>
                        <div className="mt-1 text-sm text-gray-900">{employee.dependents.spouse.phone}</div>
                      </div>
                    </div>
                  </div>
                )}
                
                {employee.dependents?.children && employee.dependents.children.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 mb-2">Children</h4>
                    <div className="space-y-4">
                      {employee.dependents.children.map((child, index) => (
                        <div key={index} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                          <div>
                            <label className="block text-sm font-medium text-gray-500">Name</label>
                            <div className="mt-1 text-sm text-gray-900">{child.name}</div>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-500">Date of Birth</label>
                            <div className="mt-1 text-sm text-gray-900">
                              {new Date(child.dateOfBirth).toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="card">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Emergency Contact</h3>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Name</label>
                    <div className="mt-1 text-sm text-gray-900">{employee.emergencyContact?.name}</div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Phone</label>
                    <div className="mt-1 text-sm text-gray-900">{employee.emergencyContact?.phone}</div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Relationship</label>
                    <div className="mt-1 text-sm text-gray-900">{employee.emergencyContact?.relationship}</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'documents' && (
            <div className="card">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Documents</h3>
              <div className="space-y-4">
                {documents.map((doc) => (
                  <div key={doc.id} className="flex items-center justify-between">
                    <div className="flex items-center">
                      <FileText className="h-5 w-5 text-gray-400 mr-2" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">{doc.title}</p>
                        <p className="text-sm text-gray-500">
                          {doc.fileType} • {(doc.fileSize / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                    </div>
                    <a
                      href={doc.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-brand-600 hover:text-brand-900 text-sm font-medium"
                    >
                      Download
                    </a>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
    </div>
  );
};

export default Profile;