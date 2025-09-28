import { useParams } from 'react-router-dom';
import UserProfileHeader from '../features/user/UserProfileHeader';
import UserPostList from '../features/post/UserPostList';
import '../../styles/ProfilePage.css';

const ProfilePage = () => {
    const { userId } = useParams();

    if (!userId) {
        return (
            <div className="page-error">
                <div className="error-icon">
                    <svg className="error-svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                </div>
                <p className="error-text">User  ID not found in URL.</p>
            </div>
        );
    }

    return (
        <div className="profile-page">
            <UserProfileHeader userId={userId} />
            <UserPostList userId={userId} />
        </div>
    );
};

export default ProfilePage;