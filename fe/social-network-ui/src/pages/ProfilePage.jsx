import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectCurrentUser } from '../features/auth/authSlice';
import { useGetUserByIdQuery } from '../features/user/userApiSlice'; // Import thêm useGetUserByIdQuery
import UserProfileHeader from '../features/user/UserProfileHeader';
import UserPostList from '../features/post/UserPostList';
import EditProfileForm from '../features/user/EditProfileForm';
import FriendList from '../features/friend/FriendList';
import '../styles/ProfilePage.css'; // Giữ nguyên import CSS

const ProfilePage = () => {
    // Lấy userId từ URL, nó sẽ có kiểu String
    const { userId } = useParams();
    const [activeTab, setActiveTab] = useState('posts');

    const currentUser = useSelector(selectCurrentUser);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);

    // Fetch dữ liệu user mới nhất từ API để đảm bảo Edit Form luôn có data mới
    const { data: userProfile } = useGetUserByIdQuery(userId, { skip: !userId });

    // So sánh trực tiếp String với String, giờ đã chính xác
    const isOwner = currentUser?.id === userId;

    // // useEffect để xử lý phím Escape và cuộn trang khi modal mở
    // useEffect(() => {
    //     const handleEscapeKey = (event) => {
    //         if (event.key === 'Escape') {
    //             setIsEditModalOpen(false);
    //         }
    //     };

    //     if (isEditModalOpen) {
    //         document.addEventListener('keydown', handleEscapeKey);
    //         document.body.style.overflow = 'hidden';
    //         return () => {
    //             document.removeEventListener('keydown', handleEscapeKey);
    //             document.body.style.overflow = 'unset';
    //         };
    //     }
    // }, [isEditModalOpen]);

    // Xử lý trường hợp không có userId trong URL
    if (!userId) {
        return (
            <div className="page-error" role="alert" aria-live="polite">
                <div className="error-icon">
                    <svg className="error-svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                </div>
                <p className="error-text">User ID not found in URL.</p>
                <a href="/" className="error-link">Go Home</a>
            </div>
        );
    }

    return (
        <>
            <div className="profile-page">
                <UserProfileHeader userId={userId} onEditClick={() => setIsEditModalOpen(true)} />

                {/* --- HỆ THỐNG TAB MỚI --- */}
                <div className="profile-tabs">
                    <button
                        className={`tab-button ${activeTab === 'posts' ? 'active' : ''}`}
                        onClick={() => setActiveTab('posts')}
                        aria-selected={activeTab === 'posts'}
                    >
                        Posts
                    </button>
                    <button
                        className={`tab-button ${activeTab === 'friends' ? 'active' : ''}`}
                        onClick={() => setActiveTab('friends')}
                        aria-selected={activeTab === 'friends'}
                    >
                        Friends
                    </button>
                </div>

                {/* --- NỘI DUNG TAB ĐỘNG --- */}
                <div className="profile-tab-content">
                    {activeTab === 'posts' && <UserPostList userId={userId} />}
                    {activeTab === 'friends' && <FriendList userId={userId} />}
                </div>
            </div>

            {isEditModalOpen && (
                <EditProfileForm
                    user={userProfile || currentUser}
                    onClose={() => setIsEditModalOpen(false)}
                />
            )}
        </>
    );
};

export default ProfilePage;