import React from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import './CalendarComponent.css'; // Custom styles

const CalendarComponent = ({ selectedDate, onDateChange, availability }) => {
    const tileClassName = ({ date, view }) => {
        const dateString = date.toISOString().split('T')[0];

        if (view === 'month') {
            // Disable past dates
            if (date < new Date().setHours(0, 0, 0, 0)) {
                return 'disabled-date';
            }

            // Highlight the selected date
            if (date.toDateString() === selectedDate.toDateString()) {
                return 'selected-date';
            }

            // Disable dates with no availability
            if (!availability.includes(dateString)) {
                return 'disabled-date';
            }else {
                return 'available-date';
            }

        }
    };

    return (
        <div className="calendar-container">
            <Calendar
                onChange={onDateChange}
                value={selectedDate}
                tileClassName={tileClassName}
                showNeighboringMonth={false} // Hide previous and next month's days
            />
        </div>
    );
};

export default CalendarComponent;
