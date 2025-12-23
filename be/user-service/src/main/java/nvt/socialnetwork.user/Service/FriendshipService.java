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
import nvt.socialnetwork.common.dto.NotificationEvent;
import nvt.socialnetwork.common.dto.NotificationType;
import nvt.socialnetwork.user.DTO.Response.FriendshipStatusResponse;
import nvt.socialnetwork.user.DTO.Response.UserResponse;
import nvt.socialnetwork.user.Entity.Enum.FriendshipStatus;
import nvt.socialnetwork.user.Entity.Friendship;
import nvt.socialnetwork.user.Entity.User;
import nvt.socialnetwork.user.Repository.FriendshipRepository;
import nvt.socialnetwork.user.Repository.UserRepo;

@Service
@RequiredArgsConstructor
public class FriendshipService {
    private final FriendshipRepository friendshipRepository;
    private final UserRepo userRepository;
    private final UserService userService;

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
        
        sendNotificationEvent(
            requesterId, 
            addresseeId, 
            NotificationType.FRIEND_REQUEST,
            Map.of("friendshipId", savedFriendship.getId().toString())
        );
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
        
        sendNotificationEvent(
            currentUserId, // Người chấp nhận là người gửi thông báo
            friendship.getRequesterId(), // Gửi thông báo cho người gửi yêu cầu gốc
            NotificationType.FRIEND_ACCEPT,
            Map.of("friendshipId", friendship.getId().toString())
        );
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
    public void unfriend(String friendId, Authentication authentication) {
        String currentUserId = authentication.getName();
        Friendship friendship = friendshipRepository.findFriendshipBetweenUsers(currentUserId, friendId)
                .orElseThrow(() -> new RuntimeException("Friendship not found."));
        
        if (friendship.getStatus() != FriendshipStatus.ACCEPTED) {
             throw new IllegalStateException("You are not friends with this user.");
        }
        friendshipRepository.delete(friendship);
    }
    
    @Transactional(readOnly = true)
    public Page<UserResponse> getFriends(String userId, Pageable pageable) {
        Page<Friendship> friendsPage = friendshipRepository.findFriendsByUserId(userId, pageable);
        List<String> friendIds = friendsPage.getContent().stream()
                .map(f -> f.getRequesterId().equals(userId) ? f.getAddresseeId() : f.getRequesterId())
                .collect(Collectors.toList());
        
        if (friendIds.isEmpty()) {
            return Page.empty(pageable);
        }
        
        List<UserResponse> userResponses = userRepository.findAllById(friendIds).stream()
                .map(userService::mapUserToUserResponse) 
                .collect(Collectors.toList());
                
        return new PageImpl<>(userResponses, pageable, friendsPage.getTotalElements());
    }

    @Transactional(readOnly = true)
    public FriendshipStatusResponse getFriendshipStatus(String otherUserId, Authentication authentication) {
        String currentUserId = authentication.getName();
        Optional<Friendship> friendshipOpt = friendshipRepository.findFriendshipBetweenUsers(currentUserId, otherUserId);

        if (friendshipOpt.isEmpty()) {
            return FriendshipStatusResponse.builder().build(); // All false
        }

        Friendship friendship = friendshipOpt.get();
        if (friendship.getStatus() == FriendshipStatus.ACCEPTED) {
            return FriendshipStatusResponse.builder().isFriends(true).build();
        }

        // Status is PENDING
        return FriendshipStatusResponse.builder()
                .isRequestSentByMe(friendship.getRequesterId().equals(currentUserId))
                .isRequestReceivedByMe(friendship.getAddresseeId().equals(currentUserId))
                .build();
    }

    
    public Page<UserResponse> getPendingRequests(Authentication authentication, Pageable pageable) {
        // 1. Lấy ID người dùng hiện tại
        String currentUserId = authentication.getName();

        // 2. Tìm yêu cầu kết bạn đang chờ (người nhận là mình)
        Page<Friendship> pendingFriendships = friendshipRepository
            .findByAddresseeIdAndStatus(currentUserId, FriendshipStatus.PENDING, pageable);

        // 3. Mapping thủ công sang UserResponse
        return pendingFriendships.map(friendship -> {
            String senderId = friendship.getRequesterId();
            
            User requester = userRepository.findById(senderId)
                    .orElseThrow(() -> new RuntimeException("Sender not found with ID: " + senderId));
            
            UserResponse response = new UserResponse();
            response.setId(requester.getId());
            response.setDisplayName(requester.getDisplayName());
            response.setBio(requester.getBio());
            
            if (requester.getAvatarId() != null) {
                response.setAvatarUrl(requester.getAvatarId().toString());
            }
            if (requester.getCoverId() != null) {
                response.setCoverUrl(requester.getCoverId().toString());
            }
            
            response.setPublicEmail(requester.getPublicEmail());
            response.setPhoneNumber(requester.getPhoneNumber());
            response.setGender(requester.getGender());
            response.setBirthday(requester.getBirthday());
            response.setInterests(requester.getInterests());
            response.setLocation(requester.getLocation());
            
            // SỬA LỖI: Vì requester.getCreatedAt() đã là LocalDate nên gán trực tiếp
            response.setCreatedAt(requester.getCreatedAt()); 
            
            response.setPrivateProfile(requester.isPrivateProfile());
            
            return response;
        });
    }

    private void sendNotificationEvent(String senderId, String receiverId, NotificationType type, Map<String, Object> payload) {
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