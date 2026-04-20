import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const LoginFormComponent = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const { login, token } = useAuth();

    // Already logged in — skip the login form
    if (token) {
        navigate('/staff/checkin', { replace: true });
        return null;
    }

    const handleSubmit = async (event) => {
        event.preventDefault();
        setError('');
        try {
            const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}login`, {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({username, password})
            });

            if (!response.ok) {
                throw new Error('Invalid username or password');
            }

            const data = await response.json();
            login(data.access_token, data.role);
            navigate('/staff/checkin');
        } catch (error) {
            setError(error.message);
        }
    };

    return (
        <div className="min-h-screen bg-[#0f172a] flex items-center justify-center px-4">
            <div className="w-full max-w-md">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-semibold text-[#f1ece3] tracking-wide">Staff Portal</h1>
                    <p className="text-[#b8afa3] text-sm mt-2 tracking-wider uppercase">Sign in to continue</p>
                </div>
                <div className="bg-[#1e293b] rounded-lg border border-[#c9a84c]/20 p-8">
                    <form onSubmit={handleSubmit}>
                        {error && <p className="text-red-400 text-sm mb-4">{error}</p>}
                        <div className="mb-5">
                            <label className="block text-sm font-medium text-[#b8afa3] mb-2 tracking-wide">Username</label>
                            <input
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                required
                                className="w-full px-3 py-2.5 bg-[#0f172a] border border-[#c9a84c]/20 rounded-md text-[#f1ece3] text-sm focus:outline-none focus:ring-2 focus:ring-[#c9a84c]/40 focus:border-[#c9a84c]/40"
                            />
                        </div>
                        <div className="mb-6">
                            <label className="block text-sm font-medium text-[#b8afa3] mb-2 tracking-wide">Password</label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                className="w-full px-3 py-2.5 bg-[#0f172a] border border-[#c9a84c]/20 rounded-md text-[#f1ece3] text-sm focus:outline-none focus:ring-2 focus:ring-[#c9a84c]/40 focus:border-[#c9a84c]/40"
                            />
                        </div>
                        <button
                            type="submit"
                            className="w-full py-2.5 bg-[#c9a84c] hover:bg-[#b8972f] text-[#0f172a] text-sm font-semibold tracking-widest uppercase transition-colors rounded"
                        >
                            Login
                        </button>
                    </form>
                </div>
                <p className="text-center mt-6 text-sm text-[#b8afa3]">
                    <button
                        onClick={() => navigate('/forgot-password')}
                        className="text-[#c9a84c] hover:text-[#b8972f] transition-colors"
                    >
                        Forgot your password?
                    </button>
                </p>
            </div>
        </div>
    );
};

export default LoginFormComponent;
