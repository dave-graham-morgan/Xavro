import React, { useState, useEffect } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';

const ModalComponent = ({ show, handleClose, handleConfirm, timeslotDetails }) => {
    const [email, setEmail] = useState('');
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [guestCount, setGuestCount] = useState('');
    const [customer, setCustomer] = useState(null);

    useEffect(() => {
        if (customer) {
            setFirstName(customer.first_name);
            setLastName(customer.last_name);
        }
    }, [customer]);

    const handleEmailChange = (e) => {
        setEmail(e.target.value);
    };

    const handleFirstNameChange = (e) => {
        setFirstName(e.target.value);
    };

    const handleLastNameChange = (e) => {
        setLastName(e.target.value);
    };

    const handleGuestCountChange = (e) => {
        setGuestCount(e.target.value);
    };

    const handleEmailLookup = async () => {
        try {
            const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}api/customers?email=${email}`);
            if (response.ok) {
                const data = await response.json();
                setCustomer(data);
            } else {
                setCustomer(null);
            }
        } catch (error) {
            console.error('Error looking up customer:', error);
        }
    };

    const handleConfirmBooking = () => {
        handleConfirm(customer || { first_name: firstName, last_name: lastName, email }, timeslotDetails, guestCount);
    };

    const isConfirmDisabled = !email || !firstName || !lastName || !guestCount;

    return (
        <Modal show={show} onHide={handleClose}>
            <Modal.Header closeButton>
                <Modal.Title>Book Your Adventure</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Form>
                    <Form.Group controlId="formEmail">
                        <Form.Label>Email address</Form.Label>
                        <Form.Control
                            type="email"
                            placeholder="Enter email"
                            value={email}
                            onChange={handleEmailChange}
                            onBlur={handleEmailLookup}
                        />
                    </Form.Group>
                    <Form.Group controlId="formFirstName">
                        <Form.Label>First Name</Form.Label>
                        <Form.Control
                            type="text"
                            placeholder="First Name"
                            value={firstName}
                            onChange={handleFirstNameChange}
                        />
                    </Form.Group>
                    <Form.Group controlId="formLastName">
                        <Form.Label>Last Name</Form.Label>
                        <Form.Control
                            type="text"
                            placeholder="Last Name"
                            value={lastName}
                            onChange={handleLastNameChange}
                        />
                    </Form.Group>
                    <Form.Group controlId="formGuestCount">
                        <Form.Label>Number of Guests</Form.Label>
                        <Form.Control
                            type="number"
                            placeholder="Enter number of guests"
                            value={guestCount}
                            onChange={handleGuestCountChange}
                        />
                    </Form.Group>
                    <p>Room: {timeslotDetails.roomName}</p>
                    <p>Show Date: {timeslotDetails.showDate}</p>
                    <p>Showtime: {timeslotDetails.startTime} - {timeslotDetails.endTime}</p>
                </Form>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={handleClose}>
                    Cancel
                </Button>
                <Button variant="primary" onClick={handleConfirmBooking} disabled={isConfirmDisabled}>
                    Confirm Booking
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

export default ModalComponent;
