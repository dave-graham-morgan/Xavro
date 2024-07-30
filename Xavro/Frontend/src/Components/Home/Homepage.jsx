import React, { useState, useEffect } from 'react';
import CalendarComponent from '../Calendar/CalendarComponent.jsx';
import RoomSelectComponent from '../Room/RoomSelectComponent.jsx';
import BookingItemComponent from "../Booking/BookingItemComponent.jsx";
import 'bootstrap/dist/css/bootstrap.min.css';
import './Homepage.css'

const ParentComponent = () => {
    const [selectedRoomId, setSelectedRoomId] = useState('');
    const [availability, setAvailability] = useState([]);
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [timeslots, setTimeslots] = useState([]);

    const handleRoomChange = (roomId) => {
        setSelectedRoomId(roomId);
    };

    const handleDateChange = (date) => {
        setSelectedDate(date);
    };

    const fetchAvailability = async (roomId) => {
        if (!roomId) return;

        try {
            const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}api/rooms/${roomId}/availability`);
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            const data = await response.json();
            setAvailability(data);
        } catch (error) {
            console.error('Error fetching availability:', error);
        }
    };

    const fetchTimeslots = async (roomId, date) => {
        if (!roomId || !date) return;

        try {
            const dateString = date.toISOString().split('T')[0];
            const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}api/rooms/${roomId}/timeslots?date=${dateString}`);
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            const data = await response.json();
            setTimeslots(data);
        } catch (error) {
            console.error('Error fetching timeslots:', error);
        }
    };


    useEffect(() => {
        fetchAvailability(selectedRoomId);
    }, [selectedRoomId]);

    // update timeslots if user changes either the room or the date
    useEffect(() => {
        fetchTimeslots(selectedRoomId, selectedDate);
    }, [selectedRoomId, selectedDate]);

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
                <div className="col-md-6">
                    {selectedRoomId === '' ? (
                        <p></p>
                    ) : (
                        timeslots.length === 0 ? (
                            <p className="no-showtimes">Sorry there are no available showtimes for that date.</p>
                        ) : (
                            timeslots.map(timeslot => (
                                <BookingItemComponent
                                    key={timeslot.id}
                                    roomName={timeslot.roomName}
                                    startTime={timeslot.startTime}
                                    endTime={timeslot.endTime}
                                    showDate={selectedDate}
                                    isBooked={timeslot.isBooked}
                                />
                            ))
                        )
                    )}
                </div>
            </div>
        </div>
    );
};

export default ParentComponent;
