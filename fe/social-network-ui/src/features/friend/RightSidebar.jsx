// src/features/friend/RightSidebar.jsx
import { useSelector } from 'react-redux';
import { selectCurrentUser } from '../auth/authSlice';
import { 
    useGetFriendsQuery, 
    useGetFriendSuggestionsQuery, 
    useSendFriendRequestMutation 
} from '../user/userApiSlice';
import { Link } from 'react-router-dom';
import '../../styles/RightSidebar.css';

const RightSidebar = () => {
    const currentUser = useSelector(selectCurrentUser);
    
    // 1. Lấy danh sách bạn bè (Dùng API getFriends đã có)
    const { data: friendsData } = useGetFriendsQuery(
        { userId: currentUser?.id, size: 10 }, 
        { skip: !currentUser?.id }
    );
    
    // 2. Lấy danh sách gợi ý (Dùng API suggestions bạn mới thêm)
    const { data: suggestionsData, isLoading: isSugLoading } = useGetFriendSuggestionsQuery(
        { size: 5 }, 
        { skip: !currentUser }
    );
    
    const [sendRequest, { isLoading: isSending }] = useSendFriendRequestMutation();

    const handleAddFriend = async (targetId) => {
        try {
            await sendRequest(targetId).unwrap();
        } catch (err) {
            console.error("Failed to send friend request:", err);
        }
    };

    return (
        <aside className="right-sidebar">
            {/* Khối Gợi ý kết bạn */}
            <div className="sidebar-section">
                <h3 className="section-title">Người bạn có thể biết</h3>
                {isSugLoading ? (
                    <div className="sidebar-loader">Đang tải...</div>
                ) : (
                    <div className="item-list">
                        {suggestionsData?.content?.map(user => (
                            <div key={user.id} className="suggestion-card">
                                <img 
                                    src={user.avatarUrl || '/default-avatar.png'} 
                                    alt={user.displayName} 
                                    className="avatar-sm" 
                                />
                                <div className="info">
                                    <Link to={`/profile/${user.id}`} className="name">
                                        {user.displayName}
                                    </Link>
                                    <button 
                                        onClick={() => handleAddFriend(user.id)}
                                        disabled={isSending}
                                        className="btn-add"
                                    >
                                        Thêm bạn bè
                                    </button>
                                </div>
                            </div>
                        ))}
                        {suggestionsData?.content?.length === 0 && (
                            <p className="empty-text">Không có gợi ý mới.</p>
                        )}
                    </div>
                )}
            </div>

            {/* Khối Danh sách bạn bè */}
            <div className="sidebar-section">
                <h3 className="section-title">Bạn bè</h3>
                <div className="item-list">
                    {friendsData?.content?.map(friend => (
                        <Link key={friend.id} to={`/profile/${friend.id}`} className="friend-mini-item">
                            <div className="avatar-wrapper">
                                <img 
                                    src={friend.avatarUrl || '/default-avatar.png'} 
                                    alt={friend.displayName} 
                                    className="avatar-sm" 
                                />
                                <span className="status-dot online"></span>
                            </div>
                            <span className="friend-name">{friend.displayName}</span>
                        </Link>
                    ))}
                    {friendsData?.content?.length === 0 && (
                        <p className="empty-text">Chưa có bạn bè.</p>
                    )}
                </div>
            </div>
        </aside>
    );
};

export default RightSidebar;