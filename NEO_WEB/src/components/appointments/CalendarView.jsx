// components/appointments/CalendarView.jsx
import React, { useState } from 'react';
import {
  RiArrowLeftSLine,
  RiArrowRightSLine,
  RiCalendarLine,
  RiTimeLine,
  RiUser3Line,
} from 'react-icons/ri';
import Badge from '../ui/Badge';

export default function CalendarView({ appointments = [], onSelectAppointment, onCreateAppointment }) {
  const [view, setView] = useState('month'); // 'month' | 'week' | 'day'
  const [currentDate, setCurrentDate] = useState(new Date());

  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  // Month navigation
  const prevPeriod = () => {
    const d = new Date(currentDate);
    if (view === 'month') d.setMonth(d.getMonth() - 1);
    else if (view === 'week') d.setDate(d.getDate() - 7);
    else d.setDate(d.getDate() - 1);
    setCurrentDate(d);
  };

  const nextPeriod = () => {
    const d = new Date(currentDate);
    if (view === 'month') d.setMonth(d.getMonth() + 1);
    else if (view === 'week') d.setDate(d.getDate() + 7);
    else d.setDate(d.getDate() + 1);
    setCurrentDate(d);
  };

  const todayPeriod = () => setCurrentDate(new Date());

  // Generate Month Grid
  const getMonthDays = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    
    const days = [];
    const startDayOfWeek = firstDay.getDay();

    // Previous month padding
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    for (let i = startDayOfWeek - 1; i >= 0; i--) {
      days.push({
        date: new Date(year, month - 1, prevMonthLastDay - i),
        isCurrentMonth: false,
      });
    }

    // Current month days
    for (let i = 1; i <= lastDay.getDate(); i++) {
      days.push({
        date: new Date(year, month, i),
        isCurrentMonth: true,
      });
    }

    // Next month padding
    const totalCells = Math.ceil(days.length / 7) * 7;
    const remaining = totalCells - days.length;
    for (let i = 1; i <= remaining; i++) {
      days.push({
        date: new Date(year, month + 1, i),
        isCurrentMonth: false,
      });
    }

    return days;
  };

  const formatDateStr = (d) => {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const isToday = (d) => {
    const today = new Date();
    return (
      d.getDate() === today.getDate() &&
      d.getMonth() === today.getMonth() &&
      d.getFullYear() === today.getFullYear()
    );
  };

  const monthDays = getMonthDays();

  // Filter appointments for a given date string
  const getAptsForDate = (dateStr) => {
    return appointments.filter(a => (a.appointmentDate || a.date) === dateStr);
  };

  return (
    <div className="cal-wrapper">
      {/* Calendar Header & Controls */}
      <div className="cal-header">
        <button className="cal-nav-btn" onClick={prevPeriod} title="Previous">
          <RiArrowLeftSLine size={20} />
        </button>
        <button className="btn btn-outline btn-sm" onClick={todayPeriod}>
          Today
        </button>
        <button className="cal-nav-btn" onClick={nextPeriod} title="Next">
          <RiArrowRightSLine size={20} />
        </button>

        <h3 className="cal-title">
          {currentDate.toLocaleDateString('en-US', {
            month: 'long',
            year: 'numeric',
            ...(view === 'day' ? { day: 'numeric', weekday: 'short' } : {}),
          })}
        </h3>

        <div className="cal-view-toggle">
          <button
            className={`cal-view-btn ${view === 'month' ? 'active' : ''}`}
            onClick={() => setView('month')}
          >
            Month
          </button>
          <button
            className={`cal-view-btn ${view === 'week' ? 'active' : ''}`}
            onClick={() => setView('week')}
          >
            Week
          </button>
          <button
            className={`cal-view-btn ${view === 'day' ? 'active' : ''}`}
            onClick={() => setView('day')}
          >
            Day
          </button>
        </div>
      </div>

      {/* MONTH VIEW */}
      {view === 'month' && (
        <div>
          <div className="cal-grid-month">
            {daysOfWeek.map((day) => (
              <div key={day} className="cal-day-header">
                {day}
              </div>
            ))}
          </div>
          <div className="cal-grid-month">
            {monthDays.map((cell, idx) => {
              const dateStr = formatDateStr(cell.date);
              const dayApts = getAptsForDate(dateStr);
              return (
                <div
                  key={idx}
                  className={`cal-day-cell ${cell.isCurrentMonth ? '' : 'other-month'} ${
                    isToday(cell.date) ? 'today' : ''
                  }`}
                  onClick={() => onCreateAppointment && onCreateAppointment(dateStr)}
                >
                  <div className="cal-day-num">{cell.date.getDate()}</div>
                  {dayApts.slice(0, 3).map((apt) => (
                    <div
                      key={apt.id || apt.appointmentId}
                      className={`cal-event-chip ${apt.status || 'default'}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectAppointment && onSelectAppointment(apt);
                      }}
                      title={`${apt.timeSlot || apt.time || ''} - ${apt.patientName || apt.patient}`}
                    >
                      {apt.timeSlot ? `${apt.timeSlot.slice(0, 5)} ` : ''}
                      {apt.patientName || apt.patient}
                    </div>
                  ))}
                  {dayApts.length > 3 && (
                    <div className="cal-more-chip">
                      +{dayApts.length - 3} more
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* DAY VIEW */}
      {view === 'day' && (
        <div className="cal-day-view">
          <div className="cal-day-view-header">
            Appointments for {currentDate.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
          </div>
          {[
            '08:00 AM', '09:00 AM', '10:00 AM', '11:00 AM', '12:00 PM',
            '01:00 PM', '02:00 PM', '03:00 PM', '04:00 PM', '05:00 PM'
          ].map((timeSlot) => {
            const dateStr = formatDateStr(currentDate);
            const slotApts = getAptsForDate(dateStr).filter(a => (a.timeSlot || a.time || '').includes(timeSlot.slice(0, 2)));
            return (
              <div key={timeSlot} className="cal-day-slot">
                <div className="cal-day-slot-time">{timeSlot}</div>
                <div className="cal-day-slot-events">
                  {slotApts.length === 0 ? (
                    <div
                      style={{ fontSize: '11px', color: 'var(--color-text-secondary)', cursor: 'pointer', padding: '4px' }}
                      onClick={() => onCreateAppointment && onCreateAppointment(dateStr, timeSlot)}
                    >
                      + Click to book slot
                    </div>
                  ) : (
                    slotApts.map(apt => (
                      <div
                        key={apt.id || apt.appointmentId}
                        className={`cal-day-event cal-event-chip ${apt.status || 'default'}`}
                        onClick={() => onSelectAppointment && onSelectAppointment(apt)}
                      >
                        <RiUser3Line /> <strong>{apt.patientName || apt.patient}</strong> · {apt.doctorName || apt.doctor} ({apt.type || 'Consultation'})
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* WEEK VIEW */}
      {view === 'week' && (
        <div className="cal-week-grid">
          <div className="cal-week-time-col">
            <div className="cal-week-day-header">Time</div>
            {['09:00', '10:00', '11:00', '12:00', '14:00', '15:00', '16:00'].map(t => (
              <div key={t} className="cal-week-time-slot">{t}</div>
            ))}
          </div>
          {daysOfWeek.map((dayName, dayIdx) => {
            const startOfWeek = new Date(currentDate);
            startOfWeek.setDate(currentDate.getDate() - currentDate.getDay() + dayIdx);
            const dateStr = formatDateStr(startOfWeek);
            const dayApts = getAptsForDate(dateStr);
            return (
              <div key={dayName} className="cal-week-day-col">
                <div className={`cal-week-day-header ${isToday(startOfWeek) ? 'today' : ''}`}>
                  {dayName} {startOfWeek.getDate()}
                </div>
                {['09:00', '10:00', '11:00', '12:00', '14:00', '15:00', '16:00'].map(t => (
                  <div key={t} className="cal-week-slot">
                    {dayApts.filter(a => (a.timeSlot || a.time || '').includes(t.slice(0, 2))).map(apt => (
                      <div
                        key={apt.id || apt.appointmentId}
                        className={`cal-week-event cal-event-chip ${apt.status || 'default'}`}
                        onClick={() => onSelectAppointment && onSelectAppointment(apt)}
                      >
                        {apt.patientName || apt.patient}
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
