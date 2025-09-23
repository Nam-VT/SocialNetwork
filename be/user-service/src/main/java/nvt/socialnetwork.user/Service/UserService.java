package nvt.socialnetwork.user.Service;

import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import lombok.RequiredArgsConstructor;
import nvt.socialnetwork.user.Client.MediaClient;
import nvt.socialnetwork.user.DTO.Request.UserRequest;
import nvt.socialnetwork.user.DTO.Response.UserResponse;
import nvt.socialnetwork.user.Repository.UserRepo;
import nvt.socialnetwork.user.Entity.User;
import nvt.socialnetwork.common.dto.NotificationType;
import nvt.socialnetwork.common.dto.NotificationEvent;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.kafka.core.KafkaTemplate;

@Service
@RequiredArgsConstructor
public class UserService {
    private final UserRepo userRepo;
    private final MediaClient mediaClient;

    private final KafkaTemplate<String, NotificationEvent> kafkaTemplate;

    @Value("${app.kafka.user-topic}")
    private String userTopic;

    @Transactional
    public UserResponse createUserProfile(UserRequest userRequest) {
        User newUser = new User();

        // Chỉ set các trường không liên quan đến media
        newUser.setId(UUID.randomUUID().toString()); // Tạo ID ngẫu nhiên cho user mới
        newUser.setDisplayName(userRequest.getDisplayName());
        newUser.setBio(userRequest.getBio());
        newUser.setPublicEmail(userRequest.getPublicEmail());
        newUser.setPhoneNumber(userRequest.getPhoneNumber());
        newUser.setGender(userRequest.getGender());
        newUser.setBirthday(userRequest.getBirthday());
        newUser.setInterests(userRequest.getInterests());
        newUser.setLocation(userRequest.getLocation());
        newUser.setPrivateProfile(false);
        newUser.setCreatedAt(LocalDate.now());

        newUser.setAvatarId(null);
        newUser.setCoverId(null);

        User savedUser = userRepo.save(newUser);

        sendUserEvent(savedUser, NotificationType.USER_CREATED);

        return mapUserToUserResponse(savedUser);
    }

    @Transactional(readOnly = true)
    public UserResponse getUserProfileById(String userId) {
        User user = userRepo.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + userId));
        return mapUserToUserResponse(user);
    }

    @Transactional(readOnly = true)
    public UserResponse getUserProfileByDisplayName(String displayName) {
        User user = userRepo.findByDisplayName(displayName)
                .orElseThrow(() -> new RuntimeException("User not found with display name: " + displayName));
        return mapUserToUserResponse(user);
    }

    @Transactional
    public UserResponse updateUserProfile(String userId, UserRequest userRequest) {
        User user = userRepo.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + userId));

        // Xử lý avatarId
        if (userRequest.getAvatarId() != null) {
            if (userRequest.getAvatarId().isEmpty()) {
                user.setAvatarId(null); // Gỡ bỏ avatar
            } else {
                try {
                    UUID newAvatarId = UUID.fromString(userRequest.getAvatarId());
                    mediaClient.getMediaById(newAvatarId); // Xác thực
                    user.setAvatarId(newAvatarId); // Cập nhật
                } catch (Exception e) {
                    throw new RuntimeException(
                            "Invalid or non-existent media for avatarId: " + userRequest.getAvatarId(), e);
                }
            }
        }

        // Xử lý coverId
        if (userRequest.getCoverId() != null) {
            if (userRequest.getCoverId().isEmpty()) {
                user.setCoverId(null); // Gỡ bỏ cover
            } else {
                try {
                    UUID newCoverId = UUID.fromString(userRequest.getCoverId());
                    mediaClient.getMediaById(newCoverId); // Xác thực
                    user.setCoverId(newCoverId); // Cập nhật
                } catch (Exception e) {
                    throw new RuntimeException("Invalid or non-existent media for coverId: " + userRequest.getCoverId(),
                            e);
                }
            }
        }

        // Cập nhật các trường thông tin text
        user.setDisplayName(userRequest.getDisplayName());
        user.setBio(userRequest.getBio());
        user.setPublicEmail(userRequest.getPublicEmail());
        user.setPhoneNumber(userRequest.getPhoneNumber());
        user.setGender(userRequest.getGender());
        user.setBirthday(userRequest.getBirthday());
        user.setInterests(userRequest.getInterests());
        user.setLocation(userRequest.getLocation());
        user.setPrivateProfile(userRequest.isPrivateProfile());

        User updatedUser = userRepo.save(user);
        sendUserEvent(updatedUser, NotificationType.USER_UPDATED);
        return mapUserToUserResponse(updatedUser);
    }

    @Transactional
    public void deleteUserProfile(String userId) {
        if (!userRepo.existsById(userId)) {
            throw new RuntimeException("User not found with id: " + userId);
        }
        userRepo.deleteById(userId);
        NotificationEvent event = NotificationEvent.builder()
                .eventId(UUID.randomUUID().toString())
                .eventTimestamp(Instant.now())
                .type(NotificationType.USER_DELETED)
                .payload(Map.of("userId", userId))
                .build();
        kafkaTemplate.send(userTopic, event);
    }

    public boolean checkIfUserExists(String id) {
        return userRepo.existsById(id);
    }

    public List<UserResponse> findUsersByIds(List<String> userIds) {
        return userRepo.findAllById(userIds).stream()
                .map(this::mapUserToUserResponse)
                .collect(Collectors.toList());
    }

    public boolean validateUserIds(Set<String> userIds) {
    if (userIds == null || userIds.isEmpty()) return false;
    return userRepo.countByIdIn(userIds) == userIds.size();
    }

    private void sendUserEvent(User user, NotificationType type) {
        String avatarUrl = (user.getAvatarId() != null) ? "/media/" + user.getAvatarId().toString() : null;
        NotificationEvent event = NotificationEvent.builder()
                .eventId(UUID.randomUUID().toString())
                .eventTimestamp(Instant.now())
                .type(type)
                .payload(Map.of(
                    "userId", user.getId(),
                    "displayName", user.getDisplayName(),
                    "email", user.getPublicEmail(), // Hoặc email chính nếu có
                    "avatarUrl", avatarUrl
                ))
                .build();
        kafkaTemplate.send(userTopic, event);
    }

    // Phương thức private để tái sử dụng, giúp code sạch sẽ và nhất quán
    private UserResponse mapUserToUserResponse(User user) {
        if (user == null) {
            return null;
        }

        String finalAvatarUrl = "/path/to/default/avatar.png"; // Ảnh mặc định
        if (user.getAvatarId() != null) {
            finalAvatarUrl = "/media/" + user.getAvatarId().toString(); // URL tương đối
        }

        String finalCoverUrl = "/path/to/default/cover.png"; // Ảnh mặc định
        if (user.getCoverId() != null) {
            finalCoverUrl = "/media/" + user.getCoverId().toString(); // URL tương đối
        }

        return UserResponse.builder()
                .id(user.getId())
                .displayName(user.getDisplayName())
                .bio(user.getBio())
                .publicEmail(user.getPublicEmail())
                .phoneNumber(user.getPhoneNumber())
                .gender(user.getGender())
                .birthday(user.getBirthday())
                .interests(user.getInterests())
                .location(user.getLocation())
                .createdAt(user.getCreatedAt())
                .privateProfile(user.isPrivateProfile())
                .avatarUrl(finalAvatarUrl)
                .coverUrl(finalCoverUrl)
                .build();
    }
}