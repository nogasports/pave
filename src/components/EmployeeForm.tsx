import React, { useState, useEffect } from 'react';
import { Employee } from '../lib/firebase/employees';
import { Department } from '../lib/firebase/departments';

interface EmployeeFormProps {
  departments: Department[];
  managers: Employee[];
  initialData?: Partial<Employee>;
  onSubmit: (data: Omit<Employee, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  onCancel: () => void;
  readOnly?: boolean;
}

export const EmployeeForm: React.FC<EmployeeFormProps> = ({
  departments,
  managers,
  initialData,
  onSubmit,
  onCancel,
}) => {
  const [formData, setFormData] = useState({
    employeeId: initialData?.employeeId || '',
    // Personal Details
    title: initialData?.title || '',
    firstName: initialData?.firstName || '',
    fatherName: initialData?.fatherName || '',
    lastName: initialData?.lastName || '',
    photo: initialData?.photo || '',
    dateOfBirth: initialData?.dateOfBirth ? new Date(initialData.dateOfBirth).toISOString().split('T')[0] : '',
    gender: initialData?.gender || 'Male',
    address: {
      city: initialData?.address?.city || '',
      woreda: initialData?.address?.woreda || '',
      houseNumber: initialData?.address?.houseNumber || '',
    },
    education: {
      level: initialData?.education?.level || '',
      fieldOfStudy: initialData?.education?.fieldOfStudy || '',
    },
    dependents: {
      spouse: initialData?.dependents?.spouse || { name: '', phone: '' },
      children: initialData?.dependents?.children || [],
    },
    emergencyContact: {
      name: initialData?.emergencyContact?.name || '',
      phone: initialData?.emergencyContact?.phone || '',
      relationship: initialData?.emergencyContact?.relationship || '',
    },
    externalExperience: initialData?.externalExperience || [],

    // Employment Details
    jobTitle: initialData?.jobTitle || '',
    departmentId: initialData?.departmentId || '',
    managerId: '',
    managerName: '',
    position: initialData?.position || 'Employee',
    jobGrade: initialData?.jobGrade || '',
    section: initialData?.section || '',
    employmentType: initialData?.employmentType || 'Permanent',
    contractEndDate: initialData?.contractEndDate ? new Date(initialData.contractEndDate).toISOString().split('T')[0] : '',

    // Work Details
    staffId: initialData?.staffId || '',
    officeLocation: initialData?.officeLocation || '',
    workPhone: initialData?.workPhone || '',
    workEmail: initialData?.workEmail || '',

    // Compensation
    salaryCurrency: initialData?.salaryCurrency || 'ETB',
    payFrequency: initialData?.payFrequency || 'Monthly',
    salary: initialData?.salary || 0,
    transportAllowance: initialData?.transportAllowance || 0,
    housingAllowance: initialData?.housingAllowance || 0,
    positionAllowance: initialData?.positionAllowance || 0,

    // Time
    dateJoined: initialData?.dateJoined ? new Date(initialData.dateJoined).toISOString().split('T')[0] : '',
    dateLeft: initialData?.dateLeft ? new Date(initialData.dateLeft).toISOString().split('T')[0] : '',
    yearsOfExperience: initialData?.yearsOfExperience || 0,
  });

  const [managerSearch, setManagerSearch] = useState('');
  const [filteredManagers, setFilteredManagers] = useState(managers);
  const [showManagerResults, setShowManagerResults] = useState(false);

  useEffect(() => {
    if (managerSearch.trim()) {
      const filtered = managers.filter(manager => {
        const fullName = `${manager.firstName || ''} ${manager.fatherName || ''}`.toLowerCase();
        const searchTerm = managerSearch.toLowerCase();
        return fullName.includes(searchTerm);
      });
      setFilteredManagers(filtered);
      setShowManagerResults(true);
    } else {
      setFilteredManagers([]);
      setShowManagerResults(false);
    }
  }, [managerSearch, managers]);

  useEffect(() => {
    // Set initial manager name if editing
    if (initialData?.managerId) {
      const manager = managers.find(m => m.id === initialData.managerId);
      if (manager) {
        setFormData(prev => ({
          ...prev,
          managerId: manager.id || '',
          managerName: `${manager.firstName || ''} ${manager.fatherName || ''}`.trim()
        }));
      }
    }
  }, [initialData, managers]);

  // Close manager results when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.manager-search-container')) {
        setShowManagerResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const cleanData = {
        ...formData
      };

      // Only include non-empty values
      if (formData.dateJoined) cleanData.dateJoined = new Date(formData.dateJoined);
      if (formData.dateLeft) cleanData.dateLeft = new Date(formData.dateLeft);
      if (formData.salary) cleanData.salary = Number(formData.salary);
      if (formData.transportAllowance) cleanData.transportAllowance = Number(formData.transportAllowance);
      if (formData.housingAllowance) cleanData.housingAllowance = Number(formData.housingAllowance);
      if (formData.positionAllowance) cleanData.positionAllowance = Number(formData.positionAllowance);
      if (formData.yearsOfExperience) cleanData.yearsOfExperience = Number(formData.yearsOfExperience);

      await onSubmit(cleanData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3">
          {error}
        </div>
      )}

