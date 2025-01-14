import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { 
  Users, Building2, Clock, Briefcase, ChevronRight,
  CreditCard, Package, Calendar, TrendingUp, TrendingDown,
  DollarSign, UserCheck, AlertCircle, BarChart2, FileText,
  CheckCircle, XCircle, LifeBuoy, Truck
} from 'lucide-react';
import {
  LineChart, Line, AreaChart, Area, PieChart, Pie,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  Cell, BarChart, Bar
} from 'recharts';
import { Employee, getEmployees } from '../../lib/firebase/employees';
import { Department, getDepartments } from '../../lib/firebase/departments';
import { JobPosting, getJobPostings } from '../../lib/firebase/recruitment';
import { Attendance, getAttendance } from '../../lib/firebase/workManagement';
import { PayrollRecord, getPayrollRecords } from '../../lib/firebase/finance';
import { SupportTicket, getTickets } from '../../lib/firebase/support';
import { wrapFirebaseOperation } from '../../lib/utils/errorHandling';

const BusinessDashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalEmployees: 0,
    departments: 0,
    openPositions: 0,
    activeJobs: 0,
    attendanceRate: 0,
    newHires: 0,
    totalPayroll: 0,
    avgSalary: 0,
    supportTickets: 0,
    urgentTickets: 0,
    totalAssets: 0,
    availableAssets: 0,
    pendingApprovals: 0,
    activeRecruitment: 0,
    completedRecruitment: 0,
    totalDeliveries: 0,
    onTimeDeliveries: 0
  });
  const [attendanceData, setAttendanceData] = useState([]);
  const [payrollTrend, setPayrollTrend] = useState([]);
  const [departmentDistribution, setDepartmentDistribution] = useState([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentAdmin, setCurrentAdmin] = useState<Employee | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [
        employees, depts, jobs, todayAttendance, 
        payrollData, tickets, lastMonthAttendance
      ] = await Promise.all([
        wrapFirebaseOperation(() => getEmployees(), 'Error loading employees'),
        wrapFirebaseOperation(() => getDepartments(), 'Error loading departments'),
        wrapFirebaseOperation(() => getJobPostings(), 'Error loading jobs'),
        wrapFirebaseOperation(() => getAttendance(), 'Error loading attendance'),
        wrapFirebaseOperation(() => getPayrollRecords(), 'Error loading payroll'),
        wrapFirebaseOperation(() => getTickets(), 'Error loading tickets'),
        wrapFirebaseOperation(() => getAttendance(undefined, new Date(new Date().setMonth(new Date().getMonth() - 1))), 'Error loading attendance history')
      ]);

      // Find current admin
      const admin = employees.find(emp => emp.workEmail === user?.email);
      setCurrentAdmin(admin);

      // Calculate statistics
      const today = new Date().toDateString();
      const presentToday = todayAttendance.filter(a => 
        new Date(a.date).toDateString() === today && 
        a.status === 'Present'
      ).length;

      // Calculate department distribution
      const deptDist = depts.map(dept => ({
        name: dept.name,
        value: employees.filter(e => e.departmentId === dept.id).length
      }));

      // Calculate attendance trend
      const attendanceTrend = lastMonthAttendance.reduce((acc, curr) => {
        const date = new Date(curr.date).toLocaleDateString();
        const existing = acc.find(a => a.date === date);
        if (existing) {
          existing.present += curr.status === 'Present' ? 1 : 0;
          existing.total += 1;
        } else {
          acc.push({
            date,
            present: curr.status === 'Present' ? 1 : 0,
            total: 1
          });
        }
        return acc;
      }, []);

      // Calculate payroll trend
      const payrollByMonth = payrollData.reduce((acc, curr) => {
        const month = curr.month;
        const existing = acc.find(p => p.month === month);
        if (existing) {
          existing.amount += curr.netSalary;
        } else {
          acc.push({ month, amount: curr.netSalary });
        }
        return acc;
      }, []);

      setStats({
        totalEmployees: employees.length,
        departments: depts.length,
        openPositions: depts.reduce((sum, d) => sum + (d.openPositions || 0), 0),
        activeJobs: jobs.filter(j => j.status === 'Published').length,
        attendanceRate: employees.length ? Math.round((presentToday / employees.length) * 100) : 0,
        newHires: employees.filter(e => {
          const joinDate = e.dateJoined ? new Date(e.dateJoined) : null;
          return joinDate && joinDate.getMonth() === new Date().getMonth();
        }).length,
        totalPayroll: payrollData.reduce((sum, p) => sum + p.netSalary, 0),
        avgSalary: employees.length ? Math.round(payrollData.reduce((sum, p) => sum + p.netSalary, 0) / employees.length) : 0,
        supportTickets: tickets.length,
        urgentTickets: tickets.filter(t => t.priority === 'urgent').length,
        totalAssets: 0,
        availableAssets: 0,
        pendingApprovals: 0,
        activeRecruitment: jobs.filter(j => j.status === 'Published').length,
        completedRecruitment: jobs.filter(j => j.status === 'Filled').length,
        totalDeliveries: 0,
        onTimeDeliveries: 0
      });

      setAttendanceData(attendanceTrend);
      setPayrollTrend(payrollByMonth);
      setDepartmentDistribution(deptDist);
      setDepartments(depts);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-600 mb-4"></div>
          <p className="text-gray-500">Loading dashboard data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg">
        <p className="font-medium">Error Loading Dashboard</p>
        <p className="mt-1">{error}</p>
        <button 
          onClick={loadData}
          className="mt-4 text-sm text-red-600 hover:text-red-800"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h1 className="text-2xl font-semibold text-gray-900">
          Welcome back, {currentAdmin?.firstName}!
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Here's what's happening at Pave Logistics today
        </p>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Users className="h-6 w-6 text-brand-600" />
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-gray-500">Total Employees</h3>
              <div className="mt-1">
                <p className="text-2xl font-semibold text-gray-900">{stats.totalEmployees}</p>
                <p className="text-sm text-gray-500">
                  {stats.newHires} new this month
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Building2 className="h-6 w-6 text-brand-600" />
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-gray-500">Departments</h3>
              <div className="mt-1">
                <p className="text-2xl font-semibold text-gray-900">{stats.departments}</p>
                <p className="text-sm text-gray-500">{stats.openPositions} open positions</p>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Clock className="h-6 w-6 text-brand-600" />
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-gray-500">Attendance Rate</h3>
              <div className="mt-1">
                <p className="text-2xl font-semibold text-gray-900">{stats.attendanceRate}%</p>
                <p className="text-sm text-gray-500">Today's attendance</p>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Briefcase className="h-6 w-6 text-brand-600" />
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-gray-500">Active Jobs</h3>
              <div className="mt-1">
                <p className="text-2xl font-semibold text-gray-900">{stats.activeJobs}</p>
                <p className="text-sm text-gray-500">Published positions</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Additional Stats */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <div className="card">
          <div className="flex items-center">
            <div className="bg-purple-50 rounded-none p-3">
              <Package className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-gray-500">Assets</h3>
              <div className="mt-1">
                <p className="text-2xl font-semibold text-gray-900">{stats.totalAssets}</p>
                <p className="text-sm text-gray-500">{stats.availableAssets} available</p>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="bg-orange-50 rounded-none p-3">
              <FileText className="h-6 w-6 text-orange-600" />
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-gray-500">Approvals</h3>
              <div className="mt-1">
                <p className="text-2xl font-semibold text-gray-900">{stats.pendingApprovals}</p>
                <p className="text-sm text-gray-500">Pending requests</p>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="bg-teal-50 rounded-none p-3">
              <LifeBuoy className="h-6 w-6 text-teal-600" />
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-gray-500">Support</h3>
              <div className="mt-1">
                <p className="text-2xl font-semibold text-gray-900">{stats.supportTickets}</p>
                <p className="text-sm text-gray-500">{stats.urgentTickets} urgent</p>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="bg-red-50 rounded-none p-3">
              <Truck className="h-6 w-6 text-red-600" />
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-gray-500">Deliveries</h3>
              <div className="mt-1">
                <p className="text-2xl font-semibold text-gray-900">{stats.totalDeliveries}</p>
                <p className="text-sm text-gray-500">{stats.onTimeDeliveries}% on time</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Attendance Trend */}
        <div className="card">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Attendance Trend</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={attendanceData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Area 
                  type="monotone" 
                  dataKey="present" 
                  stroke="#112D4F" 
                  fill="#112D4F" 
                  fillOpacity={0.3}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Payroll Trend */}
        <div className="card">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Payroll Trend</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={payrollTrend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Line 
                  type="monotone" 
                  dataKey="amount" 
                  stroke="#112D4F" 
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Additional Charts */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Recruitment Progress */}
          <div className="card">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Recruitment Progress</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={[
                  { stage: 'Screening', count: stats.activeRecruitment },
                  { stage: 'Interview', count: Math.round(stats.activeRecruitment * 0.7) },
                  { stage: 'Offer', count: Math.round(stats.activeRecruitment * 0.3) },
                  { stage: 'Hired', count: stats.completedRecruitment }
                ]}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="stage" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#112D4F" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Support Tickets by Priority */}
          <div className="card">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Support Tickets by Priority</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={[
                      { name: 'Urgent', value: stats.urgentTickets },
                      { name: 'High', value: Math.round(stats.supportTickets * 0.3) },
                      { name: 'Medium', value: Math.round(stats.supportTickets * 0.4) },
                      { name: 'Low', value: Math.round(stats.supportTickets * 0.2) }
                    ]}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    label
                  >
                    <Cell fill="#ef4444" />
                    <Cell fill="#f97316" />
                    <Cell fill="#eab308" />
                    <Cell fill="#22c55e" />
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Department Distribution */}
        <div className="card">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Employee Distribution</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={departmentDistribution}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label
                >
                  {departmentDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={`hsl(${index * 45}, 70%, 50%)`} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Department Overview */}
      <div className="card">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-medium text-gray-900">Department Overview</h2>
          <Link 
            to="/business/organization" 
            className="text-sm text-brand-600 hover:text-brand-700"
          >
            View All
          </Link>
        </div>
        <div className="space-y-4">
          {departments.length === 0 ? (
            <div className="text-center py-8">
              <Building2 className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No Departments</h3>
              <p className="mt-1 text-sm text-gray-500">
                Get started by adding your first department
              </p>
              <Link 
                to="/business/organization"
                className="mt-4 inline-flex items-center text-sm text-brand-600 hover:text-brand-700"
              >
                Add Department
                <ChevronRight className="ml-1 h-4 w-4" />
              </Link>
            </div>
          ) : (
            departments.map((dept) => (
              <div key={dept.id} className="flex justify-between items-center">
                <div>
                  <p className="text-sm font-medium text-gray-900">{dept.name}</p>
                  <p className="text-sm text-gray-500">{dept.employees} employees</p>
                </div>
                <span className="text-sm text-brand-600">
                  {dept.openPositions} open positions
                </span>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Approval Requests */}
      <div className="card">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-gray-900">Pending Approvals</h3>
        </div>
        <div className="space-y-4">
          {[
            { type: 'Leave Request', employee: 'Sara Tekle', department: 'HR', date: '2024-03-20' },
            { type: 'Asset Request', employee: 'Dawit Haile', department: 'IT', date: '2024-03-19' },
            { type: 'Expense Claim', employee: 'Abebe Kebede', department: 'Finance', date: '2024-03-18' }
          ].map((request, index) => (
            <div key={index} className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-900">{request.type}</p>
                <p className="text-sm text-gray-500">
                  {request.employee} • {request.department}
                </p>
              </div>
              <div className="flex space-x-2">
                <button className="text-green-600 hover:text-green-900">
                  <CheckCircle className="h-5 w-5" />
                </button>
                <button className="text-red-600 hover:text-red-900">
                  <XCircle className="h-5 w-5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Links */}
      <div className="card">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Quick Links</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Link 
            to="/business/recruitment"
            className="p-4 bg-gray-50 hover:bg-gray-100 rounded-lg flex items-center"
          >
            <Briefcase className="h-5 w-5 text-brand-600 mr-3" />
            <div>
              <p className="font-medium text-gray-900">Recruitment</p>
              <p className="text-sm text-gray-500">Manage job postings</p>
            </div>
          </Link>

          <Link 
            to="/business/finance"
            className="p-4 bg-gray-50 hover:bg-gray-100 rounded-lg flex items-center"
          >
            <CreditCard className="h-5 w-5 text-brand-600 mr-3" />
            <div>
              <p className="font-medium text-gray-900">Finance</p>
              <p className="text-sm text-gray-500">Payroll & expenses</p>
            </div>
          </Link>

          <Link 
            to="/business/assets"
            className="p-4 bg-gray-50 hover:bg-gray-100 rounded-lg flex items-center"
          >
            <Package className="h-5 w-5 text-brand-600 mr-3" />
            <div>
              <p className="font-medium text-gray-900">Assets</p>
              <p className="text-sm text-gray-500">Manage inventory</p>
            </div>
          </Link>

          <Link 
            to="/business/calendar"
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

export default BusinessDashboard;