import React, { useState } from 'react';

interface CustomCalendarProps {
  selectedDate: Date | null;
  onDateChange: (date: Date | null) => void;
  className?: string;
}

const CustomCalendar: React.FC<CustomCalendarProps> = ({ 
  selectedDate, 
  onDateChange,
  className = ''
}) => {
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [hoveredDate, setHoveredDate] = useState<Date | null>(null);

  // Get the first day of the month
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
  // Get the last day of the month
  const lastDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
  // Get the day of the week for the first day (0 = Sunday, 1 = Monday, etc.)
  const firstDayOfWeek = firstDayOfMonth.getDay();
  // Get today's date
  const today = new Date();

  // Generate the days for the calendar
  const days = [];
  
  // Previous month days
  const prevMonthLastDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 0).getDate();
  for (let i = firstDayOfWeek - 1; i >= 0; i--) {
    const day = prevMonthLastDay - i;
    const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, day);
    days.push({ date, isCurrentMonth: false });
  }
  
  // Current month days
  for (let i = 1; i <= lastDayOfMonth.getDate(); i++) {
    const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), i);
    days.push({ date, isCurrentMonth: true });
  }
  
  // Next month days
  const remainingDays = 42 - days.length; // 6 rows x 7 days
  for (let i = 1; i <= remainingDays; i++) {
    const date = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, i);
    days.push({ date, isCurrentMonth: false });
  }

  // Navigation functions
  const goToPreviousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const goToToday = () => {
    const today = new Date();
    setCurrentDate(today);
    onDateChange(today);
  };

  const clearDate = () => {
    onDateChange(null);
  };

  // Format month and year for display
  const formatMonthYear = (date: Date) => {
    return date.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });
  };

  // Check if two dates are the same day
  const isSameDay = (date1: Date | null, date2: Date | null) => {
    if (!date1 || !date2) return false;
    return date1.getDate() === date2.getDate() &&
           date1.getMonth() === date2.getMonth() &&
           date1.getFullYear() === date2.getFullYear();
  };

  // Check if a date is today
  const isToday = (date: Date) => {
    return date.getDate() === today.getDate() &&
           date.getMonth() === today.getMonth() &&
           date.getFullYear() === today.getFullYear();
  };

  // Check if a day is weekend (Saturday or Sunday)
  const isWeekend = (date: Date) => {
    const day = date.getDay();
    return day === 0 || day === 6; // 0 = Sunday, 6 = Saturday
  };

  return (
    <div className={`bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden ${className}`}>
      {/* Calendar Header */}
      <div className="bg-gray-50 p-4 flex items-center justify-between">
        <button 
          onClick={goToPreviousMonth}
          className="p-2 rounded-lg hover:bg-gray-100 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-green-500"
          aria-label="Mes anterior"
        >
          <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        
        <h3 className="text-lg font-semibold text-gray-800 capitalize">
          {formatMonthYear(currentDate)}
        </h3>
        
        <button 
          onClick={goToNextMonth}
          className="p-2 rounded-lg hover:bg-gray-100 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-green-500"
          aria-label="Mes siguiente"
        >
          <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* Day Headers */}
      <div className="grid grid-cols-7 py-2 px-1">
        {['Do', 'Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sa'].map((day, index) => (
          <div 
            key={day} 
            className={`text-center text-xs font-bold uppercase tracking-wider ${
              index === 0 || index === 6 
                ? 'text-red-500' // Weekend color (Sunday and Saturday)
                : 'text-gray-500' // Weekday color
            }`}
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Days */}
      <div className="grid grid-cols-7 gap-1 p-2">
        {days.map((dayObj, index) => {
          const { date, isCurrentMonth } = dayObj;
          const isSelected = isSameDay(date, selectedDate);
          const isTodayDate = isToday(date);
          const isHovered = isSameDay(date, hoveredDate);
          const isWeekendDay = isWeekend(date);
          
          return (
            <button
              key={index}
              onClick={() => onDateChange(date)}
              onMouseEnter={() => setHoveredDate(date)}
              onMouseLeave={() => setHoveredDate(null)}
              className={`
                h-10 w-10 rounded-full flex items-center justify-center text-sm font-medium transition-all duration-200
                ${isCurrentMonth ? 'text-gray-800' : 'text-gray-400'}
                ${isSelected 
                  ? 'bg-green-500 text-white' 
                  : isTodayDate && !isSelected 
                    ? 'bg-blue-500 text-white' 
                    : !isSelected && isHovered 
                      ? 'bg-gray-100' 
                      : 'bg-transparent'}
                ${!isCurrentMonth ? 'opacity-50' : ''}
                focus:outline-none focus:ring-2 focus:ring-green-300
              `}
            >
              {date.getDate()}
            </button>
          );
        })}
      </div>

      {/* Action Buttons */}
      <div className="flex justify-between p-3 bg-gray-50 border-t border-gray-200">
        <button
          onClick={clearDate}
          className="px-3 py-1.5 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-green-300"
        >
          Borrar
        </button>
        <button
          onClick={goToToday}
          className="px-3 py-1.5 text-xs font-medium text-green-700 bg-white border border-green-300 rounded-lg hover:bg-green-50 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-green-300"
        >
          Hoy
        </button>
      </div>
    </div>
  );
};

export default CustomCalendar;