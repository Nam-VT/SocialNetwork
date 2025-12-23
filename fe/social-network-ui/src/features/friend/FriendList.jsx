import { useState } from 'react';
// Sửa 1: Import đúng tên hook từ userApiSlice
import { useGetFriendsQuery } from '../user/userApiSlice'; 
import UserSearchResultItem from '../user/UserSearchResultItem'; 
import '../../styles/FriendList.css'; 

const FriendList = ({ userId }) => {
    const [page, setPage] = useState(0);
    const pageSize = 12;
    
    // Sửa 2: Sử dụng useGetFriendsQuery khớp với tên hàm trong userApiSlice.js
    const { 
        data: friendsData, 
        isLoading, 
        isFetching, 
        isError 
    } = useGetFriendsQuery({ 
        userId, 
        page, 
        size: pageSize 
    });

    if (isLoading && page === 0) {
        return <p className="friend-list-status">Loading friends...</p>;
    }

    if (isError) {
        return <p className="friend-list-status error">Could not load friends.</p>;
    }

    // Lấy mảng content từ Page object trả về từ Spring Boot
    const friends = friendsData?.content || [];

    return (
        <div className="friend-list-container">
            {friends.length > 0 ? (
                <div className="friend-grid">
                    {friends.map(friend => (
                        <UserSearchResultItem key={friend.id} user={friend} />
                    ))}
                </div>
            ) : (
                <p className="friend-list-status">This user has no friends to display.</p>
            )}

            {/* Logic hiển thị nút Load More dựa trên trường 'last' của Spring Boot Page */}
            {friendsData && !friendsData.last && (
                <div className="load-more-container">
                    <button 
                        onClick={() => setPage(p => p + 1)} 
                        disabled={isFetching} 
                        className="load-more-button"
                    >
                        {isFetching ? 'Loading...' : 'Load More'}
                    </button>
                </div>
            )}
        </div>
    );
};

export default FriendList;