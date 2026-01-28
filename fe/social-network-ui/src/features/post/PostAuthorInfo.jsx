import { useGetUserByIdQuery } from '../user/userApiSlice';

import { Link } from 'react-router-dom'; // Dùng Link để có thể click vào trang cá nhân
import '../../styles/PostAuthorInfo.css'; // Import từ folder styles tập trung (điều chỉnh path nếu cần)

const PostAuthorInfo = ({ userId }) => {
    // Gọi API để lấy chi tiết user từ userId
    const {
        data: user,
        isLoading,
        isError
    } = useGetUserByIdQuery(userId, {
        // Không gọi lại API nếu userId đã có trong cache
        skip: !userId
    });

    if (isLoading) {
        return (
            <div className="author-loading">
                <div className="spinner-small"></div>
                <span className="loading-text">Loading author...</span>
            </div>
        );
    }

    if (isError || !user) {
        return (
            <div className="author-error">
                <div className="error-icon">
                    <svg className="error-svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                </div>
                <span className="error-text">Unknown Author</span>
            </div>
        );
    }

    // Sử dụng chính xác các trường từ UserResponse
    const { id, displayName, avatarUrl } = user;

    return (
        <div className="author-info">
            <div className="author-avatar">
                <img
                    src={avatarUrl || `https://ui-avatars.com/api/?name=${displayName?.charAt(0) || 'U'}&size=48&background=6B7280&color=fff`}
                    alt={displayName || 'User '}
                    className="author-avatar-img"
                    onError={(e) => {
                        e.target.src = `https://ui-avatars.com/api/?name=${displayName?.charAt(0) || 'U'}&size=48&background=6B7280&color=fff`; // Fallback lại nếu cả link chính lỗi
                    }}
                />
            </div>
            <div className="author-details">
                {/* Link đến trang cá nhân của user */}
                <Link to={`/profile/${id}`} className="author-link" title={`View ${displayName}'s profile`}>
                    <p className="author-name">{displayName || 'Anonymous'}</p>
                </Link>
            </div>
        </div>
    );
};

export default PostAuthorInfo;