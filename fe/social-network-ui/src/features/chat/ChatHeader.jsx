import { useSelector } from 'react-redux';
import { useGetChatRoomsQuery } from './chatApiSlice';
import { useGetUserByIdQuery } from '../user/userApiSlice';
import { selectCurrentUser  } from '../auth/authSlice';
import { Link } from 'react-router-dom';
import '../../styles/ChatHeader.css';

const ChatHeader = ({ chatRoomId }) => {
    const currentUser  = useSelector(selectCurrentUser );

    // Sử dụng selectFromResult để tìm phòng chat tương ứng trong cache
    const { room, isLoading: isLoadingRooms, isError: isRoomsError } = useGetChatRoomsQuery(undefined, {
        selectFromResult: ({ data: rooms }) => ({
            room: rooms?.find((r) => r.id === chatRoomId),
        }),
    });

    // Lấy thông tin của người kia nếu là chat private
    const otherUserId = room?.type === 'PRIVATE' ? room.participantIds.find(id => id !== currentUser .id) : null;
    const { data: otherUser , isLoading: isLoadingUser , isError: isUserError } = useGetUserByIdQuery(otherUserId, {
        skip: !otherUserId || !room, // Chỉ gọi khi có otherUser Id và room
    });

    // Loading state
    if (isLoadingRooms || (room && room.type === 'PRIVATE' && isLoadingUser )) {
        return (
            <div className="chat-header loading">
                <div className="header-skeleton">
                    <div className="skeleton-avatar"></div>
                    <div className="skeleton-name"></div>
                </div>
            </div>
        );
    }

    // Error state
    if (isRoomsError || (room && room.type === 'PRIVATE' && isUserError)) {
        return (
            <div className="chat-header error">
                <p>Unable to load chat info</p>
            </div>
        );
    }

    if (!room) {
        return (
            <div className="chat-header empty">
                <p>Select a conversation</p>
            </div>
        );
    }
    
    // Logic hiển thị name/subtitle/avatar
    const displayName = room.type === 'GROUP' ? room.name : (otherUser ?.displayName || 'Unknown User');
    const avatarUrl = room.type === 'GROUP' 
        ? 'https://ui-avatars.com/api/?name=U&size=48&background=6B7280&color=fff'
        : (otherUser ?.avatarUrl || 'https://ui-avatars.com/api/?name=U&size=48&background=6B7280&color=fff');
    
    const subtitle = room.type === 'GROUP' 
        ? `${room.participantIds?.length || 0} members` 
        : 'Online'; // Placeholder, có thể fetch status sau

    // Link để xem profile của người kia (nếu là chat private)
    const profileLink = room.type === 'PRIVATE' && otherUser  ? `/profile/${otherUser .id}` : '#';
    const isProfileLink = room.type === 'PRIVATE' && otherUser ;

    return (
        <div className="chat-header" role="banner">
            <Link 
                to={profileLink} 
                className={`header-link ${isProfileLink ? 'profile-link' : 'group-link'}`}
                aria-label={isProfileLink ? `View ${displayName}'s profile` : 'Group chat info'}
                title={displayName}
            >
                <img 
                    src={avatarUrl} 
                    alt={`${displayName}'s avatar`} 
                    className="chat-header-avatar"
                    width={40}
                    height={40}
                />
                <div className="header-info">
                    <h2 className="chat-header-name">{displayName}</h2>
                    <p className="chat-header-subtitle">{subtitle}</p>
                </div>
            </Link>
            {/* Có thể thêm các nút hành động ở đây (vd: video call, add members...) */}
            {/* <div className="header-actions">
                <button className="action-button" aria-label="Video call">📹</button>
                <button className="action-button" aria-label="Add members">+</button>
            </div> */}
        </div>
    );
};

export default ChatHeader;