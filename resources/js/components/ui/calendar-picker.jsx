import { useState, useRef, useEffect } from 'react';
import { ChevronDown, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { formatDateShort, getCorrectedDate } from '@/utils/dateUtils';

export default function CalendarPicker({ value, onChange, placeholder = 'Select date' }) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(value ? new Date(value) : null);
  const popoverRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (value) {
      setSelectedDate(new Date(value));
    } else {
      setSelectedDate(null);
    }
  }, [value]);

  const formatDate = (date) => {
    if (!date) return '';
    return formatDateShort(date);
  };

  const formatDateISO = (date) => {
    if (!date) return '';
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const getDaysInMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const generateCalendarDays = () => {
    const daysInMonth = getDaysInMonth(currentMonth);
    const firstDay = getFirstDayOfMonth(currentMonth);
    const daysInPrevMonth = getDaysInMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
    const days = [];

    for (let i = firstDay - 1; i >= 0; i--) {
      days.push({
        day: daysInPrevMonth - i,
        isCurrentMonth: false,
        date: new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, daysInPrevMonth - i),
      });
    }

    for (let i = 1; i <= daysInMonth; i++) {
      days.push({
        day: i,
        isCurrentMonth: true,
        date: new Date(currentMonth.getFullYear(), currentMonth.getMonth(), i),
      });
    }

    const remainingDays = 42 - days.length;
    for (let i = 1; i <= remainingDays; i++) {
      days.push({
        day: i,
        isCurrentMonth: false,
        date: new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, i),
      });
    }

    return days;
  };

  const isToday = (date) => {
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  const isSelected = (date) => {
    return (
      selectedDate &&
      date.getDate() === selectedDate.getDate() &&
      date.getMonth() === selectedDate.getMonth() &&
      date.getFullYear() === selectedDate.getFullYear()
    );
  };

  const handleSelectDate = (date) => {
    setSelectedDate(date);
    onChange(formatDateISO(date));
    setIsOpen(false);
  };

  const handleToday = () => {
    const today = new Date();
    setSelectedDate(today);
    setCurrentMonth(new Date(today));
    onChange(formatDateISO(today));
    setIsOpen(false);
  };

  const handleClear = () => {
    setSelectedDate(null);
    onChange('');
    setIsOpen(false);
  };

  const handlePrevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (popoverRef.current && !popoverRef.current.contains(event.target) && !inputRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  const calendarDays = generateCalendarDays();
  const monthYearString = getCorrectedDate(currentMonth).toLocaleDateString('en-US', { month: 'long', year: 'numeric', timeZone: 'Asia/Manila' });
  const weekDays = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

  return (
    <div className="relative w-full">
      <div
        ref={inputRef}
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg bg-white cursor-pointer hover:border-gray-400 transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
      >
        <span className={selectedDate ? 'text-gray-900 font-medium' : 'text-gray-500'}>
          {selectedDate ? formatDate(selectedDate) : placeholder}
        </span>
        <div className="flex items-center gap-2">
          {selectedDate && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleClear();
              }}
              className="p-1 text-gray-400 hover:text-gray-600 transition-colors rounded hover:bg-gray-100"
              type="button"
            >
              <X size={16} />
            </button>
          )}
          <ChevronDown
            size={18}
            className={`text-gray-500 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
          />
        </div>
      </div>

      {isOpen && (
        <div
          ref={popoverRef}
          className="absolute top-full left-0 mt-1 z-50 bg-white rounded-lg shadow-md border border-gray-200 p-2 animate-in fade-in zoom-in-95 duration-200"
          style={{ width: '240px' }}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-gray-900">{monthYearString}</span>
            <div className="flex items-center gap-0.5">
              <button
                onClick={handlePrevMonth}
                className="p-1 text-gray-600 hover:bg-gray-100 rounded transition-all"
                type="button"
              >
                <ChevronLeft size={14} />
              </button>
              <button
                onClick={handleNextMonth}
                className="p-1 text-gray-600 hover:bg-gray-100 rounded transition-all"
                type="button"
              >
                <ChevronRight size={14} />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-0.5 mb-1">
            {weekDays.map((day) => (
              <div key={day} className="text-center text-[10px] font-medium text-gray-500 h-5 flex items-center justify-center">
                {day}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-0.5 mb-2">
            {calendarDays.map((dayObj, idx) => {
              const isSelectedDate = isSelected(dayObj.date);
              const isTodayDate = isToday(dayObj.date);
              const isCurrentMonth = dayObj.isCurrentMonth;

              return (
                <button
                  key={idx}
                  onClick={() => handleSelectDate(dayObj.date)}
                  type="button"
                  className={`
                    h-7 rounded text-[11px] font-semibold transition-all
                    flex items-center justify-center
                    ${
                      isSelectedDate
                        ? 'bg-blue-600 text-white shadow-sm hover:bg-blue-700'
                        : isCurrentMonth
                        ? `text-gray-900 hover:bg-gray-100 ${isTodayDate ? 'ring-1 ring-blue-400' : ''}`
                        : 'text-gray-400 hover:bg-gray-50'
                    }
                  `}
                >
                  {dayObj.day}
                </button>
              );
            })}
          </div>

          <div className="h-px bg-gray-200 mb-1.5" />

          <div className="flex items-center justify-between">
            <button
              onClick={handleClear}
              type="button"
              className="text-[11px] font-semibold text-gray-600 hover:text-gray-900 px-2 py-1 rounded transition-all hover:bg-gray-100"
            >
              Clear
            </button>
            <button
              onClick={handleToday}
              type="button"
              className="text-[11px] font-semibold text-blue-600 hover:text-blue-700 px-2 py-1 rounded transition-all hover:bg-blue-50"
            >
              Today
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
