import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/api';
import '../styles.css';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');

        try {
            const response = await api.get('/users');
            const user = response.data.find(u => u.email === email);

            if (user && user.password === password) {
                if (user.role === 'MANAGER') {
                    navigate(`/manager/dashboard/${user.email}`);
                } else if (user.role === 'EMPLOYEE') {
                    navigate(`/employee/dashboard/${user.email}`);
                }
            } else {
                setError('Invalid credentials. Please check your email and password.');
            }
        } catch (err) {
            setError('An error occurred. Please check your backend server.');
        }
    };

    return (
        <div className="app-container">
            <div className="card">
                <div className="card-header">
                    <h2>Login</h2>
                </div>
                <form onSubmit={handleLogin}>
                    {error && <div className="alert alert-error">{error}</div>}
                    <div className="form-group">
                        <label>Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label>Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>
                    <button type="submit" className="btn">Login</button>
                </form>
                <div className="link-text">
                    Don't have an account? <Link to="/register">Register here</Link>
                </div>
            </div>
        </div>
    );
};

export default Login;