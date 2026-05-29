import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Info } from 'lucide-react';

const monthsList = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

const daysOfWeek = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

export default function CalendarGrid({ responseData, year = 2026 }) {
  const [currentMonthIndex, setCurrentMonthIndex] = useState(0); // 0-11
  const [hoveredDay, setHoveredDay] = useState(null);

  // Check if response is from /v1/calendar (which is a 365/366 element list) or /v1/holidays
  const isCalendarEndpoint = responseData && Array.isArray(responseData.data) && responseData.data.length > 50;
  const rawHolidays = isCalendarEndpoint ? [] : (responseData?.data || []);
  const rawCalendar = isCalendarEndpoint ? (responseData?.data || []) : [];

  // Index holidays/calendar items for O(1) lookup
  const holidaysMap = {};
  rawHolidays.forEach(h => {
    if (!holidaysMap[h.date]) holidaysMap[h.date] = [];
    holidaysMap[h.date].push(h);
  });

  const calendarMap = {};
  rawCalendar.forEach(c => {
    calendarMap[c.date] = c;
  });

  // Helper to generate days for a given month
  const getDaysInMonth = (monthIdx, yr) => {
    const date = new Date(yr, monthIdx, 1);
    const startDay = date.getDay(); // 0 is Sunday, etc.
    const numDays = new Date(yr, monthIdx + 1, 0).getDate();
    return { startDay, numDays };
  };

  const { startDay, numDays } = getDaysInMonth(currentMonthIndex, year);

  // Create grid cells (padding for empty starting days + actual days)
  const cells = [];
  for (let i = 0; i < startDay; i++) {
    cells.push({ isEmpty: true });
  }

  for (let dayNum = 1; dayNum <= numDays; dayNum++) {
    const pad = (n) => String(n).padStart(2, '0');
    const dateStr = `${year}-${pad(currentMonthIndex + 1)}-${pad(dayNum)}`;
    const d = new Date(year, currentMonthIndex, dayNum);
    const isWeekendLocal = d.getDay() === 0 || d.getDay() === 6;

    let isHoliday = false;
    let isWeekend = isWeekendLocal;
    let holidayName = null;
    let holidayType = null;

    if (isCalendarEndpoint) {
      const calDay = calendarMap[dateStr];
      if (calDay) {
        isHoliday = calDay.is_holiday;
        isWeekend = calDay.is_weekend;
        holidayName = calDay.holiday_name;
        holidayType = calDay.holiday_type;
      }
    } else {
      const matchingHolidays = holidaysMap[dateStr];
      if (matchingHolidays && matchingHolidays.length > 0) {
        isHoliday = true;
        holidayName = matchingHolidays.map(h => h.name).join(' / ');
        holidayType = matchingHolidays.map(h => h.type).join(' / ');
      }
    }

    cells.push({
      isEmpty: false,
      dayNum,
      dateStr,
      isWeekend,
      isHoliday,
      holidayName,
      holidayType
    });
  }

  // Get color styles based on holiday classification
  const getHolidayColorClass = (type) => {
    if (!type) return "";
    const lowerType = type.toLowerCase();
    if (lowerType.includes("gazetted")) {
      return "bg-red-500/20 border-red-500/40 text-red-300 hover:bg-red-500/35";
    }
    if (lowerType.includes("restricted")) {
      return "bg-amber-500/20 border-amber-500/40 text-amber-300 hover:bg-amber-500/35";
    }
    return "bg-blue-500/20 border-blue-500/40 text-blue-300 hover:bg-blue-500/35";
  };

  const getHolidayIndicatorColor = (type) => {
    if (!type) return "bg-slate-500";
    const lowerType = type.toLowerCase();
    if (lowerType.includes("gazetted")) return "bg-red-500";
    if (lowerType.includes("restricted")) return "bg-amber-500";
    return "bg-blue-500";
  };

  return (
    <div className="w-full bg-[#0e0e15]/60 border border-white/10 rounded-xl p-5 flex flex-col h-full select-none shadow-lg backdrop-blur-sm">
      {/* Calendar Header with navigation */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-display font-bold text-lg text-slate-200">
          {monthsList[currentMonthIndex]} {year}
        </h3>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setCurrentMonthIndex(idx => (idx === 0 ? 11 : idx - 1))}
            className="p-1.5 rounded-lg border border-white/5 bg-white/5 hover:bg-white/10 text-slate-400 hover:text-slate-200 transition-colors"
          >
            <ChevronLeft size={16} />
          </button>
          <button
            onClick={() => setCurrentMonthIndex(idx => (idx === 11 ? 0 : idx + 1))}
            className="p-1.5 rounded-lg border border-white/5 bg-white/5 hover:bg-white/10 text-slate-400 hover:text-slate-200 transition-colors"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {/* Days of week header */}
      <div className="grid grid-cols-7 gap-1 text-center mb-2">
        {daysOfWeek.map((d, i) => (
          <div key={d} className={`text-xs font-bold py-1 uppercase tracking-wider ${i === 0 || i === 6 ? 'text-red-400/70' : 'text-slate-500'}`}>
            {d}
          </div>
        ))}
      </div>

      {/* Grid of days */}
      <div className="grid grid-cols-7 gap-1.5 flex-1 items-stretch min-h-[220px]">
        {cells.map((cell, idx) => {
          if (cell.isEmpty) {
            return <div key={`empty-${idx}`} />;
          }

          const { dayNum, dateStr, isWeekend, isHoliday, holidayName, holidayType } = cell;

          return (
            <div
              key={dateStr}
              onMouseEnter={() => isHoliday && setHoveredDay(cell)}
              onMouseLeave={() => setHoveredDay(null)}
              className={`relative flex flex-col items-center justify-center py-2.5 rounded-lg text-xs font-medium border border-transparent transition-all duration-150 ${
                isHoliday
                  ? getHolidayColorClass(holidayType)
                  : isWeekend
                    ? 'bg-slate-900/40 text-slate-500 border-white/5'
                    : 'bg-white/[0.02] hover:bg-white/5 text-slate-300'
              }`}
            >
              <span>{dayNum}</span>
              {isHoliday && (
                <span className={`absolute bottom-1 w-1.5 h-1.5 rounded-full ${getHolidayIndicatorColor(holidayType)}`} />
              )}
            </div>
          );
        })}
      </div>

      {/* Tooltip detail block */}
      <div className="mt-4 pt-3 border-t border-white/5 min-h-[50px] flex items-center justify-center text-center">
        {hoveredDay ? (
          <div className="text-xs text-slate-300 animate-fadeIn">
            <p className="font-bold text-saffron-400">{hoveredDay.holidayName}</p>
            <p className="text-[10px] text-slate-500 uppercase tracking-widest mt-0.5 font-semibold">
              {hoveredDay.holidayType.replace(/_/g, ' ')}
            </p>
          </div>
        ) : (
          <div className="text-xs text-slate-500 flex items-center gap-1.5">
            <Info size={12} />
            <span>Hover over marked dates to see holiday details</span>
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="mt-2 flex items-center justify-center gap-4 text-[10px] text-slate-400 border-t border-white/5 pt-3">
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-md bg-red-500/20 border border-red-500/40" />
          <span>Gazetted</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-md bg-amber-500/20 border border-amber-500/40" />
          <span>Restricted</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-md bg-blue-500/20 border border-blue-500/40" />
          <span>Observance</span>
        </div>
      </div>
    </div>
  );
}
