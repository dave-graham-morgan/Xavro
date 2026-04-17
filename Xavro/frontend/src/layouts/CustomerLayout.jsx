import React from 'react';
import CustomerNavBar from '../Components/Navigation/CustomerNavBar.jsx';

const CustomerLayout = ({ children }) => {
    return (
        <div className="min-h-screen bg-[#0f172a] text-[#f1ece3]">
            <CustomerNavBar />
            <main className="pt-20">
                {children}
            </main>
            <footer className="border-t border-[#c9a84c]/20 mt-24 py-10 text-center text-[#b8afa3] text-sm tracking-widest uppercase">
                <p>&copy; {new Date().getFullYear()} The Escapeway Collective. All rights reserved.</p>
            </footer>
        </div>
    );
};

export default CustomerLayout;
