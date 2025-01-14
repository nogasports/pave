import React from 'react';
import { Department } from '../lib/firebase/departments';
import { Employee } from '../lib/firebase/employees';
import { Users, Building2, BanknoteIcon, UserPlus } from 'lucide-react';

interface OrganizationSummaryProps {
  departments: Department[];
  employees: Employee[];
}

const OrganizationSummary: React.FC<OrganizationSummaryProps> = ({ departments, employees }) => {
  // Calculate summary statistics
  const totalEmployees = employees.length;
  const totalDepartments = departments.length;
  const totalManagers = employees.filter(emp => emp.position === 'Manager').length;
  const totalOpenPositions = departments.reduce((sum, dept) => sum + (dept.openPositions || 0), 0);
  
  // Calculate total annual budget
  const totalBudget = departments.reduce((sum, dept) => {
    const budget = parseFloat(dept.budget?.replace(/[^0-9.]/g, '') || '0');
    return sum + budget;
  }, 0);

  const stats = [
    {
      name: 'Total Employees',
      value: totalEmployees,
      change: `${totalManagers} managers`,
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      name: 'Departments',
      value: totalDepartments,
      change: 'Active departments',
      icon: Building2,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50',
    },
    {
      name: 'Annual Budget',
      value: `${totalBudget.toLocaleString()} ETB`,
      change: 'Total allocated',
      icon: BanknoteIcon,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      name: 'Open Positions',
      value: totalOpenPositions,
      change: 'Across all departments',
      icon: UserPlus,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => (
        <div key={stat.name} className="card">
          <div className="flex items-center">
            <div className={`${stat.bgColor} rounded-none p-3`}>
              <stat.icon className={`h-6 w-6 ${stat.color}`} />
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-gray-500">{stat.name}</h3>
              <div className="mt-1">
                <p className="text-2xl font-semibold text-gray-900">{stat.value}</p>
                <p className="text-sm text-gray-500">{stat.change}</p>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default OrganizationSummary;