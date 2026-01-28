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
        avatarId: '',
        coverUrl: '',
        coverId: '',
        publicEmail: '',
        phoneNumber: '',
        gender: '',
        birthday: '',
        location: '',
        interests: ''
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
                publicEmail: user.publicEmail || '',
                phoneNumber: user.phoneNumber || '',
                gender: user.gender || '',
                birthday: user.birthday || '',
                location: user.location || '',
                interests: user.interests ? user.interests.join(', ') : ''
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

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;

        const submitData = {
            id: user.id,
            displayName: formData.displayName.trim(),
            bio: formData.bio,
            avatarId: formData.avatarId,
            coverId: formData.coverId,
            publicEmail: formData.publicEmail,
            phoneNumber: formData.phoneNumber,
            gender: formData.gender,
            birthday: formData.birthday || null,
            location: formData.location,
            interests: formData.interests.split(',').map(i => i.trim()).filter(i => i),
            privateProfile: user.privateProfile // Preserve existing privacy setting
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

                {/* Header Section: Cover & Avatar */}
                <div className="profile-edit-header">
                    <div className="edit-cover-container">
                        <img
                            src={formData.coverUrl || 'https://via.placeholder.com/800x200?text=Cover+Photo'}
                            alt="Cover"
                            className="edit-cover-img"
                        />
                        <label htmlFor="cover-upload" className="edit-camera-btn cover-btn" title="Change Cover">
                            📷
                        </label>
                        <input
                            type="file"
                            id="cover-upload"
                            accept="image/*"
                            onChange={(e) => handleFileUpload(e, 'cover')}
                            disabled={isLoading}
                            style={{ display: 'none' }}
                        />
                    </div>

                    <div className="edit-avatar-container">
                        <img
                            src={formData.avatarUrl || `https://ui-avatars.com/api/?name=${formData.displayName}&background=random`}
                            alt="Avatar"
                            className="edit-avatar-img"
                        />
                        <label htmlFor="avatar-upload" className="edit-camera-btn avatar-btn" title="Change Avatar">
                            📷
                        </label>
                        <input
                            type="file"
                            id="avatar-upload"
                            accept="image/*"
                            onChange={(e) => handleFileUpload(e, 'avatar')}
                            disabled={isLoading}
                            style={{ display: 'none' }}
                        />
                    </div>
                </div>

                {/* Form Content Grid */}
                <div className="form-grid">
                    {/* Left Column: Basic Info */}
                    <div className="form-column">
                        <h4 className="section-title">Basic Information</h4>

                        <div className="form-group">
                            <label htmlFor="displayName" className="form-label">Display Name <span className="required">*</span></label>
                            <input
                                type="text"
                                id="displayName"
                                name="displayName"
                                value={formData.displayName}
                                onChange={handleInputChange}
                                className={`form-input ${errors.displayName ? 'error' : ''}`}
                                placeholder="Your name"
                            />
                            {errors.displayName && <p className="field-error">{errors.displayName}</p>}
                        </div>

                        <div className="form-group">
                            <label htmlFor="bio" className="form-label">Bio</label>
                            <textarea
                                id="bio"
                                name="bio"
                                value={formData.bio}
                                onChange={handleInputChange}
                                className={`form-textarea ${errors.bio ? 'error' : ''}`}
                                placeholder="Tell us about yourself..."
                                maxLength={maxBioLength}
                                rows={4}
                            />
                            <div className="bio-counter">
                                <span>{bioCharCount}/{maxBioLength}</span>
                            </div>
                        </div>

                        <div className="form-group">
                            <label htmlFor="location" className="form-label">Location</label>
                            <input
                                type="text"
                                id="location"
                                name="location"
                                value={formData.location}
                                onChange={handleInputChange}
                                className="form-input"
                                placeholder="City, Country"
                            />
                        </div>
                    </div>

                    {/* Right Column: Details */}
                    <div className="form-column">
                        <h4 className="section-title">Personal Details</h4>

                        <div className="form-group">
                            <label htmlFor="publicEmail" className="form-label">Public Email</label>
                            <input
                                type="email"
                                id="publicEmail"
                                name="publicEmail"
                                value={formData.publicEmail}
                                onChange={handleInputChange}
                                className="form-input"
                                placeholder="contact@example.com"
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="phoneNumber" className="form-label">Phone Number</label>
                            <input
                                type="tel"
                                id="phoneNumber"
                                name="phoneNumber"
                                value={formData.phoneNumber}
                                onChange={handleInputChange}
                                className="form-input"
                                placeholder="+84 123 456 789"
                            />
                        </div>

                        <div className="form-group-row">
                            <div className="form-group half">
                                <label htmlFor="gender" className="form-label">Gender</label>
                                <select
                                    id="gender"
                                    name="gender"
                                    value={formData.gender}
                                    onChange={handleInputChange}
                                    className="form-select"
                                >
                                    <option value="">Select</option>
                                    <option value="Male">Male</option>
                                    <option value="Female">Female</option>
                                    <option value="Other">Other</option>
                                </select>
                            </div>

                            <div className="form-group half">
                                <label htmlFor="birthday" className="form-label">Birthday</label>
                                <input
                                    type="date"
                                    id="birthday"
                                    name="birthday"
                                    value={formData.birthday}
                                    onChange={handleInputChange}
                                    className="form-input"
                                />
                            </div>
                        </div>

                        <div className="form-group">
                            <label htmlFor="interests" className="form-label">Interests</label>
                            <input
                                type="text"
                                id="interests"
                                name="interests"
                                value={formData.interests}
                                onChange={handleInputChange}
                                className="form-input"
                                placeholder="Coding, Reading, Travel (comma separated)"
                            />
                        </div>
                    </div>
                </div>

                {/* Buttons */}
                <div className="form-actions">
                    <button type="button" onClick={onClose} className="cancel-button" disabled={isLoading}>
                        Cancel
                    </button>
                    <button type="submit" className="save-button" disabled={isLoading || !formData.displayName.trim()}>
                        <span className="button-content">
                            {isLoading ? <span>Saving...</span> : <span>Save Changes</span>}
                        </span>
                    </button>
                </div>
            </form>
        </Modal>
    );
};

export default EditProfileForm;