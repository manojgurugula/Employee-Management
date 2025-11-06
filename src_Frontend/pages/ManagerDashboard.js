import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/api';
import '../styles.css';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const ManagerDashboard = () => {
    const { userEmail } = useParams();
    const [user, setUser] = useState(null);
    const [pendingLeaves, setPendingLeaves] = useState([]);
    const [employees, setEmployees] = useState([]);
    const [employeeHours, setEmployeeHours] = useState({});
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [view, setView] = useState('summary');
    const [profile, setProfile] = useState(null);
    const [editingProfile, setEditingProfile] = useState(false);
    const [showFeedbackModal, setShowFeedbackModal] = useState(false);
    const [selectedLeaveId, setSelectedLeaveId] = useState(null);
    const [feedback, setFeedback] = useState('');
    const navigate = useNavigate();

    const fetchEmployeesAttendance = useCallback(async (employeeList) => {
        const hoursData = {};
        for (const emp of employeeList) {
            try {
                const hoursResponse = await api.get(`/attendance/total-hours/${emp.id}`);
                hoursData[emp.name] = hoursResponse.data;
            } catch (err) {
                console.error(`Failed to fetch hours for ${emp.name}:`, err);
                hoursData[emp.name] = 0;
            }
        }
        setEmployeeHours(hoursData);
    }, []);

    const fetchPendingLeaves = useCallback(async (managerId) => {
        try {
            const leavesResponse = await api.get(`/leaves/pending/${managerId}`);
            setPendingLeaves(leavesResponse.data);
        } catch (err) {
            setError('Failed to fetch pending leave requests.');
        }
    }, []);

    const fetchEmployees = useCallback(async (managerId) => {
        try {
            const usersResponse = await api.get('/users');
            const employeesOfManager = usersResponse.data.filter(emp => emp.manager && emp.manager.id === managerId);
            setEmployees(employeesOfManager);
            fetchEmployeesAttendance(employeesOfManager);
        } catch (err) {
            setError('Failed to fetch employee list.');
        }
    }, [fetchEmployeesAttendance]);

    const fetchUserProfile = useCallback(async (userId) => {
        try {
            const profileResponse = await api.get(`/profile/${userId}`);
            setProfile(profileResponse.data);
        } catch (err) {
            setProfile({
                phone: '',
                address: '',
                dateOfBirth: '',
                joinDate: '',
                department: '',
                position: '',
                emergencyContact: '',
                emergencyPhone: ''
            });
        }
    }, []);

    useEffect(() => {
        const fetchManagerData = async () => {
            try {
                const usersResponse = await api.get('/users');
                const currentUser = usersResponse.data.find(u => u.email === userEmail);
                if (currentUser) {
                    setUser(currentUser);
                    fetchEmployees(currentUser.id);
                    fetchPendingLeaves(currentUser.id);
                    fetchUserProfile(currentUser.id);
                }
            } catch (err) {
                setError('Failed to fetch manager data.');
            }
        };

        fetchManagerData();
    }, [userEmail, fetchEmployees, fetchPendingLeaves, fetchUserProfile]);

    const handleLeaveDecision = async (leaveId, status) => {
        if (status === 'REJECTED') {
            setSelectedLeaveId(leaveId);
            setShowFeedbackModal(true);
            return;
        }
        
        setError('');
        setSuccess('');
        try {
            await api.patch(`/leaves/${leaveId}`, { status });
            setSuccess(`Leave request ${status.toLowerCase()}ed successfully!`);
            setTimeout(() => setSuccess(''), 3000);
            fetchPendingLeaves(user.id);
        } catch (err) {
            setError('Failed to update leave status.');
        }
    };

    const handleRejectWithFeedback = async () => {
        if (!feedback.trim()) {
            setError('Please provide feedback for rejection.');
            return;
        }
        
        setError('');
        setSuccess('');
        try {
            await api.patch(`/leaves/${selectedLeaveId}`, { 
                status: 'REJECTED', 
                feedback: feedback 
            });
            setSuccess('Leave request rejected successfully!');
            setTimeout(() => setSuccess(''), 3000);
            setShowFeedbackModal(false);
            setFeedback('');
            setSelectedLeaveId(null);
            fetchPendingLeaves(user.id);
        } catch (err) {
            setError('Failed to reject leave request.');
        }
    };
    
    const handleLogout = () => {
        navigate('/');
    };

    const handleProfileUpdate = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        try {
            await api.put(`/profile/${user.id}`, profile);
            setSuccess('Profile updated successfully!');
            setTimeout(() => setSuccess(''), 3000);
            setEditingProfile(false);
        } catch (err) {
            setError('Failed to update profile.');
        }
    };

    const handleProfileChange = (field, value) => {
        setProfile(prev => ({ ...prev, [field]: value }));
    };

    const renderView = () => {
        switch (view) {
            case 'pending-leaves':
                return (
                    <>
                        <h3 className="section-title">Pending Leave Requests</h3>
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>Employee</th>
                                    <th>Start Date</th>
                                    <th>End Date</th>
                                    <th>Reason</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {pendingLeaves.map(leave => (
                                    <tr key={leave.id}>
                                        <td>{leave.user.name}</td>
                                        <td>{leave.startDate}</td>
                                        <td>{leave.endDate}</td>
                                        <td>{leave.reason}</td>
                                        <td>
                                            <div className="btn-group">
                                                <button onClick={() => handleLeaveDecision(leave.id, 'APPROVED')} className="btn">Approve</button>
                                                <button onClick={() => handleLeaveDecision(leave.id, 'REJECTED')} className="btn btn-secondary">Reject</button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </>
                );
            case 'employee-list':
                return (
                    <>
                        <h3 className="section-title">My Employees</h3>
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>Name</th>
                                    <th>Email</th>
                                </tr>
                            </thead>
                            <tbody>
                                {employees.map(emp => (
                                    <tr key={emp.id}>
                                        <td>{emp.name}</td>
                                        <td>{emp.email}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </>
                );
            case 'attendance-metrics':
                return (
                    <>
                        <h3 className="section-title">Employee Attendance Metrics</h3>
                        <div className="chart-container">
                            <Bar data={chartData} options={{ maintainAspectRatio: false }} />
                        </div>
                    </>
                );
            case 'profile':
                return (
                    <>
                        <h3 className="section-title">My Profile</h3>
                        {profile && (
                            <div className="profile-container">
                                <div className="profile-info">
                                    <div className="form-group">
                                        <label>Name</label>
                                        <input type="text" value={user.name} disabled className="disabled-input" />
                                    </div>
                                    <div className="form-group">
                                        <label>Email</label>
                                        <input type="email" value={user.email} disabled className="disabled-input" />
                                    </div>
                                    <div className="form-group">
                                        <label>Phone</label>
                                        <input 
                                            type="text" 
                                            value={profile.phone || ''} 
                                            onChange={(e) => handleProfileChange('phone', e.target.value)}
                                            disabled={!editingProfile}
                                            placeholder="Enter phone number"
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Address</label>
                                        <textarea 
                                            value={profile.address || ''} 
                                            onChange={(e) => handleProfileChange('address', e.target.value)}
                                            disabled={!editingProfile}
                                            placeholder="Enter address"
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Date of Birth</label>
                                        <input 
                                            type="date" 
                                            value={profile.dateOfBirth || ''} 
                                            onChange={(e) => handleProfileChange('dateOfBirth', e.target.value)}
                                            disabled={!editingProfile}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Join Date</label>
                                        <input 
                                            type="date" 
                                            value={profile.joinDate || ''} 
                                            onChange={(e) => handleProfileChange('joinDate', e.target.value)}
                                            disabled={!editingProfile}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Department</label>
                                        <input 
                                            type="text" 
                                            value={profile.department || ''} 
                                            onChange={(e) => handleProfileChange('department', e.target.value)}
                                            disabled={!editingProfile}
                                            placeholder="Enter department"
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Position</label>
                                        <input 
                                            type="text" 
                                            value={profile.position || ''} 
                                            onChange={(e) => handleProfileChange('position', e.target.value)}
                                            disabled={!editingProfile}
                                            placeholder="Enter position"
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Emergency Contact</label>
                                        <input 
                                            type="text" 
                                            value={profile.emergencyContact || ''} 
                                            onChange={(e) => handleProfileChange('emergencyContact', e.target.value)}
                                            disabled={!editingProfile}
                                            placeholder="Enter emergency contact name"
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Emergency Phone</label>
                                        <input 
                                            type="text" 
                                            value={profile.emergencyPhone || ''} 
                                            onChange={(e) => handleProfileChange('emergencyPhone', e.target.value)}
                                            disabled={!editingProfile}
                                            placeholder="Enter emergency contact phone"
                                        />
                                    </div>
                                </div>
                                <div className="profile-actions">
                                    {editingProfile ? (
                                        <>
                                            <button onClick={handleProfileUpdate} className="btn">Save Changes</button>
                                            <button onClick={() => setEditingProfile(false)} className="btn btn-secondary">Cancel</button>
                                        </>
                                    ) : (
                                        <button onClick={() => setEditingProfile(true)} className="btn">Edit Profile</button>
                                    )}
                                </div>
                            </div>
                        )}
                    </>
                );
            default: // Summary view
                return (
                    <>
                        <div className="stats-grid">
                            <div className="stat-card">
                                <p>Total Employees</p>
                                <p className="stat-value">{employees.length}</p>
                            </div>
                            <div className="stat-card">
                                <p>Pending Leave Requests</p>
                                <p className="stat-value">{pendingLeaves.length}</p>
                            </div>
                        </div>
                    </>
                );
        }
    };

    if (!user || !profile) {
        return <div className="app-container"><p>Loading...</p></div>;
    }
    
    const chartData = {
        labels: Object.keys(employeeHours),
        datasets: [{
            label: 'Total Hours Worked',
            data: Object.values(employeeHours),
            backgroundColor: 'rgba(59, 130, 246, 0.6)',
            borderColor: 'rgba(59, 130, 246, 1)',
            borderWidth: 1,
        }]
    };

    return (
        <div className="dashboard-container">
            <div className="dashboard-header">
                <h2 className="section-title">Manager Dashboard</h2>
                <button onClick={handleLogout} className="btn btn-secondary">Logout</button>
            </div>
            <h3 className="welcome-message">Welcome, {user.name}!</h3>
            
            <div className="nav-bar">
                <button onClick={() => setView('summary')} className={`nav-btn ${view === 'summary' ? 'active' : ''}`}>Summary</button>
                <button onClick={() => setView('pending-leaves')} className={`nav-btn ${view === 'pending-leaves' ? 'active' : ''}`}>Leave Requests</button>
                <button onClick={() => setView('employee-list')} className={`nav-btn ${view === 'employee-list' ? 'active' : ''}`}>My Employees</button>
                <button onClick={() => setView('attendance-metrics')} className={`nav-btn ${view === 'attendance-metrics' ? 'active' : ''}`}>Attendance Metrics</button>
                <button onClick={() => setView('profile')} className={`nav-btn ${view === 'profile' ? 'active' : ''}`}>Profile</button>
            </div>

            {error && <div className="alert alert-error">{error}</div>}
            {success && <div className="alert alert-success">{success}</div>}

            <div className="dashboard-content">
                {renderView()}
            </div>
            
            {showFeedbackModal && (
                <div className="modal-overlay">
                    <div className="modal">
                        <h3>Rejection Feedback</h3>
                        <p>Please provide feedback for rejecting this leave request:</p>
                        <textarea 
                            value={feedback}
                            onChange={(e) => setFeedback(e.target.value)}
                            placeholder="Enter feedback for rejection..."
                            rows="4"
                            className="feedback-textarea"
                        />
                        <div className="modal-actions">
                            <button onClick={handleRejectWithFeedback} className="btn">Submit Rejection</button>
                            <button onClick={() => {
                                setShowFeedbackModal(false);
                                setFeedback('');
                                setSelectedLeaveId(null);
                            }} className="btn btn-secondary">Cancel</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ManagerDashboard;