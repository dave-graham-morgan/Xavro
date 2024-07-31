import React from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import './CalendarComponent.css'; // Custom styles

const CalendarComponent = ({ selectedDate, onDateChange, availability }) => {
    const tileClassName = ({ date, view }) => {
        const dateString = date.toISOString().split('T')[0];

        if (view === 'month') {
            // Highlight the selected date
            if (date.toDateString() === selectedDate.toDateString() && date.toDateString() === new Date().toDateString()) {
                return 'today-selected';
            } else if (date.toDateString() === selectedDate.toDateString()) {
                return 'selected-date';
            }

            // Disable past dates
            if (date < new Date().setHours(0, 0, 0, 0)) {
                return 'past-date';
            }

            // Underline today's date, make sure its disabled if there is no availability
            if (date.toDateString() === new Date().toDateString() && !availability.includes(dateString)) {
                return 'today-date disabled-date';
            } else if (date.toDateString() === new Date().toDateString()) {
                return 'today-date';
            }

            // Disable dates with no availability
            if (!availability.includes(dateString)) {
                return 'disabled-date';
            } else {
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
