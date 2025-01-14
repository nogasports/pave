import React, { useState, useEffect } from 'react';
import { Calendar, UserCheck, Clock } from 'lucide-react';
import LeaveManagement from '../../components/work/LeaveManagement';
import AttendanceManagement from '../../components/work/AttendanceManagement';
import CalendarView from '../../components/calendar/CalendarView';
import { Employee } from '../../lib/firebase/employees';
import { Department } from '../../lib/firebase/departments';

type TabType = 'shifts' | 'leaves' | 'attendance' | 'calendar';
const WorkManagement: React.FC = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [activeTab, setActiveTab] = useState<TabType>('leaves');

  const tabs = [
    { id: 'leaves', name: 'Leave Management', icon: Calendar },
    { id: 'attendance', name: 'Attendance Management', icon: UserCheck },
    { id: 'calendar', name: 'Calendar', icon: Calendar },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-900">Work Management</h1>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as TabType)}
                className={`
                  group inline-flex items-center py-4 px-1 border-b-2 font-medium text-sm
                  ${activeTab === tab.id
                    ? 'border-brand-600 text-brand-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}
                `}
              >
                <Icon className={`
                  -ml-0.5 mr-2 h-5 w-5
                  ${activeTab === tab.id ? 'text-brand-600' : 'text-gray-400 group-hover:text-gray-500'}
                `} />
                {tab.name}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Panels */}
      <div className="mt-6">
        {activeTab === 'leaves' && <LeaveManagement employees={employees} />}
        {activeTab === 'attendance' && <AttendanceManagement employees={employees} departments={departments} />}
        {activeTab === 'calendar' && <CalendarView />}
      </div>
    </div>
  );
};

export default WorkManagement;