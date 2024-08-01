import React, { useState } from 'react';
import { Card, Form, Button } from 'react-bootstrap';
import './RegisterFormComponent.css';

const RegisterFormComponent = ({ onRegisterSuccess }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [email, setEmail] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = async (event) => {
        event.preventDefault();
        try {
            const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password, email })
            });

            if (!response.ok) {
                throw new Error('Failed to register');
            }

            const data = await response.json();
            onRegisterSuccess(data);
        } catch (error) {
            setError(error.message);
        }
    };

    return (
        <Card className="register-card">
            <Card.Body>
                <Card.Title>Register</Card.Title>
                <Form onSubmit={handleSubmit}>
                    {error && <p className="text-danger">{error}</p>}
                    <Form.Group controlId="formUsername">
                        <Form.Label>Username</Form.Label>
                        <Form.Control
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                        />
                    </Form.Group>
                    <Form.Group controlId="formEmail" className="mt-3">
                        <Form.Label>Email</Form.Label>
                        <Form.Control
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </Form.Group>
                    <Form.Group controlId="formPassword" className="mt-3">
                        <Form.Label>Password</Form.Label>
                        <Form.Control
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </Form.Group>
                    <Button variant="primary" type="submit" className="mt-4 btn-sm">
                        Register
                    </Button>
                </Form>
            </Card.Body>
        </Card>
    );
};

export default RegisterFormComponent;
