package nvt.socialnetwork.chat.Service;

import java.time.Instant;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import nvt.socialnetwork.chat.Client.MediaClient;
import nvt.socialnetwork.chat.Client.UserClient;
import nvt.socialnetwork.chat.Dto.Request.ChatMessageRequest;
import nvt.socialnetwork.chat.Dto.Request.ChatRoomRequest;
import nvt.socialnetwork.chat.Dto.Response.ChatMessageResponse;
import nvt.socialnetwork.chat.Dto.Response.ChatRoomResponse;
import nvt.socialnetwork.chat.Entity.ChatMessage;
import nvt.socialnetwork.chat.Entity.ChatRoom;
import nvt.socialnetwork.chat.Entity.Enum.MessageType;
import nvt.socialnetwork.chat.Entity.Enum.RoomType;
import nvt.socialnetwork.chat.Repository.ChatMessageRepository;
import nvt.socialnetwork.chat.Repository.ChatRoomRepo;
import nvt.socialnetwork.common.dto.NotificationEvent;
import nvt.socialnetwork.common.dto.NotificationType;

@Service
@RequiredArgsConstructor
public class ChatService {

    private final ChatRoomRepo chatRoomRepository;
    private final ChatMessageRepository chatMessageRepository;
    private final UserClient userClient;
    private final MediaClient mediaClient;
    private final KafkaTemplate<String, NotificationEvent> kafkaTemplate;

    @Value("${app.kafka.notification-topic}")
    private String notificationTopic;

    private static final String GATEWAY_URL = "http://localhost:8080";

    @Transactional
    public ChatRoomResponse findOrCreatePrivateRoom(String user1Id, String user2Id) {
        if (user1Id.equals(user2Id)) {
            throw new IllegalArgumentException("Cannot create a chat room with yourself.");
        }

        try {
            if (userClient.checkUserExists(user2Id).getBody() == null
                    || !userClient.checkUserExists(user2Id).getBody()) {
                throw new RuntimeException("User not found with id: " + user2Id);
            }
        } catch (RuntimeException e) {
            throw new RuntimeException("Unable to verify user. User service may be unavailable.", e);
        }

        String firstUserId = user1Id.compareTo(user2Id) < 0 ? user1Id : user2Id;
        String secondUserId = user1Id.compareTo(user2Id) < 0 ? user2Id : user1Id;

        ChatRoom chatRoom = chatRoomRepository
                .findPrivateChatRoomByParticipants(firstUserId, secondUserId, RoomType.PRIVATE)
                .orElseGet(() -> {
                    // 3. Nếu không tìm thấy, tạo phòng chat mới
                    ChatRoom newRoom = ChatRoom.builder()
                            .type(RoomType.PRIVATE)
                            .participantIds(Set.of(firstUserId, secondUserId))
                            .build();
                    return chatRoomRepository.save(newRoom);
                });

        // 4. Chuyển đổi Entity sang DTO và trả về
        return mapChatRoomToResponse(chatRoom);
    }

    @Transactional
    public ChatRoomResponse createGroupRoom(String creatorId, ChatRoomRequest request) {
        Set<String> participantIds = new HashSet<>(request.getParticipantIds());
        participantIds.add(creatorId); // Thêm người tạo vào danh sách thành viên

        try {
            if (userClient.validateUserIds(participantIds).getBody() == null
                    || !userClient.validateUserIds(participantIds).getBody()) {
                throw new RuntimeException("One or more participant IDs are invalid.");
            }
        } catch (RuntimeException e) {
            throw new RuntimeException("Unable to verify participants. User service may be unavailable.", e);
        }

        ChatRoom newGroupRoom = ChatRoom.builder()
                .type(RoomType.GROUP)
                .name(request.getName())
                .participantIds(participantIds)
                .creatorId(creatorId) // Assuming ChatRoom entity has a creatorId field
                .build();

        ChatRoom savedRoom = chatRoomRepository.save(newGroupRoom);

        return mapChatRoomToResponse(savedRoom);
    }

    @Transactional
    public ChatRoomResponse updateGroupName(UUID chatRoomId, String newName, String requesterId) {
        ChatRoom chatRoom = chatRoomRepository.findById(chatRoomId)
                .orElseThrow(() -> new RuntimeException("Chat room not found"));

        if (chatRoom.getType() != RoomType.GROUP) { // Changed from getIsGroup() to getType()
            throw new IllegalStateException("Cannot rename private chat");
        }

        if (!chatRoom.getCreatorId().equals(requesterId)) {
            throw new SecurityException("Only group creator can rename the group");
        }

        chatRoom.setName(newName);
        ChatRoom updated = chatRoomRepository.save(chatRoom);
        return mapChatRoomToResponse(updated);
    }

