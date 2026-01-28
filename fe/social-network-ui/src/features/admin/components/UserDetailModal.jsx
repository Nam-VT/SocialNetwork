import React from 'react';
import { useGetUserDetailsQuery } from '../adminApiSlice';
import '../../../styles/admin/UserDetailModal.css';

const UserDetailModal = ({ userId, onClose }) => {
    const { data: user, isLoading, isError } = useGetUserDetailsQuery(userId);

    if (!userId) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>User Details</h2>
                    <button className="close-btn" onClick={onClose}>&times;</button>
                </div>

                <div className="modal-body">
                    {isLoading ? (
                        <div className="loading-spinner">Loading...</div>
                    ) : isError ? (
                        <div className="error-message">Failed to load user details.</div>
                    ) : (
                        <div className="user-detail-container">
                            <div className="user-header-section">
                                <img
                                    src={user.avatarUrl || `https://ui-avatars.com/api/?name=${user.displayName}&background=random`}
                                    alt={user.displayName}
                                    className="user-avatar-large"
                                />
                                <div className="user-primary-info">
                                    <h3>{user.displayName}</h3>
                                    <span className="user-id">ID: {user.id}</span>
                                    <span className={`status-badge ${user.banned ? 'banned' : 'active'}`}>
                                        {user.banned ? 'Banned' : 'Active'}
                                    </span>
                                </div>
                            </div>

                            <div className="info-grid">
                                <div className="info-item">
                                    <label>Email</label>
                                    <p>{user.publicEmail || 'N/A'}</p>
                                </div>
                                <div className="info-item">
                                    <label>Role</label>
                                    <p>{user.role}</p>
                                </div>
                                <div className="info-item">
                                    <label>Joined Date</label>
                                    <p>{new Date(user.createdAt).toLocaleDateString()}</p>
                                </div>
                                <div className="info-item">
                                    <label>Location</label>
                                    <p>{user.location || 'N/A'}</p>
                                </div>
                                <div className="info-item">
                                    <label>Gender</label>
                                    <p>{user.gender || 'N/A'}</p>
                                </div>
                                <div className="info-item">
                                    <label>Birthday</label>
                                    <p>{user.birthday ? new Date(user.birthday).toLocaleDateString() : 'N/A'}</p>
                                </div>
                            </div>

                            <div className="bio-section">
                                <label>Bio</label>
                                <p>{user.bio || 'No bio provided.'}</p>
                            </div>
                        </div>
                    )}
                </div>

                <div className="modal-footer">
                    <button className="btn-close" onClick={onClose}>Close</button>
                </div>
            </div>
        </div>
    );
};

export default UserDetailModal;
