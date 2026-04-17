import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

const ResetPasswordPage = () => {
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token');
    const navigate = useNavigate();

    const [password, setPassword] = useState('');
    const [confirm, setConfirm] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (password.length < 8) {
            setError('Password must be at least 8 characters.');
            return;
        }
        if (password !== confirm) {
            setError('Passwords do not match.');
            return;
        }

        try {
            const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}reset-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token, password })
            });
            const data = await res.json();
            if (res.ok) {
                setSuccess(true);
            } else {
                setError(data.error || 'Something went wrong.');
            }
        } catch {
            setError('Something went wrong. Please try again.');
        }
    };

    if (!token) {
        return (
            <div className="min-h-screen bg-[#0f172a] flex items-center justify-center px-4">
                <div className="text-center">
                    <p className="text-red-400 mb-4">Invalid or missing reset token.</p>
                    <button onClick={() => navigate('/forgot-password')} className="text-[#c9a84c] hover:text-[#b8972f] text-sm">
                        Request a new link
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#0f172a] flex items-center justify-center px-4">
            <div className="w-full max-w-md">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-semibold text-[#f1ece3] tracking-wide">Reset Password</h1>
                    <p className="text-[#b8afa3] text-sm mt-2">Enter your new password below</p>
                </div>

                <div className="bg-[#1e293b] rounded-lg border border-[#c9a84c]/20 p-8">
                    {success ? (
                        <div className="text-center">
                            <div className="w-12 h-12 rounded-full bg-[#c9a84c]/10 border border-[#c9a84c]/30 flex items-center justify-center mx-auto mb-4">
                                <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#c9a84c" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                            </div>
                            <p className="text-[#f1ece3] text-sm mb-4">Password updated successfully.</p>
                            <button
                                onClick={() => navigate('/login')}
                                className="w-full py-2.5 bg-[#c9a84c] hover:bg-[#b8972f] text-[#0f172a] text-sm font-semibold tracking-widest uppercase transition-colors rounded"
                            >
                                Go to Login
                            </button>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit}>
                            {error && <p className="text-red-400 text-sm mb-4">{error}</p>}
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-[#b8afa3] mb-2 tracking-wide">
                                    New Password
                                </label>
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    autoFocus
                                    className="w-full px-3 py-2.5 bg-[#0f172a] border border-[#c9a84c]/20 rounded-md text-[#f1ece3] text-sm focus:outline-none focus:ring-2 focus:ring-[#c9a84c]/40"
                                />
                            </div>
                            <div className="mb-6">
                                <label className="block text-sm font-medium text-[#b8afa3] mb-2 tracking-wide">
                                    Confirm Password
                                </label>
                                <input
                                    type="password"
                                    value={confirm}
                                    onChange={(e) => setConfirm(e.target.value)}
                                    required
                                    className="w-full px-3 py-2.5 bg-[#0f172a] border border-[#c9a84c]/20 rounded-md text-[#f1ece3] text-sm focus:outline-none focus:ring-2 focus:ring-[#c9a84c]/40"
                                />
                            </div>
                            <button
                                type="submit"
                                className="w-full py-2.5 bg-[#c9a84c] hover:bg-[#b8972f] text-[#0f172a] text-sm font-semibold tracking-widest uppercase transition-colors rounded"
                            >
                                Update Password
                            </button>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ResetPasswordPage;
