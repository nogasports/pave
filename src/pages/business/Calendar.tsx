import React from 'react';
import CalendarView from '../../components/calendar/CalendarView';

const BusinessCalendar: React.FC = () => {
  const handleDateSelect = (date: Date) => {
    console.log('Selected date:', date);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-900">Calendar</h1>
      </div>

      <CalendarView onDateSelect={handleDateSelect} />
    </div>
  );
};

export default BusinessCalendar;