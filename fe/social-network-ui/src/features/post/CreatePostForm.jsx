// src/features/post/CreatePostForm.jsx

import { useState } from 'react';
import { useCreatePostMutation } from './postApiSlice';
import { useUploadMediaMutation } from '../media/mediaApiSlice';
import '../../styles/CreatePostForm.css';

const CreatePostForm = () => {
    const [content, setContent] = useState('');
    const [isPrivate, setIsPrivate] = useState(false);
    const [uploadedMedia, setUploadedMedia] = useState([]);
    const [createPost, { isLoading, isError }] = useCreatePostMutation();
    const [uploadMedia, { isLoading: isUploadingMedia }] = useUploadMediaMutation();
    const maxLength = 500;

    const handleFileChange = async (event) => {
        const files = Array.from(event.target.files);
        if (files.length === 0) return;

        // Hỗ trợ multiple files (mở rộng từ 1 file)
        for (const file of files) {
            try {
                const mediaResponse = await uploadMedia(file).unwrap();
                setUploadedMedia(prevMedia => [...prevMedia, mediaResponse]);
            } catch (err) {
                console.error('Failed to upload media:', err);
                // Có thể thêm toast error sau
            }
        }
        // Reset input để chọn lại file giống
        event.target.value = '';
    };

    const handleRemoveMedia = (mediaId) => {
        setUploadedMedia(prevMedia => prevMedia.filter(media => media.id !== mediaId));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!content.trim() || content.length > maxLength) return;

        // XÂY DỰNG BODY CHUẨN THEO PostRequest.java (include mediaIds)
        const newPostData = {
            content: content.trim(),
            isPrivate: isPrivate,
            mediaIds: uploadedMedia.map(media => media.id)
        };

        try {
            await createPost(newPostData).unwrap();
            setContent('');
            setIsPrivate(false);
            setUploadedMedia([]); // Clear media sau post thành công
        } catch (err) {
            console.error('Failed to create post:', err);
            // isError sẽ trigger alert dưới
        }
    };

    const charCount = content.length;
    const isWarning = charCount < 50 || charCount > maxLength - 50; // Warning nếu quá ngắn hoặc gần hết

    return (
        <div className="create-post-container">
            <div className="post-header">
                <h3 className="form-title">Create a post</h3>
                <p className="form-subtitle">Share what's on your mind</p>
            </div>

            <div className="post-card">
                {isError && (
                    <div className="error-alert">
                        <div className="error-icon">
                            <svg className="error-svg" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                            </svg>
                        </div>
                        <div className="error-message">
                            <p>Failed to create post. Please try again.</p>
                        </div>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="post-form">
                    <div className="form-group">
                        <label htmlFor="post-content" className="form-label">What's on your mind?</label>
                        <textarea
                            id="post-content"
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            placeholder="Share your thoughts..."
                            className={`form-textarea ${isWarning ? 'warning' : ''}`}
                            disabled={isLoading}
                            maxLength={maxLength}
                        />
                        <div className="char-counter">
                            <span className={charCount > maxLength - 50 ? 'warning' : ''}>
                                {charCount}/{maxLength}
                            </span>
                        </div>
                    </div>

                    {/* Checkbox private */}
                    <div className="form-group-checkbox">
                        <label className="checkbox-label">
                            <input
                                type="checkbox"
                                id="isPrivate"
                                checked={isPrivate}
                                onChange={(e) => setIsPrivate(e.target.checked)}
                                disabled={isLoading}
                            />
                            <span className="checkbox-icon">🔒</span>
                            <span className="checkbox-text">Private post (only you and followers can see)</span>
                        </label>
                    </div>

                    {/* Preview media */}
                    {uploadedMedia.length > 0 && (
                        <div className="media-preview">
                            {uploadedMedia.map(media => (
                                <div key={media.id} className="media-item">
                                    <img src={media.url} alt="Preview" className="media-img" />
                                    <button
                                        type="button"
                                        onClick={() => handleRemoveMedia(media.id)}
                                        className="remove-media"
                                        disabled={isUploadingMedia || isLoading}
                                        title="Remove media"
                                    >
                                        <span className="remove-icon">&times;</span>
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* File input và submit */}
                    <div className="form-actions">
                        <label htmlFor="media-upload" className="file-label" disabled={isLoading || isUploadingMedia}>
                            <span className="file-icon">
                                <svg className="upload-icon" viewBox="0 0 20 20" fill="currentColor">
                                    <path d="M10 2L3 9h6v6h4V9h6L10 2z" />
                                </svg>
                            </span>
                            <span className="file-text">
                                {isUploadingMedia ? 'Uploading...' : 'Add photo/video'}
                            </span>
                            <input
                                id="media-upload"
                                type="file"
                                accept="image/*,video/*"
                                onChange={handleFileChange}
                                disabled={isLoading || isUploadingMedia}
                                multiple // Hỗ trợ multiple
                                className="file-input"
                            />
                        </label>

                        <button type="submit" className="submit-button" disabled={isLoading || !content.trim()}>
                            <span className="button-content">
                                {isLoading ? (
                                    <>
                                        <div className="spinner"></div>
                                        <span>Processing...</span>
                                    </>
                                ) : (
                                    <span>Post</span>
                                )}
                            </span>
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreatePostForm;