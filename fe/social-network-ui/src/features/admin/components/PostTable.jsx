import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../../styles/admin/Tables.css';
import { useDeletePostMutation, useHidePostMutation } from '../adminApiSlice';
import CommentListModal from './CommentListModal';

const PostTable = ({ posts, refetch }) => {
    const navigate = useNavigate();
    const [deletePost] = useDeletePostMutation();
    const [hidePost] = useHidePostMutation();
    const [selectedPostId, setSelectedPostId] = useState(null);
    const [isCommentModalOpen, setIsCommentModalOpen] = useState(false);

    const openCommentModal = (postId) => {
        setSelectedPostId(postId);
        setIsCommentModalOpen(true);
    };

    const closeCommentModal = () => {
        setIsCommentModalOpen(false);
        setSelectedPostId(null);
    };

    const handleDelete = async (postId) => {
        if (window.confirm('Are you sure you want to delete this post?')) {
            try {
                await deletePost(postId).unwrap();
                alert('Post deleted');
                refetch();
            } catch (err) {
                console.error('Failed to delete post:', err);
                alert('Failed to delete post');
            }
        }
    };

    const handleHide = async (postId, currentStatus) => {
        try {
            await hidePost({ id: postId, hidden: !currentStatus }).unwrap();
            refetch();
        } catch (err) {
            console.error('Failed to update post status:', err);
        }
    };

    return (
        <div className="table-container">
            <table className="admin-table">
                <thead>
                    <tr>
                        <th style={{ width: '40%' }}>Content</th>
                        <th>Author</th>
                        <th>Stats</th>
                        <th>Created At</th>
                        <th>Status</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {posts.map((post) => (
                        <tr key={post.id}>
                            <td>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                    <span style={{
                                        display: '-webkit-box',
                                        WebkitLineClamp: 2,
                                        WebkitBoxOrient: 'vertical',
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis'
                                    }}>
                                        {post.content || 'No text content'}
                                    </span>
                                    {post.imageUrl && (
                                        <img src={post.imageUrl} alt="Post" style={{ height: 40, width: 'auto', borderRadius: 4, objectFit: 'cover' }} />
                                    )}
                                </div>
                            </td>
                            <td>
                                <div className="user-cell">
                                    <img
                                        src={post.userAvatar || `https://ui-avatars.com/api/?name=${post.userName}&background=random`}
                                        alt={post.userName}
                                        className="user-avatar-small"
                                    />
                                    <span className="user-name">{post.userName}</span>
                                </div>
                            </td>
                            <td>
                                <div style={{ fontSize: 13, color: '#6b7280' }}>
                                    <div>❤️ {post.likeCount || 0}</div>
                                    <div>💬 {post.commentCount || 0}</div>
                                </div>
                            </td>
                            <td>{new Date(post.createdAt).toLocaleDateString()}</td>
                            <td>
                                <span className={`status-badge ${post.hidden ? 'banned' : 'active'}`}>
                                    {post.hidden ? 'Hidden' : 'Visible'}
                                </span>
                            </td>
                            <td className="action-cell">
                                <div className="action-buttons">
                                    <button
                                        onClick={() => openCommentModal(post.id)}
                                        className="btn-icon btn-view"
                                        title="View Comments"
                                    >
                                        💬
                                    </button>
                                    <button
                                        onClick={() => navigate(`/post/${post.id}`)}
                                        className="btn-icon btn-view"
                                        title="View Post"
                                    >
                                        👁️
                                    </button>
                                    <button
                                        onClick={() => handleHide(post.id, post.hidden)}
                                        className={`btn-icon ${post.hidden ? 'btn-unhide' : 'btn-hide'}`}
                                        title={post.hidden ? 'Unhide Post' : 'Hide Post'}
                                    >
                                        {post.hidden ? '🔓' : '🔒'}
                                    </button>
                                    <button
                                        onClick={() => handleDelete(post.id)}
                                        className="btn-icon btn-delete"
                                        title="Delete Post"
                                    >
                                        🗑️
                                    </button>
                                </div>
                            </td>
                        </tr>
                    ))}
                    {posts.length === 0 && (
                        <tr>
                            <td colSpan="6" style={{ textAlign: 'center', padding: '32px', color: '#6b7280' }}>
                                No posts found.
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>

            <CommentListModal
                postId={selectedPostId}
                isOpen={isCommentModalOpen}
                onClose={closeCommentModal}
            />
        </div>
    );
};

export default PostTable;
