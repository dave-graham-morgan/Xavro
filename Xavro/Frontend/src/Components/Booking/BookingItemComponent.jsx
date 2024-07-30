import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import './BookingItemComponent.css'; // Custom styles

const BookingItemComponent = ({ roomName, startTime, endTime, showDate, isBooked }) => {
    const formattedShowDate = new Date(showDate).toLocaleDateString([], { month: 'long', day: 'numeric', year: 'numeric' });
    return (
        <div className={`booking-item card ${isBooked ? 'booked' : ''}`}>
            <div className="card-body">
                <div className="card-title-container">
                    <h5 className="card-title">{roomName}</h5>
                    <span className="show-date">{formattedShowDate}</span>
                </div>
                <div className="showtime-button-container">
                    <p className="card-text">Showtime: {startTime} - {endTime}</p>
                    <button className="btn btn-sm btn-primary" disabled={isBooked}>
                        {isBooked ? ' Booked ' : 'Book Now'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default BookingItemComponent;
