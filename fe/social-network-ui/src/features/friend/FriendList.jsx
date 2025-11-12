import { useState } from 'react';
import { useGetFriendsByUserIdQuery } from '../user/userApiSlice';
import UserSearchResultItem from '../user/UserSearchResultItem'; // Tái sử dụng component hiển thị user
import '../../styles/FriendList.css'; 

const FriendList = ({ userId }) => {
    const [page, setPage] = useState(0);
    
    // Lưu ý: Logic merge cho infinite scroll cần được thêm vào getFriendsByUserId trong slice nếu muốn tải vô hạn
    // Hiện tại, mỗi lần "Load More", nó sẽ fetch và hiển thị trang mới.
    const { data: friendsData, isLoading, isFetching, isError } = useGetFriendsByUserIdQuery({ userId, page, size: 12 });

    if (isLoading && page === 0) {
        return <p className="friend-list-status">Loading friends...</p>;
    }

    if (isError) {
        return <p className="friend-list-status error">Could not load friends.</p>;
    }

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

            {friendsData && !friendsData.last && (
                <div className="load-more-container">
                    <button onClick={() => setPage(p => p + 1)} disabled={isFetching} className="load-more-button">
                        {isFetching ? 'Loading...' : 'Load More'}
                    </button>
                </div>
            )}
        </div>
    );
};

export default FriendList;