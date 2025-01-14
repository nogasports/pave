import { getHolidays } from '../firebase/holidays';

// Date formatting utilities
export const formatDate = (date: Date | string): string => {
  const d = new Date(date);
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const year = d.getFullYear();
  return `${month}-${day}-${year}`;
};

export const parseDate = (dateStr: string): Date => {
  const [month, day, year] = dateStr.split('-').map(Number);
  return new Date(year, month - 1, day);
};

export const isWeekend = (date: Date): boolean => {
  const day = date.getDay();
  return day === 0 || day === 6; // 0 is Sunday, 6 is Saturday
};

export const addDays = (date: Date, days: number): Date => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};

export const calculateWorkingDays = async (startDate: Date, endDate: Date): Promise<number> => {
  let workingDays = 0;
  let currentDate = new Date(startDate);
  
  // Get holidays from Firebase
  const holidays = await getHolidays();
  const holidayDates = holidays.map(h => h.date.toISOString().split('T')[0]);

  while (currentDate <= endDate) {
    // Skip weekends and holidays
    if (!isWeekend(currentDate) && 
        !holidayDates.includes(currentDate.toISOString().split('T')[0])) {
      workingDays++;
    }
    currentDate = addDays(currentDate, 1);
  }
  
  return workingDays;
};