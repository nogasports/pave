import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Clock, Calendar, FileCheck, AlertCircle, ChevronRight } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { Employee, getEmployees } from '../../lib/firebase/employees';
import { Department, getDepartments } from '../../lib/firebase/departments';
import { Leave, getLeaves } from '../../lib/firebase/workManagement';
import { Attendance, getAttendance } from '../../lib/firebase/workManagement';
import { Document, getDocuments } from '../../lib/firebase/documents';
import { Notification, getNotifications } from '../../lib/firebase/notifications';
import { CalendarEvent, getCalendarEvents } from '../../lib/firebase/calendar';
import { wrapFirebaseOperation } from '../../lib/utils/errorHandling';

const StaffDashboard: React.FC = () => {
  const { user } = useAuth();
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [department, setDepartment] = useState<Department | null>(null);
  const [attendance, setAttendance] = useState<Attendance[]>([]);
  const [leaves, setLeaves] = useState<Leave[]>([]);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [upcomingEvents, setUpcomingEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, [user]);

  const loadData = async () => {
    try {
      // Get employee record
      const employees = await wrapFirebaseOperation(() => getEmployees(), 'Error loading employee data');
      const currentEmployee = employees.find(emp => emp.workEmail === user?.email);
      if (!currentEmployee) {
        throw new Error('Employee record not found');
      }
      setEmployee(currentEmployee);

      // Load department info
      const departmentsData = await wrapFirebaseOperation(() => getDepartments(), 'Error loading departments');
      const dept = departmentsData.find(d => d.id === currentEmployee.departmentId);
      setDepartment(dept || null);

      // Load basic data needed for dashboard
      const attendanceData = await wrapFirebaseOperation(() => getAttendance(currentEmployee.id), 'Error loading attendance');
      const leavesData = await wrapFirebaseOperation(() => getLeaves(currentEmployee.id), 'Error loading leaves');
      const notificationsData = await wrapFirebaseOperation(() => getNotifications(currentEmployee.id), 'Error loading notifications');

      // Set other data
      setAttendance(attendanceData);
      setLeaves(leavesData);
      setNotifications(notificationsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div className="text-red-600">{error}</div>;
  if (!employee) return <div>No employee record found</div>;

  // Calculate statistics
  const thisWeekAttendance = attendance.filter(a => {
    const date = new Date(a.date);
    const today = new Date();
    const weekStart = new Date(today.setDate(today.getDate() - today.getDay()));
    return date >= weekStart;
  });

  const totalHours = thisWeekAttendance.reduce((sum, a) => sum + (a.totalWorkHours || 0), 0);
  const pendingLeaves = leaves.filter(l => l.status === 'Pending').length;
  const unreadNotifications = notifications.filter(n => !n.read).length;

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h1 className="text-2xl font-semibold text-gray-900">
          Welcome back, {employee.firstName}!
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          {department?.name} • {employee.jobTitle}
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Clock className="h-6 w-6 text-brand-600" />
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-gray-500">Hours This Week</h3>
              <div className="mt-1">
                <p className="text-2xl font-semibold text-gray-900">{totalHours.toFixed(1)}</p>
                <p className="text-sm text-gray-500">Target: 40.0 hours</p>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Calendar className="h-6 w-6 text-brand-600" />
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-gray-500">Leave Balance</h3>
              <div className="mt-1">
                <p className="text-2xl font-semibold text-gray-900">12</p>
                <p className="text-sm text-gray-500">{pendingLeaves} pending requests</p>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <FileCheck className="h-6 w-6 text-brand-600" />
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-gray-500">Documents</h3>
              <div className="mt-1">
                <p className="text-2xl font-semibold text-gray-900">{documents.length}</p>
                <p className="text-sm text-gray-500">All documents</p>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <AlertCircle className="h-6 w-6 text-brand-600" />
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-gray-500">Notifications</h3>
              <div className="mt-1">
                <p className="text-2xl font-semibold text-gray-900">{unreadNotifications}</p>
                <p className="text-sm text-gray-500">Unread messages</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Upcoming Events */}
        <div className="card">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-medium text-gray-900">Upcoming Events</h2>
            <Link to="/staff/calendar" className="text-sm text-brand-600 hover:text-brand-700">
              View Calendar
            </Link>
          </div>
          <div className="space-y-4">
            {upcomingEvents.slice(0, 5).map((event) => (
              <div key={event.id} className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-900">{event.title}</p>
                  <p className="text-sm text-gray-500">
                    {new Date(event.startDate).toLocaleString()}
                  </p>
                </div>
                <ChevronRight className="h-5 w-5 text-gray-400" />
              </div>
            ))}
          </div>
        </div>

        {/* Recent Notifications */}
        <div className="card">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-medium text-gray-900">Recent Notifications</h2>
            <Link to="/staff/notifications" className="text-sm text-brand-600 hover:text-brand-700">
              View All
            </Link>
          </div>
          <div className="space-y-4">
            {notifications.slice(0, 5).map((notification) => (
              <div 
                key={notification.id}
                className={`flex items-center justify-between ${!notification.read ? 'bg-gray-50' : ''}`}
              >
                <div>
                  <p className="text-sm font-medium text-gray-900">{notification.title}</p>
                  <p className="text-sm text-gray-500">{notification.message}</p>
                </div>
                <ChevronRight className="h-5 w-5 text-gray-400" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Links */}
      <div className="card">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Quick Links</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Link 
            to="/staff/work"
            className="p-4 bg-gray-50 hover:bg-gray-100 rounded-lg flex items-center"
          >
            <Clock className="h-5 w-5 text-brand-600 mr-3" />
            <div>
              <p className="font-medium text-gray-900">Clock In/Out</p>
              <p className="text-sm text-gray-500">Manage attendance</p>
            </div>
          </Link>

          <Link 
            to="/staff/documents"
            className="p-4 bg-gray-50 hover:bg-gray-100 rounded-lg flex items-center"
          >
            <FileCheck className="h-5 w-5 text-brand-600 mr-3" />
            <div>
              <p className="font-medium text-gray-900">Documents</p>
              <p className="text-sm text-gray-500">View & upload files</p>
            </div>
          </Link>

          <Link 
            to="/staff/chat"
            className="p-4 bg-gray-50 hover:bg-gray-100 rounded-lg flex items-center"
          >
            <AlertCircle className="h-5 w-5 text-brand-600 mr-3" />
            <div>
              <p className="font-medium text-gray-900">Messages</p>
              <p className="text-sm text-gray-500">Chat & notifications</p>
            </div>
          </Link>

          <Link 
            to="/staff/calendar"
            className="p-4 bg-gray-50 hover:bg-gray-100 rounded-lg flex items-center"
          >
            <Calendar className="h-5 w-5 text-brand-600 mr-3" />
            <div>
              <p className="font-medium text-gray-900">Calendar</p>
              <p className="text-sm text-gray-500">View schedule</p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default StaffDashboard;