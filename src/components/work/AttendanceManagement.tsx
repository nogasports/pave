import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, User, Clock, Calendar, Users, AlertCircle, Search } from 'lucide-react';
import { Attendance, getAttendance, addAttendance, updateAttendance, deleteAttendance } from '../../lib/firebase/workManagement';
import { Shift, getShifts, addShift, updateShift, deleteShift } from '../../lib/firebase/workManagement';
import { Department } from '../../lib/firebase/departments';
import { Employee } from '../../lib/firebase/employees';
import AttendanceForm from './AttendanceForm';
import ShiftForm from './ShiftForm';

const ITEMS_PER_PAGE = 10;

interface AttendanceManagementProps {
  employees: Employee[];
  departments: Department[];
}

const AttendanceManagement: React.FC<AttendanceManagementProps> = ({
  employees,
  departments,
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [activeTab, setActiveTab] = useState<'attendance' | 'shifts'>('attendance');
  const [attendance, setAttendance] = useState<Attendance[]>([]);
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [showShiftForm, setShowShiftForm] = useState(false);
  const [editingAttendance, setEditingAttendance] = useState<Attendance | null>(null);
  const [editingShift, setEditingShift] = useState<Shift | null>(null);

  // Employee search state
  const [employeeSearch, setEmployeeSearch] = useState('');
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);

  // Filter employees based on search
  const filteredEmployees = employeeSearch.trim()
    ? employees.filter(emp => {
        const fullName = `${emp.firstName || ''} ${emp.fatherName || ''}`.toLowerCase();
        return fullName.includes(employeeSearch.toLowerCase()) ||
               emp.workEmail?.toLowerCase().includes(employeeSearch.toLowerCase()) ||
               emp.staffId?.toLowerCase().includes(employeeSearch.toLowerCase());
      })
    : employees;

  const handleAddShift = async (data: Omit<Shift, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      await addShift(data);
      await loadData();
      setShowShiftForm(false);
    } catch (err) {
      setError('Failed to add shift');
    }
  };

  const handleUpdateShift = async (data: Omit<Shift, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (!editingShift?.id) return;
    try {
      await updateShift(editingShift.id, data);
      await loadData();
      setEditingShift(null);
    } catch (err) {
      setError('Failed to update shift');
    }
  };

  const handleDeleteShift = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this shift?')) return;
    try {
      await deleteShift(id);
      await loadData();
    } catch (err) {
      setError('Failed to delete shift');
    }
  };

  const handleAddAttendance = async (data: Omit<Attendance, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      // Calculate late minutes if applicable
      const shift = shifts.find(s => s.id === data.shiftId);
      if (shift && data.checkIn) {
        const shiftStart = new Date(`${data.date.toISOString().split('T')[0]}T${shift.startTime}`);
        const checkIn = new Date(data.checkIn);
        if (checkIn > shiftStart) {
          const lateMinutes = Math.round((checkIn.getTime() - shiftStart.getTime()) / (1000 * 60));
          data.lateMinutes = lateMinutes;
          data.status = 'Late';
        }
      }

      await addAttendance(data);
      await loadData();
      setShowForm(false);
    } catch (err) {
      setError('Failed to add attendance');
    }
  };

  const handleUpdateAttendance = async (data: Omit<Attendance, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (!editingAttendance?.id) return;
    try {
      await updateAttendance(editingAttendance.id, data);
      await loadData();
      setEditingAttendance(null);
    } catch (err) {
      setError('Failed to update attendance');
    }
  };

  const handleDeleteAttendance = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this attendance record?')) return;
    try {
      await deleteAttendance(id);
      await loadData();
    } catch (err) {
      setError('Failed to delete attendance');
    }
  };

  const getEmployeeName = (employeeId: string): string => {
    const employee = employees.find(e => e.id === employeeId);
    if (!employee) return 'Unknown Employee';
    return `${employee.firstName || ''} ${employee.fatherName || ''}`.trim();
  };

  const getEmployeeDepartment = (employeeId: string): string => {
    const employee = employees.find(e => e.id === employeeId);
    if (!employee) return '';
    const department = departments.find(d => d.id === employee.departmentId);
    return department?.name || '';
  };

  const getDepartmentName = (departmentId: string): string => {
    const department = departments.find(d => d.id === departmentId);
    return department?.name || 'Unknown Department';
  };

  const getShiftName = (shiftId: string): string => {
    const shift = shifts.find(s => s.id === shiftId);
    return shift?.name || 'Unknown Shift';
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [attendanceData, shiftsData] = await Promise.all([
        getAttendance(),
        getShifts()
      ]);
      setAttendance(attendanceData);
      setShifts(shiftsData);
    } catch (err) {
      setError('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  // Calculate summary statistics
  const stats = React.useMemo(() => ({
    totalShifts: shifts.length,
    activeShifts: shifts.filter(s => s.active).length,
    totalAttendance: attendance.length,
    presentToday: attendance.filter(a => 
      a.date.toDateString() === new Date().toDateString() && 
      a.status === 'Present'
    ).length
  }), [shifts, attendance]);

  // Calculate pagination
  const totalPages = Math.ceil(attendance.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedAttendance = attendance.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <div className="card">
          <div className="flex items-center">
            <div className="bg-blue-50 rounded-none p-3">
              <Clock className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-gray-500">Total Shifts</h3>
              <div className="mt-1">
                <p className="text-2xl font-semibold text-gray-900">{stats.totalShifts}</p>
                <p className="text-sm text-gray-500">{stats.activeShifts} active</p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="card">
          <div className="flex items-center">
            <div className="bg-green-50 rounded-none p-3">
              <Users className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-gray-500">Present Today</h3>
              <div className="mt-1">
                <p className="text-2xl font-semibold text-gray-900">{stats.presentToday}</p>
                <p className="text-sm text-gray-500">of {employees.length} employees</p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="card">
          <div className="flex items-center">
            <div className="bg-yellow-50 rounded-none p-3">
              <AlertCircle className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-gray-500">Late Today</h3>
              <div className="mt-1">
                <p className="text-2xl font-semibold text-gray-900">
                  {attendance.filter(a => 
                    a.date.toDateString() === new Date().toDateString() && 
                    a.status === 'Late'
                  ).length}
                </p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="card">
          <div className="flex items-center">
            <div className="bg-red-50 rounded-none p-3">
              <Calendar className="h-6 w-6 text-red-600" />
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-gray-500">Absent Today</h3>
              <div className="mt-1">
                <p className="text-2xl font-semibold text-gray-900">
                  {attendance.filter(a => 
                    a.date.toDateString() === new Date().toDateString() && 
                    a.status === 'Absent'
                  ).length}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('attendance')}
            className={`
              group inline-flex items-center py-4 px-1 border-b-2 font-medium text-sm
              ${activeTab === 'attendance'
                ? 'border-brand-600 text-brand-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}
            `}
          >
            Attendance Records
          </button>
          <button
            onClick={() => setActiveTab('shifts')}
            className={`
              group inline-flex items-center py-4 px-1 border-b-2 font-medium text-sm
              ${activeTab === 'shifts'
                ? 'border-brand-600 text-brand-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}
            `}
          >
            Shift Management
          </button>
        </nav>
      </div>

      {activeTab === 'shifts' ? (
        // Shifts Section
        <>
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-medium text-gray-900">Shift Schedules</h2>
            <button
              onClick={() => setShowShiftForm(true)}
              className="btn btn-primary"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Shift
            </button>
          </div>

          {(showShiftForm || editingShift) && (
            <div className="card">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                {editingShift ? 'Edit Shift' : 'Add New Shift'}
              </h3>
              <ShiftForm
                initialData={editingShift || undefined}
                departments={departments}
                employees={employees}
                onSubmit={editingShift ? handleUpdateShift : handleAddShift}
                onCancel={() => {
                  setShowShiftForm(false);
                  setEditingShift(null);
                }}
              />
            </div>
          )}

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {shifts.map((shift) => (
              <div key={shift.id} className="card">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">{shift.name}</h3>
                    <p className="text-sm text-gray-500">{shift.code}</p>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => setEditingShift(shift)}
                      className="text-gray-400 hover:text-brand-600"
                    >
                      <Edit2 className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => shift.id && handleDeleteShift(shift.id)}
                      className="text-gray-400 hover:text-red-600"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>
                </div>

                <div className="mt-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Time</span>
                    <span className="text-gray-900">{shift.startTime} - {shift.endTime}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Break</span>
                    <span className="text-gray-900">{shift.breakDuration} minutes</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Type</span>
                    <span className="text-gray-900">{shift.type}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Work Days</span>
                    <span className="text-gray-900">{shift.workDays.join(', ')}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Status</span>
                    <span className={`${shift.active ? 'text-green-600' : 'text-red-600'}`}>
                      {shift.active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      ) : (
        // Attendance Section
        <>
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-medium text-gray-900">Attendance Records</h2>
            <button
              onClick={() => setShowForm(true)}
              className="btn btn-primary"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Attendance
            </button>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3">
              {error}
            </div>
          )}

          {(showForm || editingAttendance) && (
            <div className="card">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                {editingAttendance ? 'Edit Attendance Record' : 'Add New Attendance Record'}
              </h3>
              <AttendanceForm
                initialData={editingAttendance || undefined}
                shifts={shifts}
                employees={employees}
                onSubmit={editingAttendance ? handleUpdateAttendance : handleAddAttendance}
                onCancel={() => {
                  setShowForm(false);
                  setEditingAttendance(null);
                }}
              />
            </div>
          )}

          {/* Employee Search */}
          <div className="mb-4">
            <label htmlFor="employeeSearch" className="block text-sm font-medium text-gray-700">
              Search Employee
            </label>
            <div className="relative mt-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                id="employeeSearch"
                value={employeeSearch}
                onChange={(e) => setEmployeeSearch(e.target.value)}
                className="input pl-10"
                placeholder="Search by name, email or ID..."
              />
            </div>
          </div>

          {/* Attendance Records */}
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Employee
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Department
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Shift
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Check In/Out
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
                {paginatedAttendance
                  .filter(record => {
                    const employee = employees.find(e => e.id === record.employeeId);
                    if (!employeeSearch) return true;
                    if (!employee) return false;
                    const searchTerm = employeeSearch.toLowerCase();
                    return (
                      `${employee.firstName} ${employee.fatherName}`.toLowerCase().includes(searchTerm) ||
                      employee.workEmail?.toLowerCase().includes(searchTerm) ||
                      employee.staffId?.toLowerCase().includes(searchTerm)
                    );
                  })
                  .map((record) => (
                  <tr key={record.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 bg-gray-100 flex items-center justify-center">
                            <User className="h-6 w-6 text-gray-400" />
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {getEmployeeName(record.employeeId)}
                          </div>
                          <div className="text-sm text-gray-500">
                            {getEmployeeName(record.employeeId)}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {getDepartmentName(getEmployeeDepartment(record.employeeId))}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {new Date(record.date).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {getShiftName(record.shiftId)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {record.checkIn && new Date(record.checkIn).toLocaleTimeString()} -
                        {record.checkOut && new Date(record.checkOut).toLocaleTimeString()}
                      </div>
                      {record.lateMinutes && (
                        <div className="text-sm text-red-500">
                          {record.lateMinutes} minutes late
                        </div>
                      )}
                      {record.totalWorkHours && (
                        <div className="text-sm text-gray-500">
                          {record.totalWorkHours} hours
                          {record.overtimeHours ? ` (+${record.overtimeHours} OT)` : ''}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-none ${
                        record.status === 'Present'
                          ? 'bg-green-100 text-green-800'
                          : record.status === 'Absent'
                          ? 'bg-red-100 text-red-800'
                          : record.status === 'Late'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {record.status}
                        {record.lateMinutes ? ` (${record.lateMinutes}m late)` : ''}
                        {record.earlyMinutes ? ` (${record.earlyMinutes}m early)` : ''}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => setEditingAttendance(record)}
                        className="text-brand-600 hover:text-brand-900 mr-3"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => record.id && handleDeleteAttendance(record.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-between items-center border-t border-gray-200 pt-4">
              <div className="text-sm text-gray-500">
                Showing {startIndex + 1} to {Math.min(startIndex + ITEMS_PER_PAGE, attendance.length)} of {attendance.length} records
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="btn btn-secondary px-3 py-1"
                >
                  Previous
                </button>
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="btn btn-secondary px-3 py-1"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default AttendanceManagement;