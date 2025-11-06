import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/api';
import '../styles.css';
 
const EmployeeDashboard = () => {
    const { userEmail } = useParams();
    const [user, setUser] = useState(null);
    const [leaves, setLeaves] = useState([]);
    const [attendanceHours, setAttendanceHours] = useState(0);
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [reason, setReason] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [view, setView] = useState('summary');
    const [profile, setProfile] = useState(null);
    const [editingProfile, setEditingProfile] = useState(false);
    const navigate = useNavigate();
 
    
    const holidays = [
        '2025-01-01',
        '2025-01-26',
        '2025-03-29',
        '2025-04-14',
        '2025-05-01',
        '2025-08-15',
        '2025-10-02',
        '2025-11-04',
        '2025-12-25'
    ];
 
    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const usersResponse = await api.get('/users');
                const currentUser = usersResponse.data.find(u => u.email === userEmail);
                if (currentUser) {
                    setUser(currentUser);
                    fetchUserLeaves(currentUser.id);
                    fetchAttendanceHours(currentUser.id);
                    fetchUserProfile(currentUser.id);
                }
            } catch (err) {
                setError('Failed to fetch user data. Please check your backend.');
            }
        };
 
        fetchUserData();
    }, [userEmail]);
 
    const fetchUserLeaves = async (userId) => {
        try {
            const leavesResponse = await api.get(`/leaves/my-leaves/${userId}`);
            setLeaves(leavesResponse.data);
        } catch (err) {
            setError('Failed to fetch leave history.');
        }
    };
 
    const fetchAttendanceHours = async (userId) => {
        try {
            const hoursResponse = await api.get(`/attendance/total-hours/${userId}`);
            setAttendanceHours(hoursResponse.data);
        } catch (err) {
            setError('Failed to fetch attendance hours.');
        }
    };

    const fetchUserProfile = async (userId) => {
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
 

    const calculateWorkingDays = (start, end) => {
        if (!start || !end) return 0;
        const startDt = new Date(start);
        const endDt = new Date(end);
        if (endDt < startDt) return 0;
 
        let count = 0;
        for (let d = new Date(startDt); d <= endDt; d.setDate(d.getDate() + 1)) {
            const day = d.getDay(); // 0 = Sunday, 6 = Saturday
            const dateStr = d.toISOString().split('T')[0];
            if (day !== 0 && day !== 6 && !holidays.includes(dateStr)) {
                count++;
            }
        }
        return count;
    };
 
    const handleApplyLeave = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
 
        if (!startDate || !endDate) {
            setError('Please select both start and end dates.');
            return;
        }
 
        if (new Date(endDate) < new Date(startDate)) {
            setError('End date cannot be before start date.');
            return;
        }
 
        const requestedDays = calculateWorkingDays(startDate, endDate);
        if (requestedDays <= 0) {
            setError('Selected date range contains 0 working days (weekends/holidays only). Choose different dates.');
            return;
        }
 

        const takenLeaveDays = leaves
            .filter(leave => leave.status === 'APPROVED')
            .reduce((sum, leave) => sum + calculateWorkingDays(leave.startDate, leave.endDate), 0);
 
        const remainingLeaves = 10 - takenLeaveDays;
        if (requestedDays > remainingLeaves) {
            setError(`You only have ${remainingLeaves} leave day(s) remaining. Requested ${requestedDays} day(s).`);
            return;
        }
 
        try {

            await api.post(`/leaves/apply/${user.id}`, {
                startDate,
                endDate,
                reason,
                duration: requestedDays
            });
            setSuccess('Leave request submitted successfully!');
            setTimeout(() => setSuccess(''), 3000);
            fetchUserLeaves(user.id);
            setStartDate('');
            setEndDate('');
            setReason('');
        } catch (err) {
            setError(err.response?.data || 'Failed to submit leave request.');
        }
    };
 
    const handleSwipe = async (type) => {
        setError('');
        setSuccess('');
        try {
            await api.post(`/attendance/swipe/${user.id}`, { type });
            setSuccess(`Swipe ${type} recorded!`);
            setTimeout(() => setSuccess(''), 3000);
            fetchAttendanceHours(user.id);
        } catch (err) {
            setError(err.response?.data || 'Failed to record attendance.');
        }
    };
 
    const handleLogout = () => {
        navigate('/');
    };
 
    if (!user || !profile) {
        return <div className="app-container"><p>Loading...</p></div>;
    }
 
    const totalLeaves = leaves.length;
    const pendingLeaves = leaves.filter(leave => leave.status === 'PENDING').length;
 
    const takenLeaveDays = leaves
        .filter(leave => leave.status === 'APPROVED')
        .reduce((sum, leave) => {
            return sum + calculateWorkingDays(leave.startDate, leave.endDate);
        }, 0);
 
    const remainingLeaves = 10 - takenLeaveDays;
 
    const renderView = () => {
        switch (view) {
            case 'apply-leave':
                return (
                    <>
                        <h3 className="section-title">Apply for Leave</h3>
                        <form onSubmit={handleApplyLeave} className="leave-request-form">
                            <div className="form-group">
                                <label>Start Date</label>
                                <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} required />
                            </div>
                            <div className="form-group">
                                <label>End Date</label>
                                <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} required />
                            </div>
                            {startDate && endDate && (
                                <p className="info-text">
                                    Working days (excluding weekends & holidays): <strong>{calculateWorkingDays(startDate, endDate)}</strong>
                                </p>
                            )}
                            <div className="form-group">
                                <label>Reason</label>
                                <textarea value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Reason for leave" required></textarea>
                            </div>
                            <div className="form-group">
                                <p className="info-text">Remaining leave days: <strong>{remainingLeaves}</strong></p>
                            </div>
                            <button type="submit" className="btn">Submit Leave Request</button>
                        </form>
                    </>
                );
            case 'leave-history':
                return (
                    <>
                        <h3 className="section-title">Leave History</h3>
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>Start Date</th>
                                    <th>End Date</th>
                                    <th>Reason</th>
                                    <th>Status</th>
                                    <th>Duration</th>
                                    <th>Feedback</th>
                                </tr>
                            </thead>
                            <tbody>
                                {leaves.map(leave => (
                                    <tr key={leave.id}>
                                        <td>{leave.startDate}</td>
                                        <td>{leave.endDate}</td>
                                        <td>{leave.reason}</td>
                                        <td className={`status-${leave.status.toLowerCase()}`}>{leave.status}</td>
                                        <td>{calculateWorkingDays(leave.startDate, leave.endDate)}</td>
                                        <td>{leave.feedback || '-'}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </>
                );
            case 'attendance-metrics':
                return (
                    <>
                        <h3 className="section-title">Attendance</h3>
                        <div className="btn-group">
                            <button onClick={() => handleSwipe('IN')} className="btn">Swipe In</button>
                            <button onClick={() => handleSwipe('OUT')} className="btn btn-secondary">Swipe Out</button>
                        </div>
                        <p style={{ textAlign: 'center', marginTop: '1rem' }}>
                            Total Hours Worked: {attendanceHours.toFixed(2)}
                        </p>
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
            default:
                return (
                    <div className="stats-grid">
                        <div className="stat-card">
                            <p>Total Leaves applied</p>
                            <p className="stat-value">{totalLeaves}</p>
                        </div>
                        <div className="stat-card">
                            <p>Approved Leave Days</p>
                            <p className="stat-value">{takenLeaveDays}</p>
                        </div>
                        <div className="stat-card">
                            <p>Remaining Leaves</p>
                            <p className="stat-value">{remainingLeaves}</p>
                        </div>
                        <div className="stat-card">
                            <p>Pending Leave Requests</p>
                            <p className="stat-value">{pendingLeaves}</p>
                        </div>
                    </div>
                );
        }
    };
 
    return (
        <div className="dashboard-container">
            <div className="dashboard-header">
                <h2 className="section-title">Employee Dashboard</h2>
                <button onClick={handleLogout} className="btn btn-secondary">Logout</button>
            </div>
            <div className="employee-info-section">
                <h3 className="welcome-message">Welcome, {user.name}!</h3>
                {user.manager && (
                    <div className="manager-info-card">
                        <span className="manager-label">Reporting Manager:</span>
                        <span className="manager-name">{user.manager.name}</span>
                    </div>
                )}
            </div>
 
            <div className="nav-bar">
                <button onClick={() => setView('summary')} className={`nav-btn ${view === 'summary' ? 'active' : ''}`}>Summary</button>
                <button onClick={() => setView('apply-leave')} className={`nav-btn ${view === 'apply-leave' ? 'active' : ''}`}>Apply for Leave</button>
                <button onClick={() => setView('leave-history')} className={`nav-btn ${view === 'leave-history' ? 'active' : ''}`}>Leave History</button>
                <button onClick={() => setView('attendance-metrics')} className={`nav-btn ${view === 'attendance-metrics' ? 'active' : ''}`}>Attendance</button>
                <button onClick={() => setView('profile')} className={`nav-btn ${view === 'profile' ? 'active' : ''}`}>Profile</button>
            </div>
 
            {error && <div className="alert alert-error">{error}</div>}
            {success && <div className="alert alert-success">{success}</div>}
 
            <div className="dashboard-content">
                {renderView()}
            </div>
        </div>
    );
};
 
export default EmployeeDashboard;