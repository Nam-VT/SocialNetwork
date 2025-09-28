// src/features/user/UserProfileHeader.jsx

import { useGetUserByIdQuery } from './userApiSlice';
import '../../styles/UserProfileHeader.css'; // Import từ folder styles tập trung (điều chỉnh path nếu cần)

const UserProfileHeader = ({ userId }) => {
    const { 
        data: user, 
        isLoading, 
        isError 
    } = useGetUserByIdQuery(userId, { skip: !userId }); // Skip nếu !userId để tránh fetch không cần

    if (isLoading) {
        return (
            <div className="profile-loading">
                <div className="spinner-medium"></div>
                <span className="loading-text">Loading profile...</span>
            </div>
        );
    }

    if (isError || !user) {
        return (
            <div className="profile-error">
                <div className="error-icon">
                    <svg className="error-svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                </div>
                <span className="error-text">Could not load user profile.</span>
            </div>
        );
    }

    // Sử dụng chính xác các trường từ UserResponse
    const { displayName, bio, avatarUrl, coverUrl } = user;

    return (
        <div className="profile-header">
            {/* Ảnh bìa */}
            <div className="cover-section">
                {coverUrl ? (
                    <img 
                        src={coverUrl} 
                        alt={`${displayName}'s cover photo`} 
                        className="cover-img"
                        onError={(e) => { 
                            e.target.style.display = 'none'; // Ẩn nếu load lỗi, fallback gradient
                        }}
                    />
                ) : (
                    <div className="cover-placeholder" style={{ '--user-initial': displayName.charAt(0).toUpperCase() }}></div>
                )}
            </div>

            {/* Avatar và Tên */}
            <div className="profile-info">
                <div className="avatar-section">
                    <div className="avatar-wrapper">
                        <img 
                            src={avatarUrl || `https://via.placeholder.com/128x128/6B7280/FFFFFF?text=${displayName.charAt(0).toUpperCase()}`} 
                            alt={displayName || 'User  avatar'} 
                            className="avatar-img"
                            onError={(e) => { 
                                e.target.src = `https://via.placeholder.com/128x128/6B7280/FFFFFF?text=U`; // Fallback nếu load lỗi
                            }}
                        />
                    </div>
                </div>
                <div className="name-section">
                    <h1 className="profile-name">{displayName || 'Unknown User'}</h1>
                </div>
            </div>

            {/* Bio */}
            {bio && (
                <div className="bio-section">
                    <p className="profile-bio">{bio}</p>
                </div>
            )}
        </div>
    );
};

export default UserProfileHeader;