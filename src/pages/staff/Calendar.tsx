import React from 'react';
import CalendarView from '../../components/calendar/CalendarView';

const StaffCalendar: React.FC = () => {
  const handleDateSelect = (date: Date) => {
    console.log('Selected date:', date);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-900">My Calendar</h1>
      </div>

      <CalendarView onDateSelect={handleDateSelect} />
    </div>
  );
};

export default StaffCalendar;