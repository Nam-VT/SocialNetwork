import { useState } from 'react';
import { useGetChatRoomsQuery } from './chatApiSlice';
import { useParams } from 'react-router-dom';
import GroupSettingsModal from './GroupSettingsModal';
import '../../styles/ChatHeader.css';

const ChatHeader = () => {
    const { chatRoomId } = useParams();
    const { data: chatRooms = [] } = useGetChatRoomsQuery();
    const [showSettings, setShowSettings] = useState(false);

    const currentRoom = chatRooms.find(room => room.id === chatRoomId);

    if (!currentRoom) {
        return (
            <div className="chat-header">
                <h2 className="chat-room-name">Select a conversation</h2>
            </div>
        );
    }

    const isGroupChat = currentRoom.type === 'GROUP';

    return (
        <>
            <div className="chat-header">
                <div className="chat-header-info">
                    <h2 className="chat-room-name">{currentRoom.name || 'Chat'}</h2>
                    {isGroupChat && currentRoom.participantIds && (
                        <span className="member-count">
                            {currentRoom.participantIds.length} members
                        </span>
                    )}
                </div>
                {isGroupChat && (
                    <button
                        className="settings-button"
                        onClick={() => setShowSettings(true)}
                        aria-label="Group settings"
                        title="Group settings"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="12" cy="12" r="3"></circle>
                            <path d="M12 1v6m0 6v6m-6-6h6m6 0h6"></path>
                            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
                        </svg>
                    </button>
                )}
            </div>

            {showSettings && isGroupChat && (
                <GroupSettingsModal
                    chatRoom={currentRoom}
                    onClose={() => setShowSettings(false)}
                />
            )}
        </>
    );
};

export default ChatHeader;