package nvt.socialnetwork.follow.Service;

import java.time.Instant;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import lombok.RequiredArgsConstructor;
import nvt.socialnetwork.common.dto.NotificationType;
import nvt.socialnetwork.follow.Client.UserClient;
import nvt.socialnetwork.common.dto.NotificationEvent;
import nvt.socialnetwork.follow.Dto.Response.FollowStatusResponse;
import nvt.socialnetwork.follow.Dto.Response.UserResponse;
import nvt.socialnetwork.follow.Entity.Follow;
import nvt.socialnetwork.follow.Exception.ResourceNotFoundException;
import nvt.socialnetwork.follow.Repository.FollowRepo;

@Service
@RequiredArgsConstructor
public class FollowService {

    private final FollowRepo followRepository;
    private final UserClient userClient;

    private final KafkaTemplate<String, NotificationEvent> kafkaTemplate;

    @Value("${app.kafka.notification-topic}")
    private String notificationTopic;

    @Transactional
    public void followUser(String followingId, Authentication authentication) {
        String followerId = authentication.getName();

        if (followerId.equals(followingId)) {
            throw new IllegalArgumentException("You cannot follow yourself.");
        }

        ResponseEntity<Boolean> response = userClient.checkUserExists(followingId);
        Boolean userExists = response.getBody();
        if (!response.getStatusCode().is2xxSuccessful() || userExists == null || !userExists) {
            throw new ResourceNotFoundException(
                    "User with ID '" + followingId + "' not found or user service is unavailable.");
        }

        if (followRepository.existsByFollowerIdAndFollowingId(followerId, followingId)) {
            return;
        }

        Follow followRelationship = Follow.builder()
                .followerId(followerId)
                .followingId(followingId)
                .build();

        followRepository.save(followRelationship);

        sendFollowNotificationEvent(followerId, followingId);
    }

    @Transactional
    public void unfollowUser(String followingId, Authentication authentication) {
        String followerId = authentication.getName();
        followRepository.deleteByFollowerIdAndFollowingId(followerId, followingId);
    }

    // Internal method for system-level operations (no authentication required)
    @Transactional
    public void createFollowRelationship(String followerId, String followingId) {
        if (followerId.equals(followingId)) {
            throw new IllegalArgumentException("Cannot follow yourself.");
        }

        if (followRepository.existsByFollowerIdAndFollowingId(followerId, followingId)) {
            return; // Already following
        }

        Follow followRelationship = Follow.builder()
                .followerId(followerId)
                .followingId(followingId)
                .build();

        followRepository.save(followRelationship);
    }

    // Internal method for system-level unfollow (no authentication required)
    @Transactional
    public void deleteFollowRelationship(String followerId, String followingId) {
        followRepository.deleteByFollowerIdAndFollowingId(followerId, followingId);
    }

    @Transactional(readOnly = true)
    public FollowStatusResponse getFollowStatus(String targetUserId, Authentication authentication) {
        // Lấy ID của người dùng đang đăng nhập từ context bảo mật
        String currentUserId = authentication.getName();

        // 1. Kiểm tra xem người dùng hiện tại (currentUser) có đang follow người dùng
        // mục tiêu (targetUser) không.
        boolean isFollowing = followRepository.existsByFollowerIdAndFollowingId(currentUserId, targetUserId);

        // 2. Kiểm tra xem người dùng mục tiêu (targetUser) có đang follow người dùng
        // hiện tại (currentUser) không.
        boolean isFollowedBy = followRepository.existsByFollowerIdAndFollowingId(targetUserId, currentUserId);

        // 3. Xây dựng và trả về đối tượng DTO với hai thông tin trên.
        return FollowStatusResponse.builder()
                .isFollowing(isFollowing)
                .isFollowedBy(isFollowedBy)
                .build();
    }

    // private Page<UserSummaryResponse> mapFollowPageToUserSummary(Page<Follow>
    // followPage, Function<Follow, String> idExtractor) {
    // List<String> userIds = followPage.getContent().stream()
    // .map(idExtractor)
    // .collect(Collectors.toList());

    // if (userIds.isEmpty()) {
    // return Page.empty(followPage.getPageable());
    // }

    // Map<String, UserSummaryResponse> userSummaries =
    // userRepository.findAllById(userIds);
    // Set<String> currentUserFollowingIds =
    // followRepository.findFollowingIdsByFollowerId(SecurityContextHolder.getContext().getAuthentication().getName());

    // return followPage.map(follow -> {
    // UserSummaryResponse summary = userSummaries.get(idExtractor.apply(follow));
    // if (summary != null) {
    // summary.setIsFollowing(currentUserFollowingIds.contains(summary.getId()));
    // }
    // return summary;
    // });
    // }

    @Transactional(readOnly = true)
    public Page<UserResponse> getFollowers(String userId, Pageable pageable) {
        Page<Follow> followersPage = followRepository.findFollowersByUserId(userId, pageable);
        List<String> followerIds = followersPage.getContent().stream()
                .map(Follow::getFollowerId)
                .collect(Collectors.toList());

        if (followerIds.isEmpty()) {
            return Page.empty(pageable);
        }

        List<UserResponse> userResponses = userClient.getUsersByIds(followerIds).getBody();
        if (userResponses == null) {
            return Page.empty(pageable);
        }

        return new PageImpl<>(userResponses, pageable, followersPage.getTotalElements());
    }

    public Page<UserResponse> getFollowing(String userId, Pageable pageable) {
        // Bước 1: Dùng repository để lấy một trang (Page) các mối quan hệ "Follow"
        // mà `userId` là người đi theo dõi.
        Page<Follow> followingPage = followRepository.findFollowingByUserId(userId, pageable);

        // Bước 2: Từ trang kết quả, trích xuất ra một danh sách (List)
        // chỉ chứa các ID của những người được theo dõi (followingId).
        List<String> followingIds = followingPage.getContent().stream()
                .map(follow -> follow.getFollowingId()) // <-- ĐIỂM KHÁC BIỆT
                .collect(Collectors.toList());

        // Bước 3: Kiểm tra nếu danh sách ID rỗng.
        if (followingIds.isEmpty()) {
            return Page.empty(pageable);
        }

        // Bước 4: Dùng Feign Client gọi sang user-service (giống hệt như trước).
        List<UserResponse> userResponses = userClient.getUsersByIds(followingIds).getBody();
        if (userResponses == null) {
            return Page.empty(pageable);
        }

        // Bước 5: Tạo một đối tượng Page mới để trả về (giống hệt như trước).
        return new PageImpl<>(userResponses, pageable, followingPage.getTotalElements());
    }

    private void sendFollowNotificationEvent(String followerId, String followingId) {
        try {
            Map<String, Object> payload = new HashMap<>();
            payload.put("profileUrl", "/users/" + followerId);

            NotificationEvent event = NotificationEvent.builder()
                    .eventId(UUID.randomUUID().toString())
                    .eventTimestamp(Instant.now())
                    .type(NotificationType.FOLLOW)
                    .senderId(followerId)
                    .receiverId(followingId)
                    .payload(payload)
                    .build();

            kafkaTemplate.send(notificationTopic, event);
        } catch (Exception e) {
            // log.error("Could not send follow notification event", e);
        }
    }
}