    @Transactional
    public void deleteGroup(UUID chatRoomId, String requesterId) {
        ChatRoom chatRoom = chatRoomRepository.findById(chatRoomId)
                .orElseThrow(() -> new RuntimeException("Chat room not found"));

        if (chatRoom.getType() != RoomType.GROUP) {
            throw new IllegalStateException("Cannot delete private chat");
        }

        if (!chatRoom.getCreatorId().equals(requesterId)) {
            throw new SecurityException("Only group creator can delete the group");
        }

        // Delete all messages in the group
        chatMessageRepository.deleteByChatRoomId(chatRoomId);

        // Delete the chat room
        chatRoomRepository.delete(chatRoom);
    }

    @Transactional
    public ChatRoomResponse leaveGroup(UUID chatRoomId, String requesterId) {
        ChatRoom chatRoom = chatRoomRepository.findById(chatRoomId)
                .orElseThrow(() -> new RuntimeException("Chat room not found"));

        if (chatRoom.getType() != RoomType.GROUP) {
            throw new IllegalStateException("Cannot leave private chat");
        }

        if (chatRoom.getCreatorId().equals(requesterId)) {
            throw new SecurityException("Group creator cannot leave the group. You must delete the group instead.");
        }

        if (!chatRoom.getParticipantIds().contains(requesterId)) {
            throw new IllegalStateException("You are not a member of this group");
        }

        chatRoom.getParticipantIds().remove(requesterId);

        // Notify other members (Optional: System message)
        // For now, just save
        ChatRoom savedRoom = chatRoomRepository.save(chatRoom);
        return mapChatRoomToResponse(savedRoom);
    }

    @Transactional
    public ChatMessageResponse processAndSaveMessage(UUID chatRoomId, String senderId, ChatMessageRequest request) {
        // 1. Tìm phòng chat và xác thực quyền của người gửi
        ChatRoom chatRoom = chatRoomRepository.findById(chatRoomId)
                .orElseThrow(() -> new RuntimeException("Chat room not found"));

        if (!chatRoom.getParticipantIds().contains(senderId)) {
            throw new SecurityException("User is not a participant of this chat room.");
        }

        if (request.getType() == MessageType.IMAGE || request.getType() == MessageType.VIDEO
                || request.getType() == MessageType.FILE) {
            if (request.getMediaId() == null) {
                throw new IllegalArgumentException("Media ID cannot be null for non-text messages.");
            }
            try {
                // Giả sử media-service có endpoint GET /media/{id}
                mediaClient.getMediaById(request.getMediaId()); // Cần tạo MediaClient
            } catch (Exception e) {
                throw new RuntimeException("Invalid media ID: " + request.getMediaId(), e);
            }
        }

        // 3. Tạo và lưu tin nhắn mới
        ChatMessage message = ChatMessage.builder()
                .chatRoomId(chatRoomId)
                .senderId(senderId)
                .content(request.getContent())
                .type(request.getType())
                .mediaId(request.getMediaId())
                .timestamp(java.time.LocalDateTime.now())
                .build();

        ChatMessage savedMessage = chatMessageRepository.save(message);

        // 4. Cập nhật thông tin tin nhắn cuối cùng cho phòng chat
        chatRoom.setLastMessage(savedMessage.getContent());
        chatRoom.setLastMessageTimestamp(savedMessage.getTimestamp());
        chatRoomRepository.save(chatRoom);

        // 5. Gửi sự kiện Kafka để thông báo cho người nhận
        sendNewMessageNotification(savedMessage, chatRoom.getParticipantIds());

        // 6. Chuyển đổi và trả về
        return mapChatMessageToResponse(savedMessage);
    }

    private ChatMessageResponse mapChatMessageToResponse(ChatMessage message) {
        String mediaUrl = null;
        if (message.getMediaId() != null) {
            mediaUrl = GATEWAY_URL + "/media/" + message.getMediaId();
        }

        return ChatMessageResponse.builder()
                .id(message.getId())
                .chatRoomId(message.getChatRoomId())
                .senderId(message.getSenderId())
                .content(message.getContent())
                .type(message.getType())
                .mediaUrl(mediaUrl)
                .timestamp(message.getTimestamp().toString())
                .build();
    }

