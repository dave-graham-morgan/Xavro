import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const ForgotPasswordPage = () => {
    const [email, setEmail] = useState('');
    const [submitted, setSubmitted] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            await fetch(`${import.meta.env.VITE_API_BASE_URL}forgot-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email })
            });
            // Always show success — backend never reveals if email exists
            setSubmitted(true);
        } catch {
            setError('Something went wrong. Please try again.');
            setTimeout(() => setError(''), 4000);
        }
    };

    return (
        <div className="min-h-screen bg-[#0f172a] flex items-center justify-center px-4">
            <div className="w-full max-w-md">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-semibold text-[#f1ece3] tracking-wide">Forgot Password</h1>
                    <p className="text-[#b8afa3] text-sm mt-2">We'll send a reset link to your email</p>
                </div>

                <div className="bg-[#1e293b] rounded-lg border border-[#c9a84c]/20 p-8">
                    {submitted ? (
                        <div className="text-center">
                            <div className="w-12 h-12 rounded-full bg-[#c9a84c]/10 border border-[#c9a84c]/30 flex items-center justify-center mx-auto mb-4">
                                <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#c9a84c" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                            </div>
                            <p className="text-[#f1ece3] text-sm mb-1">Check your inbox</p>
                            <p className="text-[#b8afa3] text-xs leading-relaxed">
                                If that email is registered, you'll receive a reset link shortly. The link expires in 15 minutes.
                            </p>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit}>
                            {error && <p className="text-red-400 text-sm mb-4">{error}</p>}
                            <div className="mb-6">
                                <label className="block text-sm font-medium text-[#b8afa3] mb-2 tracking-wide">
                                    Email address
                                </label>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    autoFocus
                                    className="w-full px-3 py-2.5 bg-[#0f172a] border border-[#c9a84c]/20 rounded-md text-[#f1ece3] text-sm focus:outline-none focus:ring-2 focus:ring-[#c9a84c]/40"
                                />
                            </div>
                            <button
                                type="submit"
                                className="w-full py-2.5 bg-[#c9a84c] hover:bg-[#b8972f] text-[#0f172a] text-sm font-semibold tracking-widest uppercase transition-colors rounded"
                            >
                                Send Reset Link
                            </button>
                        </form>
                    )}
                </div>

                <p className="text-center mt-6 text-sm text-[#b8afa3]">
                    <button
                        onClick={() => navigate('/xavro')}
                        className="text-[#c9a84c] hover:text-[#b8972f] transition-colors"
                    >
                        ← Back to login
                    </button>
                </p>
            </div>
        </div>
    );
};

export default ForgotPasswordPage;
