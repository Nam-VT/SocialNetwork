import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectCurrentUser  } from '../features/auth/authSlice';
import UserProfileHeader from '../features/user/UserProfileHeader';
import UserPostList from '../features/post/UserPostList';
import EditProfileForm from '../features/user/EditProfileForm';
import '../../styles/ProfilePage.css'; // Đảm bảo path đúng

const ProfilePage = () => {
    const { userId } = useParams();
    const currentUser  = useSelector(selectCurrentUser );
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);

    // Parse userId để tránh type mismatch (string vs number)
    const parsedUserId = userId ? parseInt(userId, 10) : null;
    const isOwner = currentUser ?.id === parsedUserId;

    // Close modal on Escape key (chỉ khi open)
    useEffect(() => {
        const handleEscapeKey = (event) => {
            if (event.key === 'Escape') {
                setIsEditModalOpen(false);
            }
        };

        if (isEditModalOpen) {
            document.addEventListener('keydown', handleEscapeKey);
            // Prevent body scroll khi modal open (optional UX)
            document.body.style.overflow = 'hidden';
            return () => {
                document.removeEventListener('keydown', handleEscapeKey);
                document.body.style.overflow = 'unset';
            };
        }
    }, [isEditModalOpen]);

    // Error nếu không có userId
    if (!parsedUserId) {
        return (
            <div className="page-error" role="alert" aria-live="polite">
                <div className="error-icon">
                    <svg className="error-svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                </div>
                <p className="error-text">User  ID not found in URL.</p>
                <a href="/" className="error-link">Go Home</a>
            </div>
        );
    }

    return (
        <>
            <div className="profile-page">
                <UserProfileHeader userId={parsedUserId} /> {/* Pass parsed ID */}

                {isOwner && (
                    <div className="edit-section">
                        <button 
                            onClick={() => setIsEditModalOpen(true)}
                            className="edit-button"
                            title="Edit your profile"
                            aria-label="Edit profile"
                        >
                            <span className="button-icon">
                                <svg className="edit-icon" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
                                    <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                                </svg>
                            </span>
                            <span className="button-text">Edit Profile</span>
                        </button>
                    </div>
                )}

                <UserPostList userId={parsedUserId} />
            </div>

            {/* Modal Edit Profile */}
            {isEditModalOpen && (
                <div 
                    className="modal-overlay" 
                    onClick={(e) => e.target === e.currentTarget && setIsEditModalOpen(false)}
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="modal-title"
                >
                    <div className="modal-content">
                        <div className="modal-header">
                            <h2 id="modal-title" className="modal-title">Edit Profile</h2>
                            <button 
                                onClick={() => setIsEditModalOpen(false)}
                                className="modal-close"
                                aria-label="Close modal"
                            >
                                <svg className="close-icon" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
                                    <path d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                        <EditProfileForm 
                            user={currentUser }
                            onClose={() => setIsEditModalOpen(false)}
                        />
                    </div>
                </div>
            )}
        </>
    );
};

export default ProfilePage;