import React from 'react';
import NavBar from '../Components/Navigation/NavBar.jsx';

const StaffLayout = ({ children }) => {
    return (
        <div className="min-h-screen bg-slate-50">
            <NavBar />
            <div className="max-w-7xl mx-auto px-6 pt-24 pb-12">
                {children}
            </div>
        </div>
    );
};

export default StaffLayout;
