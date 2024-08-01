import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Button, Form } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import './LoginFormComponent.css'; // Custom styles

const LoginFormComponent = ({ onLoginSuccess }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (event) => {
        event.preventDefault();
        try {
            const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/login`, {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({username, password})
            });

            if (!response.ok) {
                throw new Error('Failed to log in');
            }

            const data = await response.json();
            onLoginSuccess(data.access_token); // assuming the token is returned in the 'access_token' field
        } catch (error) {
            setError(error.message);
        }
    };

    return (
        <div>
            <Card className="login-card">
                <Card.Body>
                    <Card.Title>Login</Card.Title>
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
                            Login
                        </Button>
                    </Form>

                </Card.Body>
            </Card>
            <a className="sign-up-button" onClick={() => navigate('/register')}>Register</a>
        </div>
    );
};

export default LoginFormComponent;
