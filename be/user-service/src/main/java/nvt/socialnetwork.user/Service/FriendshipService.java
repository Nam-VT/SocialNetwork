package nvt.socialnetwork.user.Service;

import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import nvt.socialnetwork.common.dto.NotificationEvent;
import nvt.socialnetwork.common.dto.NotificationType;
import nvt.socialnetwork.user.Client.FollowClient;
import nvt.socialnetwork.user.DTO.Response.FriendshipStatusResponse;
import nvt.socialnetwork.user.DTO.Response.FriendRequestResponse;
import nvt.socialnetwork.user.DTO.Response.UserResponse;
import nvt.socialnetwork.user.Entity.Enum.FriendshipStatus;
import nvt.socialnetwork.user.Entity.Friendship;
import nvt.socialnetwork.user.Entity.User;
import nvt.socialnetwork.user.Repository.FriendshipRepository;
import nvt.socialnetwork.user.Repository.UserRepo;

@Slf4j
@Service
@RequiredArgsConstructor
public class FriendshipService {
    private final FriendshipRepository friendshipRepository;
    private final UserRepo userRepository;
    private final UserService userService;
    private final FollowClient followClient;

    private final KafkaTemplate<String, NotificationEvent> kafkaTemplate;

    @Value("${app.kafka.notification-topic}")
    private String notificationTopic;

    @Transactional
    public void sendFriendRequest(String addresseeId, Authentication authentication) {
        String requesterId = authentication.getName();
        if (requesterId.equals(addresseeId)) {
            throw new IllegalArgumentException("Cannot send a friend request to yourself.");
        }

        try {
            userRepository.findById(addresseeId).orElseThrow(() -> new RuntimeException("User not found."));
        } catch (RuntimeException e) {
            throw new IllegalArgumentException("Addressee does not exist.");
        }

        // Kiểm tra xem đã có mối quan hệ nào chưa
        friendshipRepository.findFriendshipBetweenUsers(requesterId, addresseeId).ifPresent(f -> {
            throw new IllegalStateException("A friendship or friend request already exists.");
        });

        Friendship friendship = Friendship.builder()
                .requesterId(requesterId)
                .addresseeId(addresseeId)
                .status(FriendshipStatus.PENDING)
                .build();
        Friendship savedFriendship = friendshipRepository.save(friendship);

        // Get sender display name for notification
        String senderName = userRepository.findById(requesterId)
                .map(User::getDisplayName)
                .orElse("Someone");

        sendNotificationEvent(
                requesterId,
                addresseeId,
                NotificationType.FRIEND_REQUEST,
                Map.of("friendshipId", savedFriendship.getId().toString(),
                        "senderName", senderName));
    }

    @Transactional
    public void acceptFriendRequest(UUID requestId, Authentication authentication) {
        String currentUserId = authentication.getName();
        Friendship friendship = friendshipRepository.findById(requestId)
                .orElseThrow(() -> new RuntimeException("Request not found."));

        if (!friendship.getAddresseeId().equals(currentUserId)) {
            throw new SecurityException("You are not authorized to accept this request.");
        }
        if (friendship.getStatus() != FriendshipStatus.PENDING) {
            throw new IllegalStateException("This request is no longer pending.");
        }

        friendship.setStatus(FriendshipStatus.ACCEPTED);
        friendshipRepository.save(friendship);

        // Auto-follow: Both users follow each other when becoming friends
        try {
            // Current user follows requester
            followClient.createFollowRelationship(currentUserId, friendship.getRequesterId());
            // Requester follows current user (bidirectional)
            followClient.createFollowRelationship(friendship.getRequesterId(), currentUserId);
        } catch (Exception e) {
            log.warn("Failed to auto-follow when accepting friend request", e);
            // Don't fail the friendship if follow fails
        }

        // Get sender display name for notification
        String senderName = userRepository.findById(currentUserId)
                .map(User::getDisplayName)
                .orElse("Someone");

        sendNotificationEvent(
                currentUserId, // Người chấp nhận là người gửi thông báo
                friendship.getRequesterId(), // Gửi thông báo cho người gửi yêu cầu gốc
                NotificationType.FRIEND_ACCEPT,
                Map.of("friendshipId", friendship.getId().toString(),
                        "senderName", senderName));
    }

    @Transactional
    public void declineOrCancelRequest(UUID requestId, Authentication authentication) {
        String currentUserId = authentication.getName();
        Friendship friendship = friendshipRepository.findById(requestId)
                .orElseThrow(() -> new RuntimeException("Request not found."));

        if (!friendship.getAddresseeId().equals(currentUserId) && !friendship.getRequesterId().equals(currentUserId)) {
            throw new SecurityException("You are not authorized to perform this action.");
        }
        friendshipRepository.delete(friendship);
    }

