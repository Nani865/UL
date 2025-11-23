import { DateItem } from '../types';

export const formatDateDisplay = (date: Date): string => {
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
};

export const formatDateId = (date: Date): string => {
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${year}-${month}-${day}`;
};

export const generateDateList = (): DateItem[] => {
  const startDate = new Date(2025, 10, 15); // Month is 0-indexed: 10 = November
  const endDate = new Date(2026, 1, 26);    // Month is 0-indexed: 1 = February

  const dates: DateItem[] = [];
  const currentDate = new Date(startDate);

  while (currentDate <= endDate) {
    dates.push({
      id: formatDateId(currentDate),
      dateObject: new Date(currentDate),
      formattedDate: formatDateDisplay(currentDate),
      label: currentDate.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })
    });
    // Add 1 day
    currentDate.setDate(currentDate.getDate() + 1);
  }

  return dates;
};

export const isSameDay = (d1: Date, d2: Date): boolean => {
  return (
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate()
  );
};
