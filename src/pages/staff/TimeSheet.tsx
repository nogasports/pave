import React from 'react';
import { Clock, Calendar, Check, AlertCircle } from 'lucide-react';

const TimeSheet: React.FC = () => {
  const currentWeek = [
    { date: 'Mon, Mar 18', hours: 8.5, status: 'Approved' },
    { date: 'Tue, Mar 19', hours: 8.0, status: 'Approved' },
    { date: 'Wed, Mar 20', hours: 7.5, status: 'Pending' },
    { date: 'Thu, Mar 21', hours: 8.0, status: 'Pending' },
    { date: 'Fri, Mar 22', hours: 6.5, status: 'Draft' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-900">Time Sheet</h1>
        <div className="flex space-x-3">
          <button className="btn btn-secondary">Previous Week</button>
          <button className="btn btn-primary">Submit Hours</button>
        </div>
      </div>

      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <Calendar className="h-5 w-5 text-gray-400 mr-2" />
            <span className="text-sm font-medium text-gray-900">Week of March 18, 2024</span>
          </div>
          <div className="flex items-center">
            <Clock className="h-5 w-5 text-gray-400 mr-2" />
            <span className="text-sm font-medium text-gray-900">Total Hours: 38.5</span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Hours
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
              {currentWeek.map((day, index) => (
                <tr key={index}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{day.date}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{day.hours} hours</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-none ${
                      day.status === 'Approved'
                        ? 'bg-green-100 text-green-800'
                        : day.status === 'Pending'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {day.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button className="text-brand-600 hover:text-brand-900">Edit</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="card">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Time Off Requests</h2>
          <div className="space-y-4">
            {[
              { type: 'Annual Leave', dates: 'Apr 15-19', status: 'Approved' },
              { type: 'Sick Leave', dates: 'Mar 10', status: 'Approved' },
              { type: 'Personal Leave', dates: 'May 5-6', status: 'Pending' },
            ].map((request, index) => (
              <div key={index} className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-900">{request.type}</p>
                  <p className="text-sm text-gray-500">{request.dates}</p>
                </div>
                <span className={`px-2 text-xs font-semibold rounded-none ${
                  request.status === 'Approved'
                    ? 'bg-green-100 text-green-800'
                    : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {request.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Overtime Summary</h2>
          <div className="space-y-4">
            {[
              { month: 'March 2024', hours: 12.5, status: 'Pending Approval' },
              { month: 'February 2024', hours: 8.0, status: 'Approved' },
              { month: 'January 2024', hours: 10.0, status: 'Approved' },
            ].map((overtime, index) => (
              <div key={index} className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-900">{overtime.month}</p>
                  <p className="text-sm text-gray-500">{overtime.hours} hours</p>
                </div>
                <span className="text-sm text-gray-500">{overtime.status}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TimeSheet;