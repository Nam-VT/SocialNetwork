import { useState } from 'react';
import Modal from '../../components/ui/Modal';
import { useCreateGroupChatRoomMutation } from './chatApiSlice';
import { useGetFriendsQuery } from '../user/userApiSlice'; // Updated path
import { useSelector } from 'react-redux';
import { selectCurrentUser } from '../auth/authSlice';
import '../../styles/CreateGroupChatModal.css';

const CreateGroupChatModal = ({ onClose }) => {
    const [name, setName] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedFriendIds, setSelectedFriendIds] = useState([]);
    const [errorMsg, setErrorMsg] = useState('');

    const currentUser = useSelector(selectCurrentUser);

    // Replace search with Get Friends Query
    const { data: friendsData, isLoading: isLoadingFriends } = useGetFriendsQuery({ page: 0, size: 100 });
    const [createGroupChatRoom, { isLoading: isCreating }] = useCreateGroupChatRoomMutation();

    const friends = friendsData?.content || [];

    // Filter friends locally - Only show if searchTerm is present
    const filteredFriends = searchTerm.trim() === ''
        ? []
        : friends.filter(friend =>
            friend.displayName?.toLowerCase().includes(searchTerm.toLowerCase())
        );

    const handleToggleFriend = (friendId) => {
        setSelectedFriendIds(prev => {
            if (prev.includes(friendId)) {
                return prev.filter(id => id !== friendId);
            } else {
                return [...prev, friendId];
            }
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrorMsg('');

        if (name.trim().length < 3) return setErrorMsg('Tên nhóm quá ngắn.');
        if (selectedFriendIds.length < 2) return setErrorMsg('Vui lòng chọn ít nhất 2 bạn bè.');

        try {
            await createGroupChatRoom({
                name: name.trim(),
                participantIds: selectedFriendIds
            }).unwrap();
            onClose();
        } catch (err) {
            setErrorMsg(err.data?.message || 'Tạo nhóm thất bại.');
        }
    };

    return (
        <Modal title="Tạo Nhóm Chat Mới" onClose={onClose}>
            <form onSubmit={handleSubmit} className="create-group-form">
                <div className="form-group">
                    <label>Tên Nhóm</label>
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Nhập tên nhóm..."
                        required
                        className="form-input"
                        minLength={3}
                    />
                </div>

                <div className="form-group">
                    <label>Chọn Thành Viên ({selectedFriendIds.length})</label>
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Tìm bạn bè..."
                        className="form-input search-friends-input"
                    />

                    <div className="friends-selection-list">
                        {isLoadingFriends ? (
                            <p className="loading-text">Đang tải...</p>
                        ) : searchTerm.trim() === '' ? (
                            null
                        ) : filteredFriends.length === 0 ? (
                            <p className="no-friends-text">Không tìm thấy bạn bè.</p>
                        ) : (
                            filteredFriends.map(friend => (
                                <div
                                    key={friend.id}
                                    className={`friend-selection-item ${selectedFriendIds.includes(friend.id) ? 'selected' : ''}`}
                                    onClick={() => handleToggleFriend(friend.id)}
                                >
                                    <input
                                        type="checkbox"
                                        checked={selectedFriendIds.includes(friend.id)}
                                        onChange={() => { }} // Handle by div click
                                        className="friend-checkbox"
                                    />
                                    <img
                                        src={friend.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(friend.displayName)}&background=random`}
                                        alt={friend.displayName}
                                        className="friend-avatar-small"
                                    />
                                    <span className="friend-name">{friend.displayName}</span>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {errorMsg && <p className="error-message submit-error">{errorMsg}</p>}

                <div className="form-actions">
                    <button type="button" onClick={onClose} className="btn-secondary">Hủy</button>
                    <button
                        type="submit"
                        disabled={isCreating || name.trim().length < 3 || selectedFriendIds.length < 2}
                        className="btn-primary"
                    >
                        {isCreating ? 'Đang tạo...' : 'Tạo Nhóm'}
                    </button>
                </div>
            </form>
        </Modal>
    );
};

export default CreateGroupChatModal;
