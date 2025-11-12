// src/features/user/EditProfileForm.jsx

import { useState, useEffect } from 'react';
import { useUpdateUserProfileMutation } from './userApiSlice';
import { useUploadMediaMutation } from '../media/mediaApiSlice';
import Modal from '../../components/ui/Modal';
import '../../styles/EditProfileForm.css';

const EditProfileForm = ({ user, onClose }) => {
    const [formData, setFormData] = useState({
        displayName: '',
        bio: '',
        avatarUrl: '',
        avatarId: '',  // <-- Thêm
        coverUrl: '',
        coverId: ''    // <-- Thêm
    });

    const [errors, setErrors] = useState({}); // State cho errors
    const [updateUserProfile, { isLoading: isUpdating }] = useUpdateUserProfileMutation();
    const [uploadMedia, { isLoading: isUploading }] = useUploadMediaMutation();
    const maxBioLength = 160;

    // Điền dữ liệu ban đầu
    useEffect(() => {
        if (user) {
            setFormData({
                displayName: user.displayName || '',
                bio: user.bio || '',
                avatarUrl: user.avatarUrl || '',
                avatarId: user.avatarId || null,
                coverUrl: user.coverUrl || '',
                coverId: user.coverId || null,
            });
            setErrors({});
        }
    }, [user]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        // Clear error khi user type
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const validateForm = () => {
        const newErrors = {};
        if (!formData.displayName.trim()) {
            newErrors.displayName = 'Display name is required.';
        }
        if (formData.bio.length > maxBioLength) {
            newErrors.bio = `Bio must be ${maxBioLength} characters or less.`;
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleFileUpload = async (e, fieldPrefix) => {
        const file = e.target.files[0];
        if (!file) return;
        e.target.value = '';

        try {
            const mediaResponse = await uploadMedia(file).unwrap();
            setFormData(prev => ({ 
                ...prev, 
                [`${fieldPrefix}Url`]: mediaResponse.url,
                [`${fieldPrefix}Id`]: mediaResponse.id
            }));
        } catch (err) {
            console.error(`Failed to upload ${fieldPrefix}:`, err);
            setErrors(prev => ({ ...prev, general: `Failed to upload ${fieldPrefix}.` }));
        }
    };

    const handleRemoveMedia = (fieldPrefix) => {
        setFormData(prev => ({
            ...prev,
            [`${fieldPrefix}Url`]: '',
            [`${fieldPrefix}Id`]: ''
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;

        const submitData = { 
            id: user.id,
            displayName: formData.displayName.trim(),
            bio: formData.bio,
            avatarId: formData.avatarId,
            coverId: formData.coverId,
        };

        try {
            await updateUserProfile(submitData).unwrap();
            onClose();
        } catch (err) {
            console.error('Failed to update profile:', err);
            setErrors({ general: 'Failed to update profile. Please try again.' });
        }
    };

    const isLoading = isUpdating || isUploading;
    const bioCharCount = formData.bio.length;
    const isBioWarning = bioCharCount > maxBioLength - 20;

    return (
        <Modal title="Edit Profile" onClose={onClose}>
            <form onSubmit={handleSubmit} className="edit-form">
                {errors.general && (
                    <div className="error-alert">
                        <div className="error-icon">
                            <svg className="error-svg" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                            </svg>
                        </div>
                        <p className="error-message">{errors.general}</p>
                    </div>
                )}

                {/* Display Name */}
                <div className="form-group">
                    <label htmlFor="displayName" className="form-label">
                        <span className="label-icon">👤</span>
                        Display Name <span className="required">*</span>
                    </label>
                    <input 
                        type="text" 
                        id="displayName"
                        name="displayName"
                        value={formData.displayName}
                        onChange={handleInputChange}
                        className={`form-input ${errors.displayName ? 'error' : ''}`}
                        placeholder="Enter your display name"
                        aria-required="true"
                        aria-describedby={errors.displayName ? "displayName-error" : undefined}
                        disabled={isLoading}
                    />
                    {errors.displayName && (
                        <p id="displayName-error" className="field-error">{errors.displayName}</p>
                    )}
                </div>

                {/* Bio */}
                <div className="form-group">
                    <label htmlFor="bio" className="form-label">
                        <span className="label-icon">📝</span>
                        Bio
                    </label>
                    <textarea 
                        id="bio"
                        name="bio"
                        value={formData.bio}
                        onChange={handleInputChange}
                        className={`form-textarea ${errors.bio ? 'error' : ''} ${isBioWarning ? 'warning' : ''}`}
                        placeholder="Tell us about yourself..."
                        maxLength={maxBioLength}
                        rows={3}
                        disabled={isLoading}
                        aria-describedby={errors.bio ? "bio-error" : undefined}
                    />
                    <div className="bio-counter">
                        <span className={isBioWarning ? 'warning' : ''}>{bioCharCount}/{maxBioLength}</span>
                    </div>
                    {errors.bio && (
                        <p id="bio-error" className="field-error">{errors.bio}</p>
                    )}
                </div>

                <div className="form-group">
                    <label htmlFor="avatar">Avatar</label>
                    <input type="file" id="avatar" accept="image/*" onChange={(e) => handleFileUpload(e, 'avatar')} disabled={isLoading} />
                    {formData.avatarUrl && (
                        <div className="preview-container">
                            <img src={formData.avatarUrl} alt="Avatar preview" />
                            <button type="button" onClick={() => handleRemoveMedia('avatar')} disabled={isLoading}>×</button>
                        </div>
                    )}
                </div>

                {/* Cover Photo */}
                <div className="form-group">
                    <label htmlFor="cover">Cover Photo</label>
                    <input type="file" id="cover" accept="image/*" onChange={(e) => handleFileUpload(e, 'cover')} disabled={isLoading} />
                    {formData.coverUrl && (
                        <div className="preview-container">
                            <img src={formData.coverUrl} alt="Cover preview" />
                            <button type="button" onClick={() => handleRemoveMedia('cover')} disabled={isLoading}>×</button>
                        </div>
                    )}
                </div>

                {/* Buttons */}
                <div className="form-actions">
                    <button type="button" onClick={onClose} className="cancel-button" disabled={isLoading}>
                        <span className="button-icon">✕</span>
                        Cancel
                    </button>
                    <button type="submit" className="save-button" disabled={isLoading || !formData.displayName.trim()}>
                        <span className="button-content">
                            {isLoading ? (
                                <>
                                    <div className="spinner-small"></div>
                                    <span>Saving...</span>
                                </>
                            ) : (
                                <>
                                    <span className="button-icon">💾</span>
                                    <span>Save Changes</span>
                                </>
                            )}
                        </span>
                    </button>
                </div>
            </form>
        </Modal>
    );
};

export default EditProfileForm;