      {/* Personal Details */}
      <div className="space-y-6">
        <h3 className="text-lg font-medium text-gray-900">Personal Details</h3>
        <div>
          <label htmlFor="employeeId" className="block text-sm font-medium text-gray-700">
            Employee ID
          </label>
          <input
            type="text"
            id="employeeId"
            value={formData.employeeId}
            onChange={(e) => setFormData(prev => ({ ...prev, employeeId: e.target.value }))}
            className="input mt-1"
            required
          />
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700">Title</label>
            <select
              id="title"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              className="input mt-1"
            >
              <option value="">Select...</option>
              <option value="Mr">Mr</option>
              <option value="Mrs">Mrs</option>
              <option value="Ms">Ms</option>
              <option value="Dr">Dr</option>
            </select>
          </div>
          <div>
            <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">First Name</label>
            <input
              type="text"
              id="firstName"
              value={formData.firstName}
              onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
              className="input mt-1"
            />
          </div>
          <div>
            <label htmlFor="fatherName" className="block text-sm font-medium text-gray-700">Father's Name</label>
            <input
              type="text"
              id="fatherName"
              value={formData.fatherName}
              onChange={(e) => setFormData(prev => ({ ...prev, fatherName: e.target.value }))}
              className="input mt-1"
            />
          </div>
          <div>
            <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">Last Name</label>
            <input
              type="text"
              id="lastName"
              value={formData.lastName}
              onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
              className="input mt-1"
            />
          </div>
        </div>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div>
            <label htmlFor="dateOfBirth" className="block text-sm font-medium text-gray-700">
              Date of Birth
            </label>
            <input
              type="date"
              id="dateOfBirth"
              value={formData.dateOfBirth}
              onChange={(e) => setFormData(prev => ({ ...prev, dateOfBirth: e.target.value }))}
              className="input mt-1"
              required
            />
          </div>

