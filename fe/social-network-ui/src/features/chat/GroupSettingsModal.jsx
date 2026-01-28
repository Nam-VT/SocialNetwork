import { useState } from 'react';
import { useUpdateGroupNameMutation, useDeleteGroupMutation, useLeaveGroupMutation } from './chatApiSlice';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import '../../styles/GroupSettingsModal.css';

const GroupSettingsModal = ({ chatRoom, onClose }) => {
    const [newName, setNewName] = useState(chatRoom.name || '');
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [showLeaveConfirm, setShowLeaveConfirm] = useState(false);

    const [updateGroupName, { isLoading: isUpdating }] = useUpdateGroupNameMutation();
    const [deleteGroup, { isLoading: isDeleting }] = useDeleteGroupMutation();
    const [leaveGroup, { isLoading: isLeaving }] = useLeaveGroupMutation();

    const currentUser = useSelector((state) => state.auth.user);
    const navigate = useNavigate();

    const isCreator = chatRoom.creatorId === currentUser?.id;

    const handleUpdateName = async (e) => {
        e.preventDefault();
        if (!newName.trim() || newName === chatRoom.name) return;

        try {
            await updateGroupName({ chatRoomId: chatRoom.id, name: newName.trim() }).unwrap();
            onClose();
        } catch (error) {
            console.error('Failed to update group name:', error);
            alert('Failed to update group name. You must be the group creator.');
        }
    };

    const handleDeleteGroup = async () => {
        try {
            await deleteGroup(chatRoom.id).unwrap();
            alert('Group deleted successfully');
            onClose();
            navigate('/');
        } catch (error) {
            console.error('Failed to delete group:', error);
            alert('Failed to delete group. Please try again.');
        }
    };

    const handleLeaveGroup = async () => {
        try {
            await leaveGroup(chatRoom.id).unwrap();
            alert('You have left the group.');
            onClose();
            navigate('/');
        } catch (error) {
            console.error('Failed to leave group:', error);
            alert('Failed to leave group. Please try again.');
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content group-settings-modal" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>Group Settings</h2>
                    <button className="close-button" onClick={onClose} aria-label="Close">
                        ×
                    </button>
                </div>

                <div className="modal-body">
                    {/* Group Name Section */}
                    <div className="settings-section">
                        <h3>Group Name</h3>
                        <form onSubmit={handleUpdateName}>
                            <input
                                type="text"
                                value={newName}
                                onChange={(e) => setNewName(e.target.value)}
                                placeholder="Group name"
                                disabled={!isCreator || isUpdating}
                                className="group-name-input"
                            />
                            {isCreator && (
                                <button
                                    type="submit"
                                    disabled={isUpdating || !newName.trim() || newName === chatRoom.name}
                                    className="btn-primary"
                                >
                                    {isUpdating ? 'Updating...' : 'Update Name'}
                                </button>
                            )}
                        </form>
                        {!isCreator && (
                            <p className="permission-note">Only the group creator can rename the group</p>
                        )}
                    </div>

                    {/* Members Section */}
                    <div className="settings-section">
                        <h3>Members</h3>
                        <p className="member-count">{chatRoom.participantIds?.length || 0} members</p>
                    </div>

                    {/* Danger Zone */}
                    <div className="settings-section danger-zone">
                        <h3>Danger Zone</h3>
                        {isCreator ? (
                            !showDeleteConfirm ? (
                                <button
                                    onClick={() => setShowDeleteConfirm(true)}
                                    className="btn-danger"
                                    disabled={isDeleting}
                                >
                                    Delete Group
                                </button>
                            ) : (
                                <div className="delete-confirm">
                                    <p className="warning-text">
                                        ⚠️ This will permanently delete the group and all messages. This action cannot be undone.
                                    </p>
                                    <div className="confirm-buttons">
                                        <button
                                            onClick={handleDeleteGroup}
                                            className="btn-danger-confirm"
                                            disabled={isDeleting}
                                        >
                                            {isDeleting ? 'Deleting...' : 'Yes, Delete Group'}
                                        </button>
                                        <button
                                            onClick={() => setShowDeleteConfirm(false)}
                                            className="btn-cancel"
                                            disabled={isDeleting}
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </div>
                            )
                        ) : (
                            !showLeaveConfirm ? (
                                <button
                                    onClick={() => setShowLeaveConfirm(true)}
                                    className="btn-danger"
                                    disabled={isLeaving}
                                >
                                    Leave Group
                                </button>
                            ) : (
                                <div className="delete-confirm">
                                    <p className="warning-text">
                                        Are you sure you want to leave this group?
                                    </p>
                                    <div className="confirm-buttons">
                                        <button
                                            onClick={handleLeaveGroup}
                                            className="btn-danger-confirm"
                                            disabled={isLeaving}
                                        >
                                            {isLeaving ? 'Leaving...' : 'Yes, Leave Group'}
                                        </button>
                                        <button
                                            onClick={() => setShowLeaveConfirm(false)}
                                            className="btn-cancel"
                                            disabled={isLeaving}
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </div>
                            )
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default GroupSettingsModal;
