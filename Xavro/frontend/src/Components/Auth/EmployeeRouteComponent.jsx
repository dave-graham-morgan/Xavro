import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const EmployeeRoute = () => {
    const { token, role } = useAuth();
    const allowed = token && (role === 'EMPLOYEE' || role === 'ADMIN');
    return allowed ? <Outlet /> : <Navigate to='/xavro' replace />;
};

export default EmployeeRoute;
