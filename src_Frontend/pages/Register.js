import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/api';
import '../styles.css';

const Register = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('EMPLOYEE');
    const [managerId, setManagerId] = useState('');
    const [managers, setManagers] = useState([]);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const fetchManagers = async () => {
            try {
                const response = await api.get('/users/managers');
                setManagers(response.data);
            } catch (err) {
                console.error("Could not fetch managers:", err);
                setError("Could not load managers. Please check your backend server.");
            }
        };

        fetchManagers();
    }, []);

    const handleRegister = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        try {
            const registrationData = {
                name,
                email,
                password,
                role,
                ...(role === 'EMPLOYEE' && managerId && { manager: { id: parseInt(managerId) } })
            };
            
            const response = await api.post('/users', registrationData);
            const createdUser = response.data;
            setSuccess('Registration successful! Redirecting to dashboard...');
            setTimeout(() => {
                if (createdUser.role === 'MANAGER') {
                    navigate(`/manager/dashboard/${createdUser.email}`);
                } else {
                    navigate(`/employee/dashboard/${createdUser.email}`);
                }
            }, 2000);
        } catch (err) {
            setError(err.response?.data || 'An error occurred during registration.');
        }
    };

    return (
        <div className="app-container">
            <div className="card">
                <div className="card-header">
                    <h2>Register</h2>
                </div>
                <form onSubmit={handleRegister}>
                    {error && <div className="alert alert-error">{error}</div>}
                    {success && <div className="alert alert-success">{success}</div>}
                    
                    <div className="form-group">
                        <label>Name</label>
                        <input type="text" value={name} onChange={(e) => setName(e.target.value)} required />
                    </div>
                    <div className="form-group">
                        <label>Email</label>
                        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                    </div>
                     <div className="form-group">
                        <label>Password</label>
                        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                    </div>
                    
                    <div className="form-group">
                        <label>Role</label>
                        <select value={role} onChange={(e) => setRole(e.target.value)}>
                            <option value="EMPLOYEE">Employee</option>
                            <option value="MANAGER">Manager</option>
                        </select>
                    </div>

                    {role === 'EMPLOYEE' && (
                        <div className="form-group">
                            <label>Select Manager</label>
                            <select value={managerId} onChange={(e) => setManagerId(e.target.value)} required>
                                <option value="">-- Select a Manager --</option>
                                {managers.map(manager => (
                                    <option key={manager.id} value={manager.id}>{manager.name} ({manager.email})</option>
                                ))}
                            </select>
                        </div>
                    )}
                    
                    <button type="submit" className="btn">Register</button>
                </form>
                <div className="link-text">
                    Already have an account? <Link to="/login">Login</Link>
                </div>
            </div>
        </div>
    );
};

export default Register;