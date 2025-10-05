import { useState } from 'react';
import Modal from '../../components/ui/Modal';
import { useCreateGroupChatRoomMutation } from './chatApiSlice';
import { useLazyGetUserByDisplayNameQuery } from '../user/userApiSlice';
import { useSelector } from 'react-redux';
import { selectCurrentUser  } from '../auth/authSlice';
import '../../styles/CreateGroupChatModal.css'; // Import CSS từ src/styles/

const CreateGroupChatModal = ({ onClose }) => {
    const [name, setName] = useState('');
    const [participants, setParticipants] = useState([]); // Lưu trữ object { id, displayName }
    const [currentUsername, setCurrentUsername] = useState('');
    const [searchError, setSearchError] = useState('');
    const [errorMsg, setErrorMsg] = useState('');

    const currentUser  = useSelector(selectCurrentUser );
    const [createGroupChatRoom, { isLoading: isCreating }] = useCreateGroupChatRoomMutation();
    const [triggerSearch, { isFetching: isSearching }] = useLazyGetUserByDisplayNameQuery();

    const handleAddParticipant = async () => {
        setSearchError('');
        const trimmedUsername = currentUsername.trim();
        if (!trimmedUsername || trimmedUsername === currentUser .displayName) return;
        
        // Kiểm tra xem user đã được thêm chưa
        if (participants.some(p => p.displayName === trimmedUsername)) {
            setSearchError('User  already added.');
            return;
        }

        try {
            // Gọi lazy query để tìm user
            const user = await triggerSearch(trimmedUsername).unwrap();
            
            // Thêm user tìm thấy vào danh sách
            setParticipants(prev => [...prev, { id: user.id, displayName: user.displayName }]);
            setCurrentUsername(''); // Xóa input
        } catch (err) {
            setSearchError(`User  with name "${trimmedUsername}" not found.`);
        }
    };

    // Thêm participant khi nhấn Enter trong input
    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            handleAddParticipant();
        }
    };
    
    const handleRemoveParticipant = (userId) => {
        setParticipants(prev => prev.filter(p => p.id !== userId));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrorMsg('');
        const participantIds = participants.map(p => p.id);

        if (name.trim().length < 3) return setErrorMsg('Group name must be at least 3 characters.');
        if (participantIds.length < 2) return setErrorMsg('Group must have at least 2 other members.');

        try {
            await createGroupChatRoom({ name, participantIds }).unwrap();
            onClose();
        } catch (err) {
            setErrorMsg(err.data?.message || 'Failed to create group chat.');
        }
    };

    const isLoading = isCreating || isSearching;
    const totalMembers = participants.length + 1; // +1 cho current user
    const isNameValid = name.trim().length >= 3;
    const isParticipantsValid = participants.length >= 2;

    return (
        <Modal title="Create New Group Chat" onClose={onClose}>
            <form onSubmit={handleSubmit} className="create-group-form">
                {/* Group Name Input */}
                <div className="form-group">
                    <label htmlFor="group-name">Group Name</label>
                    <input 
                        id="group-name"
                        type="text" 
                        value={name} 
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Enter group name (min 3 characters)"
                        required 
                        className={`form-input ${!isNameValid && name.length > 0 ? 'invalid' : ''}`}
                        aria-describedby={name.length > 0 && !isNameValid ? 'name-error' : undefined}
                    />
                    {!isNameValid && name.length > 0 && (
                        <p id="name-error" className="error-message">Group name must be at least 3 characters.</p>
                    )}
                </div>

                {/* Participant Search Input */}
                <div className="form-group">
                    <label htmlFor="participant-search">Add Participants by Display Name</label>
                    <div className="search-input-group">
                        <input 
                            id="participant-search"
                            type="text" 
                            value={currentUsername}
                            onChange={(e) => setCurrentUsername(e.target.value)}
                            onKeyPress={handleKeyPress}
                            placeholder="Enter exact display name"
                            className="form-input"
                            aria-describedby={searchError ? 'search-error' : undefined}
                        />
                        <button 
                            type="button" 
                            onClick={handleAddParticipant} 
                            disabled={isSearching || !currentUsername.trim()}
                            className="add-button"
                            aria-label="Add participant"
                        >
                            {isSearching ? '...' : 'Add'}
                        </button>
                    </div>
                    {searchError && <p id="search-error" className="error-message">{searchError}</p>}
                    <small className="input-hint">Enter the exact display name to search.</small>
                </div>

                {/* Participant List */}
                <div className="form-group">
                    <label>Members ({totalMembers})</label>
                    <ul className="participant-list" role="list">
                        <li className="participant-item current-user">
                            {currentUser .displayName} <span className="user-role">(You)</span>
                        </li>
                        {participants.map(p => (
                            <li key={p.id} className="participant-item">
                                {p.displayName}
                                <button 
                                    type="button" 
                                    onClick={() => handleRemoveParticipant(p.id)} 
                                    className="remove-button"
                                    aria-label={`Remove ${p.displayName}`}
                                >
                                    &times;
                                </button>
                            </li>
                        ))}
                    </ul>
                    {!isParticipantsValid && participants.length > 0 && (
                        <p className="error-message">Group must have at least 2 other members.</p>
                    )}
                </div>
                
                {errorMsg && <p className="error-message submit-error">{errorMsg}</p>}

                <div className="form-actions">
                    <button type="button" onClick={onClose} disabled={isLoading} className="btn-secondary">
                        Cancel
                    </button>
                    <button 
                        type="submit" 
                        disabled={isLoading || !isNameValid || !isParticipantsValid}
                        className="btn-primary"
                    >
                        {isCreating ? 'Creating...' : 'Create Group'}
                    </button>
                </div>
            </form>
        </Modal>
    );
};

export default CreateGroupChatModal;