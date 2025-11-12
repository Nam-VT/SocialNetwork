import { 
    useGetPendingRequestsQuery,
    useAcceptFriendRequestMutation,
    useDeclineOrCancelRequestMutation
} from '../features/user/userApiSlice';
import { Link } from 'react-router-dom';
import '../styles/FriendRequestsPage.css';

const FriendRequestItem = ({ request }) => {
    const [acceptRequest, { isLoading: isAccepting }] = useAcceptFriendRequestMutation();
    const [declineRequest, { isLoading: isDeclining }] = useDeclineOrCancelRequestMutation();
    const isLoadingAction = isAccepting || isDeclining;

    // Giả định DTO trả về có requester là một object chứa thông tin user
    const { id: requestId, requester } = request;

    return (
        <div className="request-item">
            <Link to={`/profile/${requester.id}`} className="requester-info">
                <img 
                    src={requester.avatarUrl || `https://ui-avatars.com/api/?name=${requester.displayName?.charAt(0)}`} 
                    alt="avatar" 
                    className="requester-avatar"
                />
                <span className="requester-name">{requester.displayName}</span>
            </Link>
            <div className="request-actions">
                <button onClick={() => acceptRequest(requestId)} disabled={isLoadingAction} className="btn-accept">
                    {isAccepting ? 'Accepting...' : 'Accept'}
                </button>
                <button onClick={() => declineRequest(requestId)} disabled={isLoadingAction} className="btn-decline">
                    {isDeclining ? 'Declining...' : 'Decline'}
                </button>
            </div>
        </div>
    );
};


const FriendRequestsPage = () => {
    const { data: requestsData, isLoading, isError } = useGetPendingRequestsQuery();

    if (isLoading) return <div className="page-status">Loading friend requests...</div>;
    if (isError) return <div className="page-status error">Could not load requests.</div>;

    const requests = requestsData?.content || [];
    
    return (
        <div className="friend-requests-page">
            <h1 className="page-title">Friend Requests</h1>
            {requests.length > 0 ? (
                <div className="requests-list">
                    {requests.map(req => (
                        <FriendRequestItem key={req.id} request={req} />
                    ))}
                </div>
            ) : (
                <p className="page-status">You have no pending friend requests.</p>
            )}
        </div>
    );
};

export default FriendRequestsPage;