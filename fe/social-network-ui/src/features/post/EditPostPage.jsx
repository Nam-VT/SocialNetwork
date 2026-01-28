import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useGetPostByIdQuery, useUpdatePostMutation } from './postApiSlice';
import { useUploadMediaMutation } from '../media/mediaApiSlice';
import '../../styles/CreatePostForm.css'; // Reuse styles

const EditPostPage = () => {
    const { postId } = useParams();
    const navigate = useNavigate();

    const { data: post, isLoading: isLoadingPost, isError: isLoadError } = useGetPostByIdQuery(postId);
    const [updatePost, { isLoading: isUpdating, isError: isUpdateError }] = useUpdatePostMutation();
    const [uploadMedia, { isLoading: isUploadingMedia }] = useUploadMediaMutation();

    const [content, setContent] = useState('');
    const [isPrivate, setIsPrivate] = useState(false);
    const [uploadedMedia, setUploadedMedia] = useState([]);

    // Load initial data
    useEffect(() => {
        if (post) {
            setContent(post.content || '');
            setIsPrivate(post.isPrivate || false);
            if (post.mediaUrls) {

            }
        }
    }, [post]);

    const handleFileChange = async (event) => {
        const files = Array.from(event.target.files);
        if (files.length === 0) return;

        for (const file of files) {
            try {
                const mediaResponse = await uploadMedia(file).unwrap();
                setUploadedMedia(prevMedia => [...prevMedia, mediaResponse]);
            } catch (err) {
                console.error('Failed to upload media:', err);
            }
        }
        event.target.value = '';
    };

    const handleRemoveMedia = (mediaId) => {
        setUploadedMedia(prevMedia => prevMedia.filter(media => media.id !== mediaId));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!content.trim()) return;


        const updateData = {
            id: postId,
            content: content.trim(),
            isPrivate: isPrivate,

        };

        if (uploadedMedia.length > 0) {
            updateData.mediaIds = uploadedMedia.map(m => m.id);
        }

        try {
            await updatePost(updateData).unwrap();
            navigate('/'); // redirect home
        } catch (err) {
            console.error('Failed to update post:', err);
        }
    };

    if (isLoadingPost) return <div className="p-4">Loading post...</div>;
    if (isLoadError || !post) return <div className="p-4">Post not found</div>;

    return (
        <div className="create-post-container" style={{ maxWidth: '600px', margin: '20px auto' }}>
            <div className="post-header">
                <h3 className="form-title">Edit Post</h3>
            </div>

            <div className="post-card">
                <form onSubmit={handleSubmit} className="post-form">
                    <div className="form-group">
                        <textarea
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            className="form-textarea"
                            placeholder="What's on your mind?"
                            rows={4}
                        />
                    </div>

                    <div className="form-group-checkbox">
                        <label className="checkbox-label">
                            <input
                                type="checkbox"
                                checked={isPrivate}
                                onChange={(e) => setIsPrivate(e.target.checked)}
                            />
                            <span className="checkbox-text">Private post</span>
                        </label>
                    </div>

                    {/* New Media Preview */}
                    {uploadedMedia.length > 0 && (
                        <div className="media-preview">
                            {uploadedMedia.map(media => (
                                <div key={media.id} className="media-item">
                                    <img src={media.url} alt="New" className="media-img" />
                                    <button
                                        type="button"
                                        onClick={() => handleRemoveMedia(media.id)}
                                        className="remove-media"
                                    >
                                        &times;
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}

                    <div className="form-actions">
                        <label className="file-label">
                            <span className="file-text">
                                {isUploadingMedia ? 'Uploading...' : 'Add photos'}
                            </span>
                            <input
                                type="file"
                                accept="image/*,video/*"
                                onChange={handleFileChange}
                                disabled={isUploadingMedia}
                                multiple
                                className="file-input"
                            />
                        </label>

                        <div style={{ display: 'flex', gap: '10px' }}>
                            <button type="button" className="submit-button"
                                style={{ background: '#6b7280' }}
                                onClick={() => navigate(-1)}>
                                Cancel
                            </button>
                            <button type="submit" className="submit-button" disabled={isUpdating}>
                                {isUpdating ? 'Saving...' : 'Save Changes'}
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditPostPage;
