import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { authFetch } from '../utils/authFetch';

const ProfilePage = () => {
    const { role, login, token } = useAuth();

    // Profile form
    const [profileForm, setProfileForm] = useState({ username: '', email: '' });
    const [profileLoaded, setProfileLoaded] = useState(false);
    const [profileError, setProfileError] = useState('');
    const [profileSuccess, setProfileSuccess] = useState('');
    const [profileLoading, setProfileLoading] = useState(false);

    // Password form
    const [pwForm, setPwForm] = useState({ current_password: '', new_password: '', confirm: '' });
    const [pwError, setPwError] = useState('');
    const [pwSuccess, setPwSuccess] = useState('');
    const [pwLoading, setPwLoading] = useState(false);

    // Load current profile on first render
    React.useEffect(() => {
        const load = async () => {
            try {
                const res = await authFetch(`${import.meta.env.VITE_API_BASE_URL}api/users/me`);
                if (!res.ok) return;
                const data = await res.json();
                setProfileForm({ username: data.username, email: data.email });
                setProfileLoaded(true);
            } catch {
                // silently fail — fields start empty
            }
        };
        load();
    }, []);

    const handleProfileChange = (e) => {
        setProfileForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleProfileSubmit = async (e) => {
        e.preventDefault();
        setProfileError('');
        setProfileSuccess('');
        setProfileLoading(true);

        try {
            const res = await authFetch(`${import.meta.env.VITE_API_BASE_URL}api/users/me`, {
                method: 'PUT',
                body: JSON.stringify(profileForm)
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Update failed');
            setProfileSuccess('Profile updated successfully.');
            // Update the token so the new username is reflected in nav
            login(token, role);
        } catch (e) {
            setProfileError(e.message);
        } finally {
            setProfileLoading(false);
        }
    };

    const handlePwChange = (e) => {
        setPwForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handlePwSubmit = async (e) => {
        e.preventDefault();
        setPwError('');
        setPwSuccess('');

        if (pwForm.new_password.length < 8) {
            setPwError('New password must be at least 8 characters.');
            return;
        }
        if (pwForm.new_password !== pwForm.confirm) {
            setPwError('Passwords do not match.');
            return;
        }

        setPwLoading(true);
        try {
            const res = await authFetch(`${import.meta.env.VITE_API_BASE_URL}api/users/me/password`, {
                method: 'PUT',
                body: JSON.stringify({
                    current_password: pwForm.current_password,
                    new_password: pwForm.new_password
                })
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Password change failed');
            setPwSuccess('Password changed successfully.');
            setPwForm({ current_password: '', new_password: '', confirm: '' });
        } catch (e) {
            setPwError(e.message);
        } finally {
            setPwLoading(false);
        }
    };

    return (
        <div className="max-w-lg">
            <h1 className="text-2xl font-semibold text-slate-800 mb-8">My Profile</h1>

            {/* Profile card */}
            <div className="bg-white rounded-lg border border-slate-200 p-6 mb-6">
                <h2 className="text-base font-semibold text-slate-700 mb-4">Account Details</h2>
                <form onSubmit={handleProfileSubmit} className="space-y-4">
                    {profileError && <p className="text-red-500 text-sm">{profileError}</p>}
                    {profileSuccess && <p className="text-green-600 text-sm">{profileSuccess}</p>}

                    <div>
                        <label className="block text-sm font-medium text-slate-600 mb-1.5">Username</label>
                        <input
                            name="username"
                            value={profileForm.username}
                            onChange={handleProfileChange}
                            required
                            className="w-full px-3 py-2.5 border border-slate-300 rounded-md text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-[#c9a84c]/40 focus:border-[#c9a84c]/60"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-600 mb-1.5">Email</label>
                        <input
                            name="email"
                            type="email"
                            value={profileForm.email}
                            onChange={handleProfileChange}
                            required
                            className="w-full px-3 py-2.5 border border-slate-300 rounded-md text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-[#c9a84c]/40 focus:border-[#c9a84c]/60"
                        />
                    </div>

                    <div className="flex items-center justify-between pt-1">
                        <span className="text-xs text-slate-400 uppercase tracking-wide">Role: {role}</span>
                        <button
                            type="submit"
                            disabled={profileLoading}
                            className="px-5 py-2 bg-[#c9a84c] hover:bg-[#b8972f] text-[#0f172a] text-sm font-semibold rounded transition-colors disabled:opacity-50"
                        >
                            {profileLoading ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>
                </form>
            </div>

            {/* Password card */}
            <div className="bg-white rounded-lg border border-slate-200 p-6">
                <h2 className="text-base font-semibold text-slate-700 mb-4">Change Password</h2>
                <form onSubmit={handlePwSubmit} className="space-y-4">
                    {pwError && <p className="text-red-500 text-sm">{pwError}</p>}
                    {pwSuccess && <p className="text-green-600 text-sm">{pwSuccess}</p>}

                    <div>
                        <label className="block text-sm font-medium text-slate-600 mb-1.5">Current Password</label>
                        <input
                            name="current_password"
                            type="password"
                            value={pwForm.current_password}
                            onChange={handlePwChange}
                            required
                            className="w-full px-3 py-2.5 border border-slate-300 rounded-md text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-[#c9a84c]/40 focus:border-[#c9a84c]/60"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-600 mb-1.5">New Password</label>
                        <input
                            name="new_password"
                            type="password"
                            value={pwForm.new_password}
                            onChange={handlePwChange}
                            required
                            className="w-full px-3 py-2.5 border border-slate-300 rounded-md text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-[#c9a84c]/40 focus:border-[#c9a84c]/60"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-600 mb-1.5">Confirm New Password</label>
                        <input
                            name="confirm"
                            type="password"
                            value={pwForm.confirm}
                            onChange={handlePwChange}
                            required
                            className="w-full px-3 py-2.5 border border-slate-300 rounded-md text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-[#c9a84c]/40 focus:border-[#c9a84c]/60"
                        />
                    </div>

                    <div className="flex justify-end pt-1">
                        <button
                            type="submit"
                            disabled={pwLoading}
                            className="px-5 py-2 bg-[#c9a84c] hover:bg-[#b8972f] text-[#0f172a] text-sm font-semibold rounded transition-colors disabled:opacity-50"
                        >
                            {pwLoading ? 'Updating...' : 'Update Password'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ProfilePage;
