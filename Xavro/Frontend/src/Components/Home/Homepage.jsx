import React, { useState, useEffect } from 'react';
import CalendarComponent from '../Calendar/CalendarComponent.jsx';
import RoomSelectComponent from '../Room/RoomSelectComponent.jsx';
import 'bootstrap/dist/css/bootstrap.min.css';

const ParentComponent = () => {
    const [selectedRoomId, setSelectedRoomId] = useState('');
    const [availability, setAvailability] = useState([]);
    const [selectedDate, setSelectedDate] = useState(new Date());

    const handleRoomChange = (roomId) => {
        setSelectedRoomId(roomId);
    };

    const handleDateChange = (date) => {
        setSelectedDate(date);
    };

    useEffect(() => {
        const fetchAvailability = async () => {
            if (!selectedRoomId) return;

            try {
                console.log('going to call the endpoint:')
                const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}api/rooms/${selectedRoomId}/availability`);
                console.log('called endpoint')
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                const data = await response.json();
                setAvailability(data);
            } catch (error) {
                console.error('Error fetching availability:', error);
            }
        };

        fetchAvailability();
    }, [selectedRoomId]);

    return (
        <div className="parent-component container mt-5">
            <h1>Book Your Adventure</h1>
            <div className="row">
                <div className="col-12">
                    <RoomSelectComponent
                        selectedRoomId={selectedRoomId}
                        onRoomChange={handleRoomChange}
                    />
                </div>
                <div className="col-12">
                    <CalendarComponent
                        selectedDate={selectedDate}
                        onDateChange={handleDateChange}
                        availability={availability}
                    />
                </div>
            </div>
        </div>
    );
};

export default ParentComponent;
