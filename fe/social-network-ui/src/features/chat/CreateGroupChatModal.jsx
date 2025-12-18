import { useState } from 'react';
import Modal from '../../components/ui/Modal';
import { useCreateGroupChatRoomMutation } from './chatApiSlice';
import { useLazyGetUserByDisplayNameQuery } from '../user/userApiSlice';
import { useSelector } from 'react-redux';
import { selectCurrentUser } from '../auth/authSlice';
import '../../styles/CreateGroupChatModal.css';

const CreateGroupChatModal = ({ onClose }) => {
    const [name, setName] = useState('');
    const [participants, setParticipants] = useState([]);
    const [currentUsername, setCurrentUsername] = useState('');
    const [searchError, setSearchError] = useState('');
    const [errorMsg, setErrorMsg] = useState('');

    const currentUser = useSelector(selectCurrentUser);
    
    // Mutations & Queries
    const [createGroupChatRoom, { isLoading: isCreating }] = useCreateGroupChatRoomMutation();
    
    // Trigger search sẽ dùng useLazy... để tìm kiếm khi nhấn nút Add
    const [triggerSearch, { isFetching: isSearching }] = useLazyGetUserByDisplayNameQuery();

    const handleAddParticipant = async () => {
        setSearchError('');
        const trimmedUsername = currentUsername.trim();
        
        if (!trimmedUsername) return;
        
        // Không cho phép tự thêm chính mình
        if (trimmedUsername === currentUser?.displayName) {
            setSearchError("You cannot add yourself to the group.");
            return;
        }
        
        // Kiểm tra xem user đã có trong danh sách tạm chưa
        if (participants.some(p => p.displayName.toLowerCase() === trimmedUsername.toLowerCase())) {
            setSearchError('User already added to list.');
            return;
        }

        try {
            // Thực hiện tìm kiếm user từ Backend
            const result = await triggerSearch(trimmedUsername).unwrap();
            
            if (result) {
                setParticipants(prev => [...prev, { id: result.id, displayName: result.displayName }]);
                setCurrentUsername('');
            }
        } catch (err) {
            setSearchError(`User "${trimmedUsername}" not found.`);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrorMsg('');
        
        const participantIds = participants.map(p => p.id);

        if (name.trim().length < 3) return setErrorMsg('Group name is too short.');
        if (participantIds.length < 2) return setErrorMsg('Please add at least 2 other members.');

        try {
            await createGroupChatRoom({ 
                name: name.trim(), 
                participantIds 
            }).unwrap();
            onClose();
        } catch (err) {
            setErrorMsg(err.data?.message || 'Failed to create group chat.');
        }
    };

    const isLoading = isCreating || isSearching;

    return (
        <Modal title="Create New Group Chat" onClose={onClose}>
            <form onSubmit={handleSubmit} className="create-group-form">
                <div className="form-group">
                    <label>Group Name</label>
                    <input 
                        type="text" 
                        value={name} 
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Group name (min 3 chars)"
                        required 
                        className="form-input"
                    />
                </div>

                <div className="form-group">
                    <label>Add Members (by Display Name)</label>
                    <div className="search-input-group">
                        <input 
                            type="text" 
                            value={currentUsername}
                            onChange={(e) => setCurrentUsername(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddParticipant())}
                            placeholder="Enter exact name..."
                            className="form-input"
                        />
                        <button 
                            type="button" 
                            onClick={handleAddParticipant} 
                            disabled={isSearching || !currentUsername.trim()}
                            className="add-button"
                        >
                            {isSearching ? '...' : 'Add'}
                        </button>
                    </div>
                    {searchError && <p className="error-message">{searchError}</p>}
                </div>

                <div className="form-group">
                    <label>Selected Members ({participants.length + 1})</label>
                    <ul className="participant-list">
                        <li className="participant-item current-user">
                            {currentUser?.displayName} (You)
                        </li>
                        {participants.map(p => (
                            <li key={p.id} className="participant-item">
                                {p.displayName}
                                <button 
                                    type="button" 
                                    onClick={() => setParticipants(prev => prev.filter(item => item.id !== p.id))} 
                                    className="remove-button"
                                >
                                    &times;
                                </button>
                            </li>
                        ))}
                    </ul>
                </div>
                
                {errorMsg && <p className="error-message submit-error">{errorMsg}</p>}

                <div className="form-actions">
                    <button type="button" onClick={onClose} className="btn-secondary">Cancel</button>
                    <button 
                        type="submit" 
                        disabled={isLoading || name.trim().length < 3 || participants.length < 2}
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