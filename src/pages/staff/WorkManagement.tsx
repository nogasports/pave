import React, { useState, useEffect } from 'react';
import { Calendar, Clock, AlertCircle, CheckCircle, Users } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { Employee, getEmployees } from '../../lib/firebase/employees';
import { AttendanceClockModal } from '../../components/work/AttendanceClockModal';
import { LeaveRequestModal } from '../../components/work/LeaveRequestModal';
import CalendarView from '../../components/calendar/CalendarView';
import { CalendarEvent, getCalendarEvents } from '../../lib/firebase/calendar';
import { 
  Attendance,
  Leave,
  getAttendance,
  addAttendance,
  updateAttendance,
  getLeaves,
  addLeave,
  Shift,
  getShifts,
} from '../../lib/firebase/workManagement';
import { LeaveType, getLeaveTypes } from '../../lib/firebase/leaveTypes';

const WorkManagement: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'attendance' | 'leave' | 'calendar'>('attendance');
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [attendance, setAttendance] = useState<Attendance[]>([]);
  const [leaves, setLeaves] = useState<Leave[]>([]);
  const [leaveTypes, setLeaveTypes] = useState<LeaveType[]>([]);
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [clockedIn, setClockedIn] = useState(false);
  const [showClockModal, setShowClockModal] = useState<'in' | 'out' | null>(null);
  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const [events, setEvents] = useState<CalendarEvent[]>([]);

  const loadCalendarEvents = async (employeeId: string) => {
    try {
      const eventsData = await getCalendarEvents({ userId: employeeId });
      setEvents(eventsData);
    } catch (err) {
      setError('Failed to load calendar events');
    }
  };

  useEffect(() => {
    loadData();
  }, [user]);

  const loadData = async () => {
    try {
      // Get employee record
      const employees = await getEmployees();
      const currentEmployee = employees.find(emp => emp.workEmail === user?.email);
      if (!currentEmployee) {
        throw new Error('Employee record not found');
      }
      setEmployee(currentEmployee);

      // Load all required data
      const [attendanceData, leavesData, leaveTypesData, shiftsData, calendarData] = await Promise.all([
        getAttendance(currentEmployee.id),
        getLeaves(currentEmployee.id),
        getLeaveTypes(),
        getShifts(),
        getCalendarEvents({ userId: currentEmployee.id })
      ]);

      setAttendance(attendanceData);
      setLeaves(leavesData);
      setLeaveTypes(leaveTypesData);
      setShifts(shiftsData);
      setEvents(calendarData);
      
      // Load calendar events for the employee
      if (currentEmployee.id) {
        await loadCalendarEvents(currentEmployee.id);
      }

      // Check if already clocked in today
      const today = new Date().toISOString().split('T')[0];
      const todayAttendance = attendanceData.find(a => 
        new Date(a.date).toISOString().split('T')[0] === today
      );
      setClockedIn(!!todayAttendance?.checkIn && !todayAttendance?.checkOut);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleClockInOut = async (data: Omit<Attendance, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      if (showClockModal === 'in') {
        await addAttendance(data);
        setClockedIn(true);
      } else if (showClockModal === 'out') {
        const today = new Date().toISOString().split('T')[0];
        const todayAttendance = attendance.find(a => 
          new Date(a.date).toISOString().split('T')[0] === today
        );
        if (todayAttendance?.id) {
          await updateAttendance(todayAttendance.id, {
            ...data,
            checkIn: todayAttendance.checkIn,
          });
          setClockedIn(false);
        }
      }
      await loadData();
      setShowClockModal(null);
    } catch (err) {
      setError('Failed to process attendance');
    }
  };

  const handleLeaveRequest = async (data: Omit<Leave, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      await addLeave(data);
      await loadData();
      setShowLeaveModal(false);
    } catch (err) {
      setError('Failed to submit leave request');
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div className="text-red-600">{error}</div>;
  if (!employee) return <div>No employee record found</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-900">Work Management</h1>
        <div className="flex space-x-3">
          {clockedIn ? (
            <button 
              onClick={() => setShowClockModal('out')}
              className="btn btn-secondary"
            >
              Clock Out
            </button>
          ) : (
            <button 
              onClick={() => setShowClockModal('in')}
              className="btn btn-primary"
            >
              Clock In
            </button>
          )}
          <button
            onClick={() => setShowLeaveModal(true)}
            className="btn btn-primary"
          >
            Request Leave
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <div className="card">
          <div className="flex items-center">
            <div className="bg-blue-50 rounded-none p-3">
              <Clock className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-gray-500">Today's Status</h3>
              <div className="mt-1">
                <p className="text-2xl font-semibold text-gray-900">
                  {clockedIn ? 'Clocked In' : 'Not Clocked In'}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="bg-green-50 rounded-none p-3">
              <Calendar className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-gray-500">Leave Balance</h3>
              <div className="mt-1">
                <p className="text-2xl font-semibold text-gray-900">
                  {leaveTypes.find(lt => lt.name === 'Annual')?.daysPerYear || 0} days
                </p>
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
              <h3 className="text-sm font-medium text-gray-500">Pending Leaves</h3>
              <div className="mt-1">
                <p className="text-2xl font-semibold text-gray-900">
                  {leaves.filter(l => l.status === 'Pending').length}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="bg-indigo-50 rounded-none p-3">
              <CheckCircle className="h-6 w-6 text-indigo-600" />
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-gray-500">Attendance Rate</h3>
              <div className="mt-1">
                <p className="text-2xl font-semibold text-gray-900">96%</p>
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
            Attendance History
          </button>
          <button
            onClick={() => setActiveTab('leave')}
            className={`
              group inline-flex items-center py-4 px-1 border-b-2 font-medium text-sm
              ${activeTab === 'leave'
                ? 'border-brand-600 text-brand-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}
            `}
          >
            Leave Management
          </button>
          <button
            onClick={() => setActiveTab('calendar')}
            className={`
              group inline-flex items-center py-4 px-1 border-b-2 font-medium text-sm
              ${activeTab === 'calendar'
                ? 'border-brand-600 text-brand-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}
            `}
          >
            Calendar
          </button>
        </nav>
      </div>

      {/* Content */}
      {activeTab === 'attendance' ? (
        <div className="card">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Attendance Records</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Clock In
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Clock Out
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Hours
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {attendance.map((record) => (
                  <tr key={record.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {new Date(record.date).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {record.checkIn && new Date(record.checkIn).toLocaleTimeString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {record.checkOut && new Date(record.checkOut).toLocaleTimeString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {record.totalWorkHours?.toFixed(2)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-none ${
                        record.status === 'Present'
                          ? 'bg-green-100 text-green-800'
                          : record.status === 'Late'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {record.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : activeTab === 'leave' ? (
        <div className="space-y-6">
          <div className="card">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Leave Balance</h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {leaveTypes.map((type) => (
                <div key={type.id} className="bg-gray-50 p-4">
                  <h4 className="text-sm font-medium text-gray-900">{type.name}</h4>
                  <p className="mt-1 text-2xl font-semibold text-gray-900">
                    {type.daysPerYear} days
                  </p>
                  <p className="mt-1 text-sm text-gray-500">
                    {type.description}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="card">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Leave History</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Duration
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Dates
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {leaves.map((leave) => (
                    <tr key={leave.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{leave.leaveType}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{leave.duration} days</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {new Date(leave.startDate).toLocaleDateString()} - {new Date(leave.endDate).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-none ${
                          leave.status === 'Approved'
                            ? 'bg-green-100 text-green-800'
                            : leave.status === 'Rejected'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {leave.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : (
        <CalendarView 
          events={events}
          employees={[employee!]}
          onEventClick={(event) => {
            // Handle event click
          }}
          onAddEvent={async (data) => {
            try {
              await addCalendarEvent({
                ...data,
                organizer: employee!.id!
              });
              await loadCalendarEvents(employee!.id!);
            } catch (err) {
              setError('Failed to create event');
            }
          }}
        />
      )}
      
      {/* Modals */}
      {showClockModal && (
        <AttendanceClockModal
          type={showClockModal}
          employee={employee}
          shifts={shifts}
          onSubmit={handleClockInOut}
          onClose={() => setShowClockModal(null)}
        />
      )}
      
      {showLeaveModal && (
        <LeaveRequestModal
          employee={employee}
          leaveTypes={leaveTypes}
          onSubmit={handleLeaveRequest}
          onClose={() => setShowLeaveModal(false)}
        />
      )}
    </div>
  );
};

export default WorkManagement;