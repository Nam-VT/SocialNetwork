import { useState } from 'react';
import { useGetChatRoomsQuery } from './chatApiSlice';
import ConversationListItem from './ConversationListItem';
import CreateGroupChatModal from './CreateGroupChatModal';
import '../../styles/ConversationList.css'; // Import CSS từ src/styles/

const ConversationList = () => {
    const { data: chatRooms = [], isLoading } = useGetChatRoomsQuery();
    const [isGroupModalOpen, setIsGroupModalOpen] = useState(false);

    if (isLoading) {
        return (
            <div className="conversation-list loading">
                <div className="conversation-list-header">
                    <h2 className="conversation-title">Chats</h2>
                    <button 
                        className="create-group-button" 
                        disabled 
                        aria-label="Loading, cannot create group"
                    >
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
            <div className="conversation-list-header">
                <h2 className="conversation-title">Chats</h2>
                <button 
                    onClick={() => setIsGroupModalOpen(true)} 
                    className="create-group-button"
                    aria-label="Create new group chat"
                    title="New Group Chat"
                >
                    + Group
                </button>
            </div>
            <div className="conversation-list-items" role="list">
                {chatRooms.length > 0 ? (
                    chatRooms.map(room => (
                        <ConversationListItem key={room.id} room={room} />
                    ))
                ) : (
                    <div className="no-conversations">
                        <p>No conversations yet.</p>
                        <button 
                            onClick={() => setIsGroupModalOpen(true)} 
                            className="create-first-button"
                            aria-label="Create your first group chat"
                        >
                            Start a new group chat!
                        </button>
                    </div>
                )}
            </div>
            {isGroupModalOpen && (
                <CreateGroupChatModal onClose={() => setIsGroupModalOpen(false)} />
            )}
        </div>
    );
};

export default ConversationList;