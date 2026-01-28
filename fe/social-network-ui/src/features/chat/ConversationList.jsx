import { useState } from 'react';
import { useGetChatRoomsQuery, useFindCommonGroupRoomsQuery, useFindOrCreatePrivateRoomMutation } from './chatApiSlice';
import { useGetFriendsQuery } from '../user/userApiSlice';
import ConversationListItem from './ConversationListItem';
import CreateGroupChatModal from './CreateGroupChatModal';
import '../../styles/ConversationList.css';
import { Link, useNavigate } from 'react-router-dom';

const ConversationList = () => {
    const { data: chatRooms = [], isLoading } = useGetChatRoomsQuery();
    const { data: friendsData, isLoading: friendsLoading, error: friendsError } = useGetFriendsQuery({ page: 0, size: 100 });
    const [findOrCreatePrivateRoom] = useFindOrCreatePrivateRoomMutation();
    const [isGroupModalOpen, setIsGroupModalOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [activeTab, setActiveTab] = useState('all'); // 'all', 'friends'
    const navigate = useNavigate();

    // Debug logging
    console.log('Friends Data:', friendsData);
    console.log('Friends Loading:', friendsLoading);
    console.log('Friends Error:', friendsError);

    const friends = friendsData?.content || [];
    const filteredFriends = friends.filter(friend =>
        friend.displayName?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const filteredChatRooms = chatRooms.filter(room =>
        room.name?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleFriendClick = async (friendId) => {
        try {
            const result = await findOrCreatePrivateRoom(friendId).unwrap();
            navigate(`/chat/${result.id}`);
        } catch (error) {
            console.error('Failed to create/find private chat:', error);
        }
    };

    const handleClearSearch = () => {
        setSearchTerm('');
    };

    if (isLoading) {
        return (
            <div className="conversation-list loading">
                <div className="conversation-list-header">
                    <Link to="/" className="back-button" aria-label="Back to Dashboard">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M19 12H5"></path>
                            <polyline points="12 19 5 12 12 5"></polyline>
                        </svg>
                    </Link>
                    <h2 className="conversation-title">Chats</h2>
                    <button className="create-group-button" disabled>
                        + Group
                    </button>
                </div>
                <div className="loading-skeleton">
                    {[...Array(5)].map((_, index) => (
                        <div key={index} className="conversation-skeleton">
                            <div className="skeleton-avatar"></div>
                            <div className="skeleton-text">
                                <div className="skeleton-line"></div>
                                <div className="skeleton-line small"></div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="conversation-list">
            {/* Header with Back Button and Title */}
            <div className="conversation-list-header">
                <Link to="/" className="back-button" aria-label="Back to Dashboard">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M19 12H5"></path>
                        <polyline points="12 19 5 12 12 5"></polyline>
                    </svg>
                </Link>
                <h2 className="conversation-title">Chats</h2>
                <button
                    className="create-group-button"
                    onClick={() => setIsGroupModalOpen(true)}
                    aria-label="Create new group chat"
                >
                    + Group
                </button>
            </div>

            {/* Messenger-style Search Bar */}
            <div className="messenger-search-container">
                <div className="search-input-wrapper">
                    <svg className="search-icon" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="11" cy="11" r="8"></circle>
                        <path d="m21 21-4.35-4.35"></path>
                    </svg>
                    <input
                        type="text"
                        className="messenger-search-input"
                        placeholder="Tìm kiếm trên Messenger"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    {searchTerm && (
                        <button
                            className="clear-search-button"
                            onClick={handleClearSearch}
                            aria-label="Clear search"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <circle cx="12" cy="12" r="10"></circle>
                                <line x1="15" y1="9" x2="9" y2="15"></line>
                                <line x1="9" y1="9" x2="15" y2="15"></line>
                            </svg>
                        </button>
                    )}
                </div>
            </div>

            {/* Tabs */}
            <div className="messenger-tabs">
                <button
                    className={`messenger-tab ${activeTab === 'all' ? 'active' : ''}`}
                    onClick={() => setActiveTab('all')}
                >
                    Tất cả
                </button>
                <button
                    className={`messenger-tab ${activeTab === 'friends' ? 'active' : ''}`}
                    onClick={() => setActiveTab('friends')}
                >
                    Bạn bè
                </button>
            </div>

            {/* Content based on active tab */}
            <div className="messenger-content">
                {activeTab === 'all' ? (
                    <>
                        {/* Conversations */}
                        {filteredChatRooms.length === 0 && searchTerm ? (
                            <div className="empty-state">
                                <p>Không tìm thấy cuộc trò chuyện nào</p>
                            </div>
                        ) : filteredChatRooms.length === 0 ? (
                            <div className="empty-state">
                                <p>Chưa có cuộc trò chuyện nào</p>
                                <p className="empty-hint">Bắt đầu chat với bạn bè hoặc tạo nhóm!</p>
                            </div>
                        ) : (
                            filteredChatRooms.map((room) => (
                                <ConversationListItem key={room.id} room={room} />
                            ))
                        )}
                    </>
                ) : (
                    <>
                        {/* Friends List */}
                        {friendsLoading ? (
                            <div className="loading-state">
                                <p>Đang tải danh sách bạn bè...</p>
                            </div>
                        ) : friendsError ? (
                            <div className="error-state">
                                <p>Lỗi khi tải danh sách bạn bè</p>
                            </div>
                        ) : filteredFriends.length === 0 && searchTerm ? (
                            <div className="empty-state">
                                <p>Không tìm thấy bạn bè nào</p>
                            </div>
                        ) : filteredFriends.length === 0 ? (
                            <div className="empty-state">
                                <p>Chưa có bạn bè</p>
                                <p className="empty-hint">Thêm bạn bè để bắt đầu chat!</p>
                            </div>
                        ) : (
                            <div className="friends-grid">
                                {filteredFriends.map(friend => (
                                    <div
                                        key={friend.id}
                                        className="friend-card"
                                        onClick={() => handleFriendClick(friend.id)}
                                    >
                                        <img
                                            src={friend.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(friend.displayName || 'User')}&background=random`}
                                            alt={friend.displayName}
                                            className="friend-avatar"
                                        />
                                        <span className="friend-name">{friend.displayName}</span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </>
                )}
            </div>

            {isGroupModalOpen && (
                <CreateGroupChatModal
                    onClose={() => setIsGroupModalOpen(false)}
                />
            )}
        </div>
    );
};

export default ConversationList;