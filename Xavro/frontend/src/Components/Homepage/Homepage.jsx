import React, { useState, useEffect } from 'react';
import CalendarComponent from '../Calendar/CalendarComponent.jsx';
import RoomSelectComponent from '../Room/RoomSelectComponent.jsx';
import BookingItemComponent from "../Booking/BookingItemComponent.jsx";
import ModalComponent from "../Modal/ModalComponent.jsx";
import 'bootstrap/dist/css/bootstrap.min.css';
import './Homepage.css'

const ParentComponent = () => {
    const [selectedRoomId, setSelectedRoomId] = useState('');
    const [availability, setAvailability] = useState([]);
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [timeslots, setTimeslots] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [selectedTimeslot, setSelectedTimeslot] = useState(null);

    const handleRoomChange = (roomId) => {
        setSelectedRoomId(roomId);
    };

    const handleDateChange = (date) => {
        setSelectedDate(date);
    };

    const handleBookNow = (timeslot) => {
        setSelectedTimeslot({...timeslot, showDate: selectedDate.toISOString().split('T')[0] });
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setSelectedTimeslot(null);
    };

    const handleConfirmBooking = async (customer, timeslotDetails, guestCount) => {
        try {
            // If customer has no ID, we need to create the customer first
            if (!customer.id) {
                const createCustomerResponse = await fetch(`${import.meta.env.VITE_API_BASE_URL}api/customers`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(customer)
                });
                console.log('done creating customer')
                if (!createCustomerResponse.ok) {
                    throw new Error('Failed to create customer');
                }

                // Update customer with the response from the server
                const createdCustomer = await createCustomerResponse.json();
                customer.id = createdCustomer.id;
            }
            // Check if customer.id is now set
            if (!customer.id) {
                throw new Error('Customer ID is not set after creation');
            }

            const bookingDate = new Date().toISOString().split('T')[0];
            const orderId = generateOrderId(customer.id); //TODO: this has to be more systematic

            // Create the booking with the customer's ID
            const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}api/bookings`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    customer_id: customer.id,
                    room_id: selectedRoomId,
                    guest_count: guestCount,
                    order_id: orderId,
                    booking_date: bookingDate,
                    show_date: timeslotDetails.showDate,
                    show_timeslot: timeslotDetails.timeslot
                })
            });

            if (response.ok) {
                alert('Booking confirmed!');
                // Update the timeslot to reflect the booking
                setTimeslots(prevTimeslots =>
                    prevTimeslots.map(ts =>
                        ts.id === timeslotDetails.id
                            ? { ...ts, isBooked: true }
                            : ts
                    )
                );
                handleCloseModal();
            } else {
                alert('Failed to book. Please try again.');
            }
        } catch (error) {
            console.error('Error confirming booking:', error);
            alert('Error confirming booking. Please try again.');
        }
    };

    const generateOrderId = (userId) => {
        const now = new Date();
        const datePart = now.toISOString().slice(0, 10).replace(/-/g, ''); // YYYYMMDD
        const timePart = now.toISOString().slice(11, 19).replace(/:/g, ''); // HHMMSS
        return `${userId}-${datePart}-${timePart}`;
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
            <h2>url: {import.meta.env.VITE_API_BASE_URL}</h2>
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
                            <div className="card no-showtimes">
                                <div className="card-body">Sorry there are no available showtimes for that date.</div>
                            </div>
                        ) : (
                            timeslots.map((timeslot) => (
                                    <BookingItemComponent
                                        key={timeslot.id}
                                        roomName={timeslot.roomName}
                                        startTime={timeslot.startTime}
                                        endTime={timeslot.endTime}
                                        showDate={selectedDate}
                                        isBooked={timeslot.isBooked}
                                        onBookNow={() => handleBookNow(timeslot)}
                                    />
                            ))
                        )
                    )}
                </div>
            </div>
            {selectedTimeslot && (
                <ModalComponent
                    show={showModal}
                    handleClose={handleCloseModal}
                    handleConfirm={handleConfirmBooking}
                    timeslotDetails={selectedTimeslot}
                />
            )}
        </div>
    );
};

export default ParentComponent;
