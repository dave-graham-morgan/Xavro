import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const AdminRoute = () => {
    const { token, role } = useAuth();
    return (token && role === 'ADMIN') ? <Outlet /> : <Navigate to="/login" replace />;
};

export default AdminRoute;
