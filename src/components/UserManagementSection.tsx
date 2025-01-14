import React, { useState, useEffect } from 'react';
import { Shield, Edit2, Trash2, Plus } from 'lucide-react';
import { AdminUser, ADMIN_PERMISSIONS, AdminPermission } from '../lib/firebase/users';
import { Employee } from '../lib/firebase/employees';
import { wrapFirebaseOperation } from '../lib/utils/errorHandling';

interface UserManagementSectionProps {
  users: AdminUser[];
  allEmployees: Employee[];
  onAddUser: (data: Omit<AdminUser, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  onUpdateUser: (id: string, data: Partial<AdminUser>) => Promise<void>;
  onDeleteUser: (id: string) => Promise<void>;
}

const UserManagementSection: React.FC<UserManagementSectionProps> = ({
  users,
  allEmployees,
  onAddUser,
  onUpdateUser,
  onDeleteUser,
}) => {
  const [showForm, setShowForm] = useState(false);
  const [editingUser, setEditingUser] = useState<AdminUser | null>(null);
  const [employeeSearch, setEmployeeSearch] = useState('');
  const [showEmployeeResults, setShowEmployeeResults] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [userSearch, setUserSearch] = useState('');
  const [userTypeFilter, setUserTypeFilter] = useState<'all' | 'staff' | 'admin' | 'super_admin'>('all');
  const [formData, setFormData] = useState({
    email: '',
    name: '',
    newEmail: '',
    role: 'staff' as AdminUser['role'],
    permissions: [] as string[],
    active: true,
    employeeId: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Filter out employees who already have user accounts
  const availableEmployees = allEmployees.filter(emp => 
    !users.some(user => user.employeeId === emp.id)
  );

  // Reset form when editing user changes
  useEffect(() => {
    if (editingUser) {
      setFormData({
        email: editingUser.email,
        name: editingUser.name,
        role: editingUser.role,
        permissions: editingUser.permissions,
        active: editingUser.active,
        employeeId: editingUser.employeeId || '',
      });
      if (editingUser.employeeId) {
        const employee = allEmployees.find(e => e.id === editingUser.employeeId);
        setSelectedEmployee(employee || null);
      }
    }
  }, [editingUser, allEmployees]);

  // Filter employees based on search
  const filteredEmployees = employeeSearch.trim()
    ? availableEmployees.filter(employee => {
        const fullName = `${employee.firstName || ''} ${employee.fatherName || ''}`.toLowerCase();
        const searchTerm = employeeSearch.toLowerCase();
        return fullName.includes(searchTerm) || 
               employee.workEmail?.toLowerCase().includes(searchTerm) ||
               employee.staffId?.toLowerCase().includes(searchTerm);
      })
    : availableEmployees;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (!selectedEmployee?.workEmail) {
        throw new Error('Employee must have a work email to be made an admin');
      }

      // Handle email update if changed
      const emailChanged = editingUser && formData.newEmail && formData.newEmail !== editingUser.email;
      
      // Create user without password, triggering password reset email
      const userData = {
        email: emailChanged ? formData.newEmail : (selectedEmployee?.workEmail || editingUser?.email),
        name: `${selectedEmployee.firstName} ${selectedEmployee.fatherName}`,
        role: formData.role,
        permissions: formData.role === 'admin' ? ADMIN_PERMISSIONS : ['basic_access'],
        employeeId: selectedEmployee.id,
        active: true
      };

      if (editingUser) {
        // If email changed, update auth email first
        if (emailChanged) {
          await wrapFirebaseOperation(
            () => updateUserEmail(editingUser.email, formData.newEmail),
            'Error updating user email'
          );
        }
        await onUpdateUser(editingUser.id!, userData);
      } else {
        await onAddUser(userData);
      }

      setShowForm(false);
      setEditingUser(null);
      setFormData({
        email: '',
        name: '',
        role: 'staff',
        permissions: [],
        active: true,
        employeeId: '',
      });
      setSelectedEmployee(null);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to save admin user';
      setError(errorMessage);
      console.error('Admin user error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Filter users based on search and type
  const filteredUsers = users.filter(user => {
    if (userTypeFilter !== 'all' && user.role !== userTypeFilter) return false;
    if (userSearch) {
      const searchTerm = userSearch.toLowerCase();
      return (
        user.name.toLowerCase().includes(searchTerm) ||
        user.email.toLowerCase().includes(searchTerm)
      );
    }
    return true;
  });

  const handlePasswordReset = async (email: string) => {
    try {
      await wrapFirebaseOperation(
        () => sendPasswordResetEmail(email),
        'Error sending password reset email'
      );
      alert('Password reset email sent successfully');
    } catch (err) {
      setError('Failed to send password reset email');
    }
  };

  return (
    <div className="mt-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">User Management</h2>
          <p className="mt-1 text-sm text-gray-500">
            {users.length > 0 
              ? `${users.length} user${users.length === 1 ? '' : 's'}`
              : 'Grant portal access to employees'}
          </p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="btn btn-primary"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add User
        </button>
      </div>

      {/* User Form */}
      {(showForm || editingUser) && (
        <div className="card mb-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            {editingUser ? 'Edit Admin Access' : 'Grant Admin Access'}
          </h3>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <div>
                <label htmlFor="employeeSearch" className="block text-sm font-medium text-gray-700">
                  Select Employee
                </label>
                <div className="relative">
                  <input
                    type="text"
                    id="employeeSearch"
                    value={selectedEmployee ? `${selectedEmployee.firstName} ${selectedEmployee.fatherName}` : employeeSearch}
                    onChange={(e) => {
                      setEmployeeSearch(e.target.value);
                      setSelectedEmployee(null);
                      setShowEmployeeResults(true);
                    }}
                    onFocus={() => {
                      if (selectedEmployee) {
                        setEmployeeSearch(`${selectedEmployee.firstName} ${selectedEmployee.fatherName}`);
                        setSelectedEmployee(null);
                      }
                      setShowEmployeeResults(true);
                    }}
                    className="input mt-1"
                    placeholder="Search employees..."
                    required
                    disabled={!!editingUser}
                  />
                  {showEmployeeResults && filteredEmployees.length > 0 && (
                    <div className="absolute z-10 w-full bg-white mt-1 border border-gray-200 rounded-none shadow-lg">
                      {filteredEmployees.map(employee => (
                        <div
                          key={employee.id}
                          className="px-4 py-2 hover:bg-gray-50 cursor-pointer"
                          onClick={() => {
                            setSelectedEmployee(employee);
                            setFormData(prev => ({
                              ...prev,
                              email: employee.workEmail || '',
                              name: `${employee.firstName} ${employee.fatherName}`
                            }));
                            setEmployeeSearch('');
                            setShowEmployeeResults(false);
                          }}
                        >
                          <div className="text-sm font-medium text-gray-900">
                            {employee.firstName} {employee.fatherName}
                          </div>
                          <div className="text-sm text-gray-500">
                            {employee.workEmail || 'No work email'}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                {selectedEmployee && !selectedEmployee.workEmail && (
                  <p className="mt-1 text-sm text-red-600">
                    This employee needs a work email to be granted admin access
                  </p>
                )}
              </div>
            </div>

            <div>
              <label htmlFor="role" className="block text-sm font-medium text-gray-700">
                Role
              </label>
              <select
                id="role"
                value={formData.role}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  role: e.target.value as AdminUser['role']
                }))}
                className="input mt-1"
                required
              >
                <option value="staff">Staff</option>
                <option value="admin">Admin</option>
                <option value="super_admin">Super Admin</option>
              </select>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="active"
                checked={formData.active}
                onChange={(e) => setFormData(prev => ({ ...prev, active: e.target.checked }))}
                className="rounded-none border-gray-300 text-brand-600 focus:ring-brand-600"
              />
              <label htmlFor="active" className="ml-2 text-sm text-gray-700">
                Active
              </label>
            </div>

            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setEditingUser(null);
                }}
                className="btn btn-secondary"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={loading || (!editingUser && !selectedEmployee)}
              >
                {loading ? 'Saving...' : editingUser ? 'Update User' : 'Add User'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Search and Filters */}
      <div className="card mb-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="userSearch" className="block text-sm font-medium text-gray-700">
              Search Users
            </label>
            <input
              type="text"
              id="userSearch"
              value={userSearch}
              onChange={(e) => setUserSearch(e.target.value)}
              className="input mt-1"
              placeholder="Search by name or email..."
            />
          </div>
          <div>
            <label htmlFor="userTypeFilter" className="block text-sm font-medium text-gray-700">
              User Type
            </label>
            <select
              id="userTypeFilter"
              value={userTypeFilter}
              onChange={(e) => setUserTypeFilter(e.target.value as typeof userTypeFilter)}
              className="input mt-1"
            >
              <option value="all">All Users</option>
              <option value="staff">Staff</option>
              <option value="admin">Admin</option>
              <option value="super_admin">Super Admin</option>
            </select>
          </div>
        </div>
      </div>
      {/* Users List */}
      {filteredUsers.length === 0 ? (
        <div className="text-center py-12">
          <Shield className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No users found</h3>
          <p className="mt-1 text-sm text-gray-500">
            {userSearch || userTypeFilter !== 'all' 
              ? 'Try adjusting your search or filters'
              : 'Get started by adding a new user.'}
          </p>
          <div className="mt-6">
            <button
              onClick={() => setShowForm(true)}
              className="btn btn-primary"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add User
            </button>
          </div>
        </div>
      ) : (
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead>
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                User
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Role
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Permissions
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
            {filteredUsers.map((user) => (
              <tr key={user.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10">
                      <div className="h-10 w-10 bg-brand-100 flex items-center justify-center">
                        <Shield className="h-5 w-5 text-brand-600" />
                      </div>
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">{user.name}</div>
                      <div className="text-sm text-gray-500">{user.email}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-none ${
                    user.role === 'super_admin'
                      ? 'bg-purple-100 text-purple-800'
                      : user.role === 'staff'
                      ? 'bg-gray-100 text-gray-800'
                      : 'bg-blue-100 text-blue-800'
                  }`}>
                    {user.role === 'super_admin' ? 'Super Admin' : user.role === 'admin' ? 'Admin' : 'Staff'}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex flex-wrap gap-1">
                    {user.permissions.map((permission) => (
                      <span
                        key={permission}
                        className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800"
                      >
                        {permission.split('_').map(word => 
                          word.charAt(0).toUpperCase() + word.slice(1)
                        ).join(' ')}
                      </span>
                    ))}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-none ${
                    user.active
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {user.active ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button
                    onClick={() => {
                      setEditingUser(user);
                      setFormData({
                        email: user.email,
                        name: user.name,
                        role: user.role,
                        permissions: user.permissions,
                        active: user.active,
                        employeeId: user.employeeId || '',
                      });
                      setShowForm(true);
                    }}
                    className="text-brand-600 hover:text-brand-900 mr-3"
                  >
                    <Edit2 className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => {
                      if (window.confirm('Are you sure you want to delete this user?')) {
                        onDeleteUser(user.id!);
                      }
                    }}
                    className="text-red-600 hover:text-red-900"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handlePasswordReset(user.email)}
                    className="text-brand-600 hover:text-brand-900"
                  >
                    Reset Password
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      )}
      {/* Email Change Form */}
      {editingUser && (
        <div className="mt-4">
          <label htmlFor="newEmail" className="block text-sm font-medium text-gray-700">
            New Email (Optional)
          </label>
          <div className="mt-1">
            <input
              type="email"
              id="newEmail"
              value={formData.newEmail}
              onChange={(e) => setFormData(prev => ({ ...prev, newEmail: e.target.value }))}
              className="input"
              placeholder="Enter new email address"
            />
          </div>
          <p className="mt-1 text-sm text-gray-500">
            Leave blank to keep current email: {editingUser.email}
          </p>
        </div>
      )}
    </div>
  );
};

export default UserManagementSection;