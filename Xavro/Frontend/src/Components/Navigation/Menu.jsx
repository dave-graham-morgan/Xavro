import React from 'react';
import { NavLink } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import './Menu.css'

const Menu = () => {
    return (
        <nav className="navbar navbar-expand-lg navbar-light bg-light fixed-top">
            <div className="container">
                <NavLink className="navbar-brand" to="/">Xavro</NavLink>
                <button className="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
                    <span className="navbar-toggler-icon"></span>
                </button>
                <div className="collapse navbar-collapse" id="navbarNav">
                    <ul className="navbar-nav">
                        <li className="nav-item">
                            <NavLink exact="true" className={({isActive}) => "nav-link" + (isActive ? " active" : "")}
                                     to="/">Home</NavLink>
                        </li>
                        <li className="nav-item">
                            <NavLink className={({isActive}) => "nav-link" + (isActive ? " active" : "")}
                                     to="/rooms">Rooms</NavLink>
                        </li>
                        <li className="nav-item">
                            <NavLink className={({isActive}) => "nav-link" + (isActive ? " active" : "")}
                                     to="/customers">Customers</NavLink>
                        </li>

                    </ul>
                </div>
            </div>
        </nav>
    );
};

export default Menu;
