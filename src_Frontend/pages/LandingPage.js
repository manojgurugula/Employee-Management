import React from 'react';
import { Link } from 'react-router-dom';
import '../styles.css';

const LandingPage = () => {
    return (
        <div className="landing-page-container">
            <div className="landing-card">
                <div className="landing-text-content">
                    <h1>Employee Management System</h1>
                    <p>Your all-in-one solution for seamless leave and attendance tracking.</p>
                </div>
                <div className="landing-cta">
                    <Link to="/login" className="btn btn-primary landing-btn">Login to Your Account</Link>
                    <Link to="/register" className="btn btn-secondary landing-btn">Create a New Account</Link>
                </div>
            </div>
        </div>
    );
};

export default LandingPage;