    @Transactional
    public void unfriend(UUID friendshipId, Authentication authentication) {
        String currentUserId = authentication.getName();
        Friendship friendship = friendshipRepository.findById(friendshipId)
                .orElseThrow(() -> new RuntimeException("Friendship not found."));

        if (friendship.getStatus() != FriendshipStatus.ACCEPTED) {
            throw new IllegalStateException("You are not friends with this user.");
        }

        // Verify that current user is part of this friendship
        if (!friendship.getRequesterId().equals(currentUserId) && !friendship.getAddresseeId().equals(currentUserId)) {
            throw new SecurityException("You are not authorized to perform this action.");
        }

        // Get the other user's ID for auto-unfollow
        String otherUserId = friendship.getRequesterId().equals(currentUserId)
                ? friendship.getAddresseeId()
                : friendship.getRequesterId();

        // Auto-unfollow when unfriending (bidirectional)
        try {
            // Both users unfollow each other
            followClient.deleteFollowRelationship(currentUserId, otherUserId);
            followClient.deleteFollowRelationship(otherUserId, currentUserId);
        } catch (Exception e) {
            log.warn("Failed to auto-unfollow when unfriending", e);
            // Don't fail the unfriend if unfollow fails
        }

        friendshipRepository.delete(friendship);
    }

    @Transactional(readOnly = true)
    public Page<UserResponse> getFriends(String userId, Pageable pageable) {
        log.info("Getting friends for userId: {}", userId);
        Page<Friendship> friendsPage = friendshipRepository.findFriendsByUserId(userId, FriendshipStatus.ACCEPTED,
                pageable);
        log.info("Found {} friendships", friendsPage.getTotalElements());

        List<String> friendIds = friendsPage.getContent().stream()
                .map(f -> {
                    String friendId = f.getRequesterId().equals(userId) ? f.getAddresseeId() : f.getRequesterId();
                    log.info("Friendship: requester={}, addressee={}, status={}, friendId={}",
                            f.getRequesterId(), f.getAddresseeId(), f.getStatus(), friendId);
                    return friendId;
                })
                .collect(Collectors.toList());

        if (friendIds.isEmpty()) {
            log.warn("No friend IDs found for user: {}", userId);
            return Page.empty(pageable);
        }

        log.info("Friend IDs: {}", friendIds);
        List<UserResponse> userResponses = userRepository.findAllById(friendIds).stream()
                .map(userService::mapUserToUserResponse)
                .collect(Collectors.toList());

        log.info("Returning {} friends", userResponses.size());
        return new PageImpl<>(userResponses, pageable, friendsPage.getTotalElements());
    }

    @Transactional(readOnly = true)
    public FriendshipStatusResponse getFriendshipStatus(String otherUserId, Authentication authentication) {
        String currentUserId = authentication.getName();
        Optional<Friendship> friendshipOpt = friendshipRepository.findFriendshipBetweenUsers(currentUserId,
                otherUserId);

        if (friendshipOpt.isEmpty()) {
            return FriendshipStatusResponse.builder().build(); // All false
        }

        Friendship friendship = friendshipOpt.get();
        if (friendship.getStatus() == FriendshipStatus.ACCEPTED) {
            return FriendshipStatusResponse.builder()
                    .isFriends(true)
                    .requestId(friendship.getId().toString()) // Convert UUID to String
                    .build();
        }

        // Status is PENDING
        return FriendshipStatusResponse.builder()
                .isRequestSentByMe(friendship.getRequesterId().equals(currentUserId))
                .isRequestReceivedByMe(friendship.getAddresseeId().equals(currentUserId))
                .requestId(friendship.getId().toString()) // Convert UUID to String
                .build();
    }

    public Page<FriendRequestResponse> getPendingRequests(Authentication authentication, Pageable pageable) {
        // 1. Lấy ID người dùng hiện tại
        String currentUserId = authentication.getName();

        // 2. Tìm yêu cầu kết bạn đang chờ (người nhận là mình)
        Page<Friendship> pendingFriendships = friendshipRepository
                .findByAddresseeIdAndStatus(currentUserId, FriendshipStatus.PENDING, pageable);

        // 3. Map sang FriendRequestResponse
        return pendingFriendships.map(friendship -> {
            String senderId = friendship.getRequesterId();

            User requester = userRepository.findById(senderId).orElse(null);

            UserResponse userResponse;
            if (requester == null) {
                userResponse = new UserResponse();
                userResponse.setId(senderId);
                userResponse.setDisplayName("Deleted User");
                userResponse.setBio("This user no longer exists.");
            } else {
                userResponse = userService.mapUserToUserResponse(requester);
            }

            return FriendRequestResponse.builder()
                    .id(friendship.getId()) // Quan trọng: ID của Request để Accept/Decline
                    .requester(userResponse)
                    .createdAt(friendship.getCreatedAt().atZone(java.time.ZoneId.systemDefault()).toInstant())
                    .build();
        });
    }

    public Page<UserResponse> getSuggestions(String currentUserId, Pageable pageable) {
        // 1. Lấy danh sách gợi ý từ Repo
        Page<User> suggestions = friendshipRepository.findFriendSuggestions(currentUserId, pageable);

        // 2. Map sang UserResponse (Dùng hàm mapUserToUserResponse có sẵn trong
        // UserService)
        return suggestions.map(userService::mapUserToUserResponse);
    }

    private void sendNotificationEvent(String senderId, String receiverId, NotificationType type,
            Map<String, Object> payload) {
        NotificationEvent event = NotificationEvent.builder()
                .eventId(UUID.randomUUID().toString())
                .eventTimestamp(Instant.now())
                .senderId(senderId)
                .receiverId(receiverId)
                .type(type)
                .payload(payload)
                .build();

        kafkaTemplate.send(notificationTopic, event);
    }
}