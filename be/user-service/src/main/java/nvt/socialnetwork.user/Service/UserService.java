package nvt.socialnetwork.user.Service;

import java.time.Instant;
import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import lombok.RequiredArgsConstructor;
import nvt.socialnetwork.common.dto.NotificationEvent;
import nvt.socialnetwork.common.dto.NotificationType;
import nvt.socialnetwork.user.Client.MediaClient;
import nvt.socialnetwork.user.DTO.Request.UserRequest;
import nvt.socialnetwork.user.DTO.Response.UserResponse;
import nvt.socialnetwork.user.Entity.User;
import nvt.socialnetwork.user.Repository.UserRepo;

@Service
@RequiredArgsConstructor
public class UserService {
    public Map<String, Object> getAdminStats() {
        Map<String, Object> stats = new HashMap<>();
        stats.put("totalUsers", userRepo.count());
        stats.put("newUsersToday", userRepo.countByCreatedAt(LocalDate.now()));
        return stats;
    }

    private final UserRepo userRepo;
    private final MediaClient mediaClient;

    private final KafkaTemplate<String, NotificationEvent> kafkaTemplate;

    @Value("${app.kafka.user-topic}")
    private String userTopic;

    private static final String GATEWAY_URL = "http://localhost:8080";

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
    public UserResponse getCurrentUserProfileById(Authentication authentication) {
        String userId = authentication.getName();
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
        if (userIds == null || userIds.isEmpty())
            return false;
        return userRepo.countByIdIn(userIds) == userIds.size();
    }

    @Transactional
    public UserResponse createUser(String id, String imageUrl) {
        User newUser = new User();

        newUser.setId(id);
        newUser.setDisplayName("New User");
        newUser.setBio("");
        newUser.setPublicEmail("");
        newUser.setPhoneNumber("");
        newUser.setGender("");
        newUser.setBirthday(null);
        newUser.setInterests(List.of());
        newUser.setLocation("");
        newUser.setPrivateProfile(false);
        newUser.setCreatedAt(LocalDate.now());

        newUser.setCoverId(null);

        User savedUser = userRepo.save(newUser);

        return mapUserToUserResponse(savedUser);
    }

    @Transactional
    public UserResponse getUserProfileById(String id) {
        User user = userRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + id));
        return mapUserToUserResponse(user);
    }

    private void sendUserEvent(User user, NotificationType type) {
        // 1. Xử lý logic lấy Avatar URL
        String avatarUrl = (user.getAvatarId() != null)
                ? GATEWAY_URL + "/media/" + user.getAvatarId().toString()
                : null;

        // 2. Sử dụng HashMap thay cho Map.of để cho phép giá trị null
        Map<String, Object> payload = new HashMap<>();
        payload.put("userId", user.getId());

        // HashMap chấp nhận null, nên không lo bị crash
        payload.put("displayName", user.getDisplayName());
        payload.put("email", user.getPublicEmail() != null ? user.getPublicEmail() : user.getPublicEmail());
        payload.put("avatarUrl", avatarUrl);

        // 3. Tạo Event
        NotificationEvent event = NotificationEvent.builder()
                .eventId(UUID.randomUUID().toString())
                .eventTimestamp(Instant.now())
                .type(type)
                .payload(payload)
                .build();

        // 4. Gửi Kafka
        kafkaTemplate.send(userTopic, event);
    }

    // Phương thức private để tái sử dụng, giúp code sạch sẽ và nhất quán
    public UserResponse mapUserToUserResponse(User user) {
        if (user == null) {
            return null;
        }

        String finalAvatarUrl = null;
        if (user.getAvatarId() != null) {
            finalAvatarUrl = GATEWAY_URL + "/media/" + user.getAvatarId().toString();
        }

        String finalCoverUrl = null;
        if (user.getCoverId() != null) {
            finalCoverUrl = GATEWAY_URL + "/media/" + user.getCoverId().toString();
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
                .role(user.getRole())
                .banned(user.isBanned())
                .build();
    }

    @Transactional
    public void banUser(String userId) {
        User user = userRepo.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        // Toggle banned status
        user.setBanned(!user.isBanned());
        userRepo.save(user);
    }

    public org.springframework.data.domain.Page<UserResponse> searchUsers(String keyword,
            org.springframework.data.domain.Pageable pageable) {
        return userRepo.findByDisplayNameContainingIgnoreCase(keyword, pageable)
                .map(this::mapUserToUserResponse);
    }
}