          <div>
            <label htmlFor="gender" className="block text-sm font-medium text-gray-700">
              Gender
            </label>
            <select
              id="gender"
              value={formData.gender}
              onChange={(e) => setFormData(prev => ({ ...prev, gender: e.target.value as 'Male' | 'Female' }))}
              className="input mt-1"
              required
            >
              <option value="Male">Male</option>
              <option value="Female">Female</option>
            </select>
          </div>
        </div>

        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-2">Address</h4>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <label htmlFor="city" className="block text-sm font-medium text-gray-700">City</label>
              <input
                type="text"
                id="city"
                value={formData.address.city}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  address: { ...prev.address, city: e.target.value }
                }))}
                className="input mt-1"
                required
              />
            </div>
            <div>
              <label htmlFor="woreda" className="block text-sm font-medium text-gray-700">Woreda</label>
              <input
                type="text"
                id="woreda"
                value={formData.address.woreda}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  address: { ...prev.address, woreda: e.target.value }
                }))}
                className="input mt-1"
                required
              />
            </div>
            <div>
              <label htmlFor="houseNumber" className="block text-sm font-medium text-gray-700">House #</label>
              <input
                type="text"
                id="houseNumber"
                value={formData.address.houseNumber}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  address: { ...prev.address, houseNumber: e.target.value }
                }))}
                className="input mt-1"
                required
              />
            </div>
          </div>
        </div>

        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-2">Education</h4>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="educationLevel" className="block text-sm font-medium text-gray-700">Level</label>
              <select
                id="educationLevel"
                value={formData.education.level}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  education: { ...prev.education, level: e.target.value }
                }))}
                className="input mt-1"
                required
              >
                <option value="">Select level...</option>
                <option value="High School">High School</option>
                <option value="Diploma">Diploma</option>
                <option value="Bachelor">Bachelor's Degree</option>
                <option value="Master">Master's Degree</option>
                <option value="PhD">PhD</option>
              </select>
            </div>
            <div>
              <label htmlFor="fieldOfStudy" className="block text-sm font-medium text-gray-700">Field of Study</label>
              <input
                type="text"
                id="fieldOfStudy"
                value={formData.education.fieldOfStudy}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  education: { ...prev.education, fieldOfStudy: e.target.value }
                }))}
                className="input mt-1"
                required
              />
            </div>
          </div>
        </div>

        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-2">Dependents</h4>
          <div className="space-y-4">
            <div>
              <h5 className="text-sm font-medium text-gray-700">Spouse</h5>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="spouseName" className="block text-sm font-medium text-gray-700">Name</label>
                  <input
                    type="text"
                    id="spouseName"
                    value={formData.dependents.spouse.name}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      dependents: {
                        ...prev.dependents,
                        spouse: { ...prev.dependents.spouse, name: e.target.value }
                      }
                    }))}
                    className="input mt-1"
                  />
                </div>
                <div>
                  <label htmlFor="spousePhone" className="block text-sm font-medium text-gray-700">Phone</label>
                  <input
                    type="tel"
                    id="spousePhone"
                    value={formData.dependents.spouse.phone}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      dependents: {
                        ...prev.dependents,
                        spouse: { ...prev.dependents.spouse, phone: e.target.value }
                      }
                    }))}
                    className="input mt-1"
                  />
                </div>
              </div>
            </div>

            <div>
              <h5 className="text-sm font-medium text-gray-700">Children</h5>
              <button
                type="button"
                onClick={() => setFormData(prev => ({
                  ...prev,
                  dependents: {
                    ...prev.dependents,
                    children: [...prev.dependents.children, { name: '', dateOfBirth: new Date() }]
                  }
                }))}
                className="btn btn-secondary mt-2"
              >
                Add Child
              </button>
              <div className="mt-2 space-y-2">
                {formData.dependents.children.map((child, index) => (
                  <div key={index} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Name</label>
                      <input
                        type="text"
                        value={child.name}
                        onChange={(e) => {
                          const newChildren = [...formData.dependents.children];
                          newChildren[index].name = e.target.value;
                          setFormData(prev => ({
                            ...prev,
                            dependents: { ...prev.dependents, children: newChildren }
                          }));
                        }}
                        className="input mt-1"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Date of Birth</label>
                      <input
                        type="date"
                        value={child.dateOfBirth instanceof Date ? child.dateOfBirth.toISOString().split('T')[0] : child.dateOfBirth}
                        onChange={(e) => {
                          const newChildren = [...formData.dependents.children];
                          newChildren[index].dateOfBirth = new Date(e.target.value);
                          setFormData(prev => ({
                            ...prev,
                            dependents: { ...prev.dependents, children: newChildren }
                          }));
                        }}
                        className="input mt-1"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-2">Emergency Contact</h4>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <label htmlFor="emergencyName" className="block text-sm font-medium text-gray-700">Name</label>
              <input
                type="text"
                id="emergencyName"
                value={formData.emergencyContact.name}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  emergencyContact: { ...prev.emergencyContact, name: e.target.value }
                }))}
                className="input mt-1"
                required
              />
            </div>
            <div>
              <label htmlFor="emergencyPhone" className="block text-sm font-medium text-gray-700">Phone</label>
              <input
                type="tel"
                id="emergencyPhone"
                value={formData.emergencyContact.phone}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  emergencyContact: { ...prev.emergencyContact, phone: e.target.value }
                }))}
                className="input mt-1"
                required
              />
            </div>
            <div>
              <label htmlFor="emergencyRelationship" className="block text-sm font-medium text-gray-700">Relationship</label>
              <input
                type="text"
                id="emergencyRelationship"
                value={formData.emergencyContact.relationship}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  emergencyContact: { ...prev.emergencyContact, relationship: e.target.value }
                }))}
                className="input mt-1"
                required
              />
            </div>
          </div>
        </div>
      </div>

      {/* Employment Details */}
      <div className="space-y-6">
        <h3 className="text-lg font-medium text-gray-900">Employment Details</h3>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div>
            <label htmlFor="employmentType" className="block text-sm font-medium text-gray-700">
              Employment Type
            </label>
            <select
              id="employmentType"
              value={formData.employmentType}
              onChange={(e) => setFormData(prev => ({ 
                ...prev, 
                employmentType: e.target.value as 'Permanent' | 'Contract'
              }))}
              className="input mt-1"
              required
            >
              <option value="Permanent">Permanent</option>
              <option value="Contract">Contract</option>
            </select>
          </div>

          <div>
            <label htmlFor="jobGrade" className="block text-sm font-medium text-gray-700">
              Job Grade (Roman Numeral)
            </label>
            <select
              id="jobGrade"
              value={formData.jobGrade}
              onChange={(e) => setFormData(prev => ({ ...prev, jobGrade: e.target.value }))}
              className="input mt-1"
              required
            >
              <option value="">Select grade...</option>
              <option value="I">I</option>
              <option value="II">II</option>
              <option value="III">III</option>
              <option value="IV">IV</option>
              <option value="V">V</option>
              <option value="VI">VI</option>
              <option value="VII">VII</option>
              <option value="VIII">VIII</option>
              <option value="IX">IX</option>
              <option value="X">X</option>
            </select>
          </div>

          <div>
            <label htmlFor="section" className="block text-sm font-medium text-gray-700">
              Section
            </label>
            <input
              type="text"
              id="section"
              value={formData.section}
              onChange={(e) => setFormData(prev => ({ ...prev, section: e.target.value }))}
              className="input mt-1"
            />
          </div>

          {formData.employmentType === 'Contract' && (
            <div>
              <label htmlFor="contractEndDate" className="block text-sm font-medium text-gray-700">
                Contract End Date
              </label>
              <input
                type="date"
                id="contractEndDate"
                value={formData.contractEndDate}
                onChange={(e) => setFormData(prev => ({ ...prev, contractEndDate: e.target.value }))}
                className="input mt-1"
                required
              />
            </div>
          )}

          <div>
            <label htmlFor="jobTitle" className="block text-sm font-medium text-gray-700">Job Title</label>
            <input
              type="text"
              id="jobTitle"
              value={formData.jobTitle}
              onChange={(e) => setFormData(prev => ({ ...prev, jobTitle: e.target.value }))}
              className="input mt-1"
            />
          </div>
          <div>
            <label htmlFor="departmentId" className="block text-sm font-medium text-gray-700">Department</label>
            <select
              id="departmentId"
              value={formData.departmentId}
              onChange={(e) => setFormData(prev => ({ ...prev, departmentId: e.target.value }))}
              className="input mt-1"
            >
              <option value="">Select...</option>
              {departments.map(dept => (
                <option key={dept.id} value={dept.id}>{dept.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="managerId" className="block text-sm font-medium text-gray-700">Manager</label>
            <div className="relative manager-search-container">
              <input
                type="text"
                placeholder="Search manager..."
                value={formData.managerName || managerSearch}
                onChange={(e) => setManagerSearch(e.target.value)}
                onFocus={() => {
                  if (formData.managerName) {
                    setManagerSearch(formData.managerName);
                    setFormData(prev => ({ ...prev, managerName: '' }));
                  }
                  setShowManagerResults(true);
                }}
                className="input mt-1"
              />
              {showManagerResults && filteredManagers.length > 0 && (
                <div className="absolute z-10 w-full bg-white mt-1 border border-gray-200 rounded-none shadow-lg">
                  {filteredManagers.map(manager => (
                    <div
                      key={manager.id}
                      className="px-4 py-2 hover:bg-gray-50 cursor-pointer"
                      onClick={() => {
                        setFormData(prev => ({
                          ...prev,
                          managerId: manager.id || '',
                          managerName: `${manager.firstName || ''} ${manager.fatherName || ''}`.trim()
                        }));
                        setManagerSearch('');
                        setShowManagerResults(false);
                      }}
                    >
                      {`${manager.firstName || ''} ${manager.fatherName || ''}`.trim()}
                    </div>
                  ))}
                </div>
              )}
              {showManagerResults && managerSearch && filteredManagers.length === 0 && (
                <div className="absolute z-10 w-full bg-white mt-1 border border-gray-200 rounded-none shadow-lg">
                  <div className="px-4 py-2 text-gray-500">No managers found</div>
                </div>
              )}
            </div>
          </div>
          <div>
            <label htmlFor="position" className="block text-sm font-medium text-gray-700">Position</label>
            <select
              id="position"
              value={formData.position}
              onChange={(e) => setFormData(prev => ({ ...prev, position: e.target.value as 'Employee' | 'Manager' }))}
              className="input mt-1"
            >
              <option value="Employee">Employee</option>
              <option value="Manager">Manager</option>
            </select>
          </div>
        </div>
      </div>

      {/* Work Details */}
      <div className="space-y-6">
        <h3 className="text-lg font-medium text-gray-900">Work Details</h3>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div>
            <label htmlFor="staffId" className="block text-sm font-medium text-gray-700">Staff ID</label>
            <input
              type="text"
              id="staffId"
              value={formData.staffId}
              onChange={(e) => setFormData(prev => ({ ...prev, staffId: e.target.value }))}
              className="input mt-1"
              required
              placeholder="Enter staff ID"
            />
          </div>
          <div>
            <label htmlFor="officeLocation" className="block text-sm font-medium text-gray-700">Office Location</label>
            <input
              type="text"
              id="officeLocation"
              value={formData.officeLocation}
              onChange={(e) => setFormData(prev => ({ ...prev, officeLocation: e.target.value }))}
              className="input mt-1"
            />
          </div>
          <div>
            <label htmlFor="workPhone" className="block text-sm font-medium text-gray-700">Work Phone</label>
            <input
              type="tel"
              id="workPhone"
              value={formData.workPhone}
              onChange={(e) => setFormData(prev => ({ ...prev, workPhone: e.target.value }))}
              className="input mt-1"
            />
          </div>
          <div>
            <label htmlFor="workEmail" className="block text-sm font-medium text-gray-700">Work Email</label>
            <input
              type="email"
              id="workEmail"
              value={formData.workEmail}
              onChange={(e) => setFormData(prev => ({ ...prev, workEmail: e.target.value }))}
              className="input mt-1"
            />
          </div>
        </div>
      </div>

      {/* Compensation */}
      <div className="space-y-6">
        <h3 className="text-lg font-medium text-gray-900">Compensation</h3>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <label htmlFor="salaryCurrency" className="block text-sm font-medium text-gray-700">Currency</label>
            <select
              id="salaryCurrency"
              value={formData.salaryCurrency}
              onChange={(e) => setFormData(prev => ({ ...prev, salaryCurrency: e.target.value }))}
              className="input mt-1"
            >
              <option value="ETB">ETB</option>
              <option value="USD">USD</option>
            </select>
          </div>
          <div>
            <label htmlFor="payFrequency" className="block text-sm font-medium text-gray-700">Pay Frequency</label>
            <select
              id="payFrequency"
              value={formData.payFrequency}
              onChange={(e) => setFormData(prev => ({ ...prev, payFrequency: e.target.value as 'Monthly' | 'Bi-weekly' | 'Weekly' }))}
              className="input mt-1"
            >
              <option value="Monthly">Monthly</option>
              <option value="Bi-weekly">Bi-weekly</option>
              <option value="Weekly">Weekly</option>
            </select>
          </div>
          <div>
            <label htmlFor="salary" className="block text-sm font-medium text-gray-700">Base Salary</label>
            <input
              type="number"
              id="salary"
              value={formData.salary}
              onChange={(e) => setFormData(prev => ({ ...prev, salary: Number(e.target.value) }))}
              className="input mt-1"
              min="0"
              step="0.01"
            />
          </div>
          <div>
            <label htmlFor="transportAllowance" className="block text-sm font-medium text-gray-700">
              Transport Allowance
            </label>
            <input
              type="number"
              id="transportAllowance"
              value={formData.transportAllowance}
              onChange={(e) => setFormData(prev => ({ ...prev, transportAllowance: Number(e.target.value) }))}
              className="input mt-1"
              min="0"
              step="0.01"
            />
          </div>
          <div>
            <label htmlFor="housingAllowance" className="block text-sm font-medium text-gray-700">
              Housing Allowance
            </label>
            <input
              type="number"
              id="housingAllowance"
              value={formData.housingAllowance}
              onChange={(e) => setFormData(prev => ({ ...prev, housingAllowance: Number(e.target.value) }))}
              className="input mt-1"
              min="0"
              step="0.01"
            />
          </div>
          <div>
            <label htmlFor="positionAllowance" className="block text-sm font-medium text-gray-700">
              Position Allowance
            </label>
            <input
              type="number"
              id="positionAllowance"
              value={formData.positionAllowance}
              onChange={(e) => setFormData(prev => ({ ...prev, positionAllowance: Number(e.target.value) }))}
              className="input mt-1"
              min="0"
              step="0.01"
            />
          </div>
        </div>
      </div>

      {/* Time */}
      <div className="space-y-6">
        <h3 className="text-lg font-medium text-gray-900">Time</h3>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
          <div>
            <label htmlFor="dateJoined" className="block text-sm font-medium text-gray-700">Date Joined</label>
            <input
              type="date"
              id="dateJoined"
              value={formData.dateJoined}
              onChange={(e) => setFormData(prev => ({ ...prev, dateJoined: e.target.value }))}
              className="input mt-1"
            />
          </div>
          <div>
            <label htmlFor="dateLeft" className="block text-sm font-medium text-gray-700">Date Left</label>
            <input
              type="date"
              id="dateLeft"
              value={formData.dateLeft}
              onChange={(e) => setFormData(prev => ({ ...prev, dateLeft: e.target.value }))}
              className="input mt-1"
            />
          </div>
          <div>
            <label htmlFor="yearsOfExperience" className="block text-sm font-medium text-gray-700">
              Years of Experience
            </label>
            <input
              type="number"
              id="yearsOfExperience"
              value={formData.yearsOfExperience}
              onChange={(e) => setFormData(prev => ({ ...prev, yearsOfExperience: Number(e.target.value) }))}
              className="input mt-1"
              min="0"
              step="1"
            />
          </div>
        </div>
      </div>

      {/* External Experience */}
      <div className="space-y-6">
        <h3 className="text-lg font-medium text-gray-900">External Experience</h3>
        <button
          type="button"
          onClick={() => setFormData(prev => ({
            ...prev,
            externalExperience: [
              ...prev.externalExperience,
              {
                company: '',
                position: '',
                startDate: new Date(),
                description: ''
              }
            ]
          }))}
          className="btn btn-secondary"
        >
          Add Experience
        </button>
        <div className="space-y-4">
          {formData.externalExperience.map((exp, index) => (
            <div key={index} className="card">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Company</label>
                  <input
                    type="text"
                    value={exp.company}
                    onChange={(e) => {
                      const newExperience = [...formData.externalExperience];
                      newExperience[index].company = e.target.value;
                      setFormData(prev => ({ ...prev, externalExperience: newExperience }));
                    }}
                    className="input mt-1"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Position</label>
                  <input
                    type="text"
                    value={exp.position}
                    onChange={(e) => {
                      const newExperience = [...formData.externalExperience];
                      newExperience[index].position = e.target.value;
                      setFormData(prev => ({ ...prev, externalExperience: newExperience }));
                    }}
                    className="input mt-1"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Start Date</label>
                  <input
                    type="date"
                    value={exp.startDate instanceof Date ? exp.startDate.toISOString().split('T')[0] : exp.startDate}
                    onChange={(e) => {
                      const newExperience = [...formData.externalExperience];
                      newExperience[index].startDate = new Date(e.target.value);
                      setFormData(prev => ({ ...prev, externalExperience: newExperience }));
                    }}
                    className="input mt-1"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">End Date</label>
                  <input
                    type="date"
                    value={exp.endDate instanceof Date ? exp.endDate.toISOString().split('T')[0] : exp.endDate}
                    onChange={(e) => {
                      const newExperience = [...formData.externalExperience];
                      newExperience[index].endDate = new Date(e.target.value);
                      setFormData(prev => ({ ...prev, externalExperience: newExperience }));
                    }}
                    className="input mt-1"
                  />
                </div>
              </div>
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700">Description</label>
                <textarea
                  value={exp.description}
                  onChange={(e) => {
                    const newExperience = [...formData.externalExperience];
                    newExperience[index].description = e.target.value;
                    setFormData(prev => ({ ...prev, externalExperience: newExperience }));
                  }}
                  className="input mt-1"
                  rows={2}
                />
              </div>
            </div>
          ))}
        </div>
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
          {loading ? 'Saving...' : initialData ? 'Update Employee' : 'Add Employee'}
        </button>
      </div>
    </form>
  );
};
