import React, { useState, useEffect } from 'react';
import { authFetch } from '../utils/authFetch';

const ROLES = ['ADMIN', 'EMPLOYEE'];

const emptyForm = { username: '', email: '', password: '', role: 'EMPLOYEE' };

const UsersPage = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // Modal state
    const [showModal, setShowModal] = useState(false);
    const [editUser, setEditUser] = useState(null); // null = add mode
    const [form, setForm] = useState(emptyForm);
    const [formError, setFormError] = useState('');
    const [formLoading, setFormLoading] = useState(false);

    // Reset email state
    const [resetSent, setResetSent] = useState({}); // { [userId]: true }

    const fetchUsers = async () => {
        setLoading(true);
        setError('');
        try {
            const res = await authFetch(`${import.meta.env.VITE_API_BASE_URL}api/users`);
            if (!res.ok) throw new Error('Failed to load users');
            const data = await res.json();
            setUsers(data);
        } catch (e) {
            setError(e.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchUsers(); }, []);

    const openAdd = () => {
        setEditUser(null);
        setForm(emptyForm);
        setFormError('');
        setShowModal(true);
    };

    const openEdit = (user) => {
        setEditUser(user);
        setForm({ username: user.username, email: user.email, password: '', role: user.role });
        setFormError('');
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setEditUser(null);
        setFormError('');
    };

    const handleFormChange = (e) => {
        setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setFormError('');
        setFormLoading(true);

        try {
            const url = editUser
                ? `${import.meta.env.VITE_API_BASE_URL}api/users/${editUser.id}`
                : `${import.meta.env.VITE_API_BASE_URL}api/users`;

            const body = editUser
                ? { username: form.username, email: form.email, role: form.role }
                : { username: form.username, email: form.email, password: form.password, role: form.role };

            const res = await authFetch(url, {
                method: editUser ? 'PUT' : 'POST',
                body: JSON.stringify(body)
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Something went wrong');

            closeModal();
            fetchUsers();
        } catch (e) {
            setFormError(e.message);
        } finally {
            setFormLoading(false);
        }
    };

    const handleDelete = async (user) => {
        if (!window.confirm(`Delete user "${user.username}"? This cannot be undone.`)) return;
        try {
            const res = await authFetch(`${import.meta.env.VITE_API_BASE_URL}api/users/${user.id}`, { method: 'DELETE' });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Delete failed');
            fetchUsers();
        } catch (e) {
            setError(e.message);
        }
    };

    const handleResetEmail = async (user) => {
        try {
            const res = await authFetch(`${import.meta.env.VITE_API_BASE_URL}api/users/${user.id}/reset-password`, { method: 'POST' });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Failed to send email');
            setResetSent(prev => ({ ...prev, [user.id]: true }));
            setTimeout(() => setResetSent(prev => { const n = { ...prev }; delete n[user.id]; return n; }), 4000);
        } catch (e) {
            setError(e.message);
            setTimeout(() => setError(''), 4000);
        }
    };

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-semibold text-slate-800">Users</h1>
                <button
                    onClick={openAdd}
                    className="flex items-center gap-2 px-4 py-2 bg-[#c9a84c] hover:bg-[#b8972f] text-[#0f172a] text-sm font-semibold rounded transition-colors"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                    Add User
                </button>
            </div>

            {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

            {loading ? (
                <p className="text-slate-500 text-sm">Loading...</p>
            ) : (
                <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="bg-[#0f172a] text-[#f1ece3] text-xs uppercase tracking-wider">
                                <th className="px-4 py-3 text-left">Username</th>
                                <th className="px-4 py-3 text-left">Email</th>
                                <th className="px-4 py-3 text-left">Role</th>
                                <th className="px-4 py-3 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {users.length === 0 && (
                                <tr><td colSpan={4} className="px-4 py-6 text-center text-slate-400">No users found.</td></tr>
                            )}
                            {users.map(user => (
                                <tr key={user.id} className="hover:bg-slate-50 transition-colors">
                                    <td className="px-4 py-3 font-medium text-slate-800">{user.username}</td>
                                    <td className="px-4 py-3 text-slate-600">{user.email}</td>
                                    <td className="px-4 py-3">
                                        <span className={`inline-block px-2 py-0.5 rounded text-xs font-semibold ${user.role === 'ADMIN' ? 'bg-[#c9a84c]/20 text-[#8a6a1a]' : 'bg-slate-100 text-slate-600'}`}>
                                            {user.role}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="flex items-center justify-end gap-3">
                                            {resetSent[user.id] ? (
                                                <span className="text-xs text-green-600 font-medium">Email sent!</span>
                                            ) : (
                                                <button
                                                    onClick={() => handleResetEmail(user)}
                                                    title="Send password reset email"
                                                    className="text-slate-400 hover:text-[#c9a84c] transition-colors"
                                                >
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
                                                </button>
                                            )}
                                            <button
                                                onClick={() => openEdit(user)}
                                                title="Edit user"
                                                className="text-slate-400 hover:text-blue-600 transition-colors"
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                                            </button>
                                            <button
                                                onClick={() => handleDelete(user)}
                                                title="Delete user"
                                                className="text-slate-400 hover:text-red-600 transition-colors"
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Add / Edit Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={closeModal} />
                    <div className="relative bg-[#1e293b] rounded-xl border border-[#c9a84c]/20 shadow-2xl w-full max-w-md p-8">
                        <button
                            onClick={closeModal}
                            className="absolute top-4 right-4 text-[#b8afa3] hover:text-[#f1ece3] transition-colors"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                        </button>

                        <h2 className="text-xl font-semibold text-[#f1ece3] mb-6">
                            {editUser ? 'Edit User' : 'Add User'}
                        </h2>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            {formError && <p className="text-red-400 text-sm">{formError}</p>}

                            <div>
                                <label className="block text-sm font-medium text-[#b8afa3] mb-1.5">Username</label>
                                <input
                                    name="username"
                                    value={form.username}
                                    onChange={handleFormChange}
                                    required
                                    className="w-full px-3 py-2.5 bg-[#0f172a] border border-[#c9a84c]/20 rounded-md text-[#f1ece3] text-sm focus:outline-none focus:ring-2 focus:ring-[#c9a84c]/40"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-[#b8afa3] mb-1.5">Email</label>
                                <input
                                    name="email"
                                    type="email"
                                    value={form.email}
                                    onChange={handleFormChange}
                                    required
                                    className="w-full px-3 py-2.5 bg-[#0f172a] border border-[#c9a84c]/20 rounded-md text-[#f1ece3] text-sm focus:outline-none focus:ring-2 focus:ring-[#c9a84c]/40"
                                />
                            </div>

                            {!editUser && (
                                <div>
                                    <label className="block text-sm font-medium text-[#b8afa3] mb-1.5">
                                        Password
                                        <span className="ml-1 text-xs text-[#b8afa3]/60">(min 8 characters)</span>
                                    </label>
                                    <input
                                        name="password"
                                        type="password"
                                        value={form.password}
                                        onChange={handleFormChange}
                                        required
                                        minLength={8}
                                        className="w-full px-3 py-2.5 bg-[#0f172a] border border-[#c9a84c]/20 rounded-md text-[#f1ece3] text-sm focus:outline-none focus:ring-2 focus:ring-[#c9a84c]/40"
                                    />
                                    <p className="text-xs text-[#b8afa3]/60 mt-1">You can send a reset email after creating the user.</p>
                                </div>
                            )}

                            <div>
                                <label className="block text-sm font-medium text-[#b8afa3] mb-1.5">Role</label>
                                <select
                                    name="role"
                                    value={form.role}
                                    onChange={handleFormChange}
                                    className="w-full px-3 py-2.5 bg-[#0f172a] border border-[#c9a84c]/20 rounded-md text-[#f1ece3] text-sm focus:outline-none focus:ring-2 focus:ring-[#c9a84c]/40"
                                >
                                    {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                                </select>
                            </div>

                            <div className="flex gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={closeModal}
                                    className="flex-1 py-2.5 border border-[#c9a84c]/30 text-[#b8afa3] text-sm rounded hover:border-[#c9a84c]/60 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={formLoading}
                                    className="flex-1 py-2.5 bg-[#c9a84c] hover:bg-[#b8972f] text-[#0f172a] text-sm font-semibold rounded transition-colors disabled:opacity-50"
                                >
                                    {formLoading ? 'Saving...' : editUser ? 'Save Changes' : 'Create User'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UsersPage;
