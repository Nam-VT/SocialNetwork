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
    const avatarUrl = room.type === 'GROUP'
        ? `https://ui-avatars.com/api/?name=${encodeURIComponent(room.name?.charAt(0) || 'G')}&background=6b7280&color=fff&size=32`
        : (otherUser?.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(otherUser?.displayName || 'U')}&background=6b7280&color=fff&size=32`);

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