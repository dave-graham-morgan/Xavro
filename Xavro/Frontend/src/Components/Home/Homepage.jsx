import React, { useState, useEffect } from 'react';
import CalendarComponent from '../Calendar/CalendarComponent.jsx';
import './Homepage.css'

const Homepage = () => {
    const [date, setDate] = useState(new Date());
    const [availability, setAvailability] = useState([]);

    useEffect(() => {
        // Fetch availability data from the backend or set manually for testing
        const fetchAvailability = async () => {
            const data = [
                '2024-07-27',
                '2024-08-02',
                '2024-08-03',
                '2024-08-04'
            ];
            setAvailability(data);
        };

        fetchAvailability();
    }, []);

    return (
        <div>
            <div className="container homepage-calendar-container">
                <CalendarComponent
                    selectedDate={date}
                    onDateChange={setDate}
                    availability={availability}
                />
            </div>

        </div>
    );
};

export default Homepage;