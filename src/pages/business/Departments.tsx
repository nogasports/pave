import React from 'react';
import { Building2, Users, Briefcase, Plus } from 'lucide-react';

const Departments: React.FC = () => {
  const departments = [
    {
      id: 1,
      name: 'Operations',
      head: 'Abebe Kebede',
      employees: 82,
      openPositions: 5,
      budget: '4.2M ETB',
    },
    {
      id: 2,
      name: 'Sales',
      head: 'Tigist Bekele',
      employees: 45,
      openPositions: 3,
      budget: '2.8M ETB',
    },
    {
      id: 3,
      name: 'IT',
      head: 'Dawit Haile',
      employees: 28,
      openPositions: 4,
      budget: '3.5M ETB',
    },
    {
      id: 4,
      name: 'HR',
      head: 'Sara Tekle',
      employees: 12,
      openPositions: 1,
      budget: '1.5M ETB',
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-900">Departments</h1>
        <button className="btn btn-primary">
          <Plus className="h-4 w-4 mr-2" />
          Add Department
        </button>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {departments.map((dept) => (
          <div key={dept.id} className="card">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <Building2 className="h-6 w-6 text-brand-600" />
                <h3 className="ml-2 text-lg font-medium text-gray-900">{dept.name}</h3>
              </div>
              <button className="text-gray-400 hover:text-gray-500">•••</button>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center text-sm">
                <Users className="h-4 w-4 text-gray-400 mr-2" />
                <span className="text-gray-500">{dept.employees} Employees</span>
              </div>
              
              <div className="flex items-center text-sm">
                <Briefcase className="h-4 w-4 text-gray-400 mr-2" />
                <span className="text-gray-500">{dept.openPositions} Open Positions</span>
              </div>

              <div className="pt-4 border-t border-gray-200">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Department Head</span>
                  <span className="font-medium text-gray-900">{dept.head}</span>
                </div>
                <div className="flex justify-between text-sm mt-2">
                  <span className="text-gray-500">Annual Budget</span>
                  <span className="font-medium text-gray-900">{dept.budget}</span>
                </div>
              </div>

              <div className="pt-4">
                <button className="btn btn-secondary w-full">View Details</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Departments;