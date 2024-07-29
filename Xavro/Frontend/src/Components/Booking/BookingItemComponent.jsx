import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import './BookingItemComponent.css'; // Custom styles

const BookingItemComponent = ({ roomName, startTime, endTime, showDate }) => {
    const formattedStartTime = new Date(startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const formattedEndTime = new Date(endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const formattedShowDate = new Date(showDate).toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });

    return (
        <div className="booking-item card mb-3">
            <div className="card-body">
                <h5 className="card-title">{roomName}</h5>
                <p className="card-text">Show Date: {formattedShowDate}</p>
                <p className="card-text">Start Time: {formattedStartTime}</p>
                <p className="card-text">End Time: {formattedEndTime}</p>
                <button className="btn btn-primary">Book Now</button>
            </div>
        </div>
    );
};

export default BookingItemComponent;