    private void sendNewMessageNotification(ChatMessage message, Set<String> allParticipantIds) {
        // Lấy danh sách người nhận (tất cả thành viên trừ người gửi)
        List<String> receiverIds = allParticipantIds.stream()
                .filter(id -> !id.equals(message.getSenderId()))
                .collect(Collectors.toList());

        if (receiverIds.isEmpty())
            return;

        // Get sender name for notification content
        String senderName = "Someone";
        try {
            var userResponse = userClient.getUserById(message.getSenderId());
            if (userResponse != null && userResponse.getBody() != null) {
                senderName = userResponse.getBody().getDisplayName();
            }
        } catch (Exception e) {
            // Fallback to default if user service unavailable
        }

        // Send notification to each receiver
        for (String receiverId : receiverIds) {
            NotificationEvent event = NotificationEvent.builder()
                    .eventId(UUID.randomUUID().toString())
                    .eventTimestamp(Instant.now())
                    .type(NotificationType.NEW_MESSAGE)
                    .senderId(message.getSenderId())
                    .receiverId(receiverId)
                    .payload(Map.of(
                            "chatRoomId", message.getChatRoomId().toString(),
                            "conversationId", message.getChatRoomId().toString(), // For redirect URL
                            "senderName", senderName,
                            "messageContent", message.getContent() != null ? message.getContent() : ""))
                    .build();

            kafkaTemplate.send(notificationTopic, event);
        }
    }

    // Phương thức private để chuyển đổi ChatRoom Entity sang ChatRoomResponse DTO
    private ChatRoomResponse mapChatRoomToResponse(ChatRoom chatRoom) {
        return ChatRoomResponse.builder()
                .id(chatRoom.getId())
                .name(chatRoom.getName())
                .type(chatRoom.getType())
                .participantIds(chatRoom.getParticipantIds())
                .lastMessage(chatRoom.getLastMessage())
                .lastMessageTimestamp(chatRoom.getLastMessageTimestamp())
                .creatorId(chatRoom.getCreatorId())
                .build();
    }

    @Transactional
    public Page<ChatMessageResponse> getMessageHistory(UUID chatRoomId, String requesterId, Pageable pageable) {
        // 1. Xác thực người dùng có quyền xem tin nhắn
        ChatRoom chatRoom = chatRoomRepository.findById(chatRoomId)
                .orElseThrow(() -> new RuntimeException("Chat room not found"));

        if (!chatRoom.getParticipantIds().contains(requesterId)) {
            throw new SecurityException("You are not a participant of this chat room.");
        }

        // Lấy tin nhắn từ DB, sắp xếp theo thời gian (mới nhất trước)
        Page<ChatMessage> messagePage = chatMessageRepository.findByChatRoomIdOrderByTimestampDesc(chatRoomId,
                pageable);

        // 3. Chuyển đổi Page<ChatMessage> thành Page<ChatMessageResponse>
        List<ChatMessageResponse> responses = messagePage.getContent().stream()
                .map(this::mapChatMessageToResponse)
                .collect(Collectors.toList());

        return new PageImpl<>(responses, pageable, messagePage.getTotalElements());
    }

    @Transactional
    public List<ChatRoomResponse> getChatRoomsForUser(String userId) {
        // 1. Tìm tất cả phòng chat mà user này tham gia
        List<ChatRoom> chatRooms = chatRoomRepository.findByParticipantIdsContaining(userId);

        // 2. Chuyển đổi sang DTO
        return chatRooms.stream()
                .map(this::mapChatRoomToResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public List<ChatRoomResponse> findCommonGroupRooms(String user1Id, String user2Id) {
        // 1. Lấy danh sách phòng chat của từng người
        List<ChatRoom> user1Rooms = chatRoomRepository.findByParticipantIdsContaining(user1Id);
        List<ChatRoom> user2Rooms = chatRoomRepository.findByParticipantIdsContaining(user2Id);

        // 2. Chuyển danh sách phòng của user 2 thành Set để tìm kiếm hiệu quả hơn
        Set<ChatRoom> user2RoomsSet = new HashSet<>(user2Rooms);

        // 3. Lọc ra những phòng là nhóm chat và chung cho cả hai
        List<ChatRoom> commonGroupRooms = user1Rooms.stream()
                .filter(room -> room.getType() == RoomType.GROUP)
                .filter(user2RoomsSet::contains)
                .collect(Collectors.toList());

        // 4. Chuyển đổi sang DTO
        return commonGroupRooms.stream()
                .map(this::mapChatRoomToResponse)
                .collect(Collectors.toList());
    }
}
