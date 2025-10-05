// src/features/chat/ConversationListItem.jsx

import { NavLink } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectCurrentUser } from '../auth/authSlice';
import { useGetUserByIdQuery } from '../user/userApiSlice';

const ConversationListItem = ({ room }) => {
    const currentUser = useSelector(selectCurrentUser);
    const { id, type, name, participantIds, lastMessage } = room;

    // Xác định thông tin của người kia (đối với chat private)
    const otherUserId = type === 'PRIVATE' ? participantIds.find(pid => pid !== currentUser.id) : null;
    const { data: otherUser, isLoading: isLoadingUser } = useGetUserByIdQuery(otherUserId, {
        skip: !otherUserId, // Chỉ gọi API nếu là chat private
    });

    const displayName = type === 'GROUP' ? name : (otherUser?.displayName || '...');
    const avatarUrl = type === 'GROUP' 
        ? 'https://via.placeholder.com/48/8B5CF6/FFFFFF?text=G' // Avatar nhóm mặc định
        : (otherUser?.avatarUrl || 'https://via.placeholder.com/48');

    return (
        <NavLink 
            to={`/chat/${id}`} 
            className={({ isActive }) => `conversation-item ${isActive ? 'active' : ''}`}
        >
            <img src={avatarUrl} alt="Avatar" className="conversation-avatar" />
            <div className="conversation-details">
                <p className="conversation-name">{displayName}</p>
                <small className="conversation-last-message">{lastMessage || 'No messages yet.'}</small>
            </div>
        </NavLink>
    );
};

export default ConversationListItem;