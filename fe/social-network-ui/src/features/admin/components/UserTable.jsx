import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../../styles/admin/Tables.css';
import { useBanUserMutation, useDeleteUserMutation } from '../adminApiSlice';
import UserDetailModal from './UserDetailModal';

const UserTable = ({ users, refetch }) => {
    const navigate = useNavigate();
    const [banUser] = useBanUserMutation();
    const [deleteUser] = useDeleteUserMutation();

    const [selectedUserId, setSelectedUserId] = useState(null);

    const handleBan = async (userId) => {
        if (window.confirm('Are you sure you want to ban/unban this user?')) {
            try {
                await banUser(userId).unwrap();
                alert('User status updated');
                refetch();
            } catch (err) {
                console.error('Failed to ban user:', err);
                alert('Failed to update user status');
            }
        }
    };

    const handleDelete = async (userId) => {
        if (window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
            try {
                await deleteUser(userId).unwrap();
                alert('User deleted successfully');
                refetch();
            } catch (err) {
                console.error('Failed to delete user:', err);
                alert('Failed to delete user');
            }
        }
    };

    return (
        <div className="table-container">
            <table className="admin-table">
                <thead>
                    <tr>
                        <th>User</th>
                        <th>Status</th>
                        <th>Created At</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {users.map((user) => (
                        <tr key={user.id}>
                            <td>
                                <div className="user-cell">
                                    <img
                                        src={user.avatarUrl || `https://ui-avatars.com/api/?name=${user.displayName}&background=random`}
                                        alt={user.displayName}
                                        className="user-avatar-small"
                                    />
                                    <div className="user-info">
                                        <span className="user-name">{user.displayName}</span>
                                        <span className="user-email">{user.publicEmail || 'No email'}</span>
                                    </div>
                                </div>
                            </td>
                            <td>
                                <span className={`status-badge ${user.banned ? 'banned' : 'active'}`}>
                                    {user.banned ? 'Banned' : 'Active'}
                                </span>
                            </td>
                            <td>
                                {new Date(user.createdAt || Date.now()).toLocaleDateString()}
                            </td>
                            <td className="action-cell">
                                <div className="action-buttons">
                                    <button
                                        onClick={() => setSelectedUserId(user.id)}
                                        className="btn-icon btn-view"
                                        title="View Details"
                                    >
                                        👁️
                                    </button>
                                    <button
                                        onClick={() => handleBan(user.id)}
                                        className={`btn-icon ${user.banned ? 'btn-unban' : 'btn-ban'}`}
                                        title={user.banned ? 'Unban User' : 'Ban User'}
                                    >
                                        {user.banned ? '🔓' : '🚫'}
                                    </button>
                                    <button
                                        onClick={() => handleDelete(user.id)}
                                        className="btn-icon btn-delete"
                                        title="Delete User"
                                    >
                                        🗑️
                                    </button>
                                </div>
                            </td>
                        </tr>
                    ))}
                    {users.length === 0 && (
                        <tr>
                            <td colSpan="4" style={{ textAlign: 'center', padding: '32px', color: '#6b7280' }}>
                                No users found.
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>

            {/* User Detail Modal */}
            {selectedUserId && (
                <UserDetailModal
                    userId={selectedUserId}
                    onClose={() => setSelectedUserId(null)}
                />
            )}
        </div>
    );
};

export default UserTable;
