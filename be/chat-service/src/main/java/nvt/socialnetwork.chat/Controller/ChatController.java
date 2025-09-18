package nvt.socialnetwork.chat.Controller;

import java.util.List;
import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import lombok.RequiredArgsConstructor;
import nvt.socialnetwork.chat.Dto.Request.ChatRoomRequest;
import nvt.socialnetwork.chat.Dto.Response.ChatMessageResponse;
import nvt.socialnetwork.chat.Dto.Response.ChatRoomResponse;
import nvt.socialnetwork.chat.Service.ChatService;

@RestController
@RequestMapping("chats")
@RequiredArgsConstructor
public class ChatController {

    private final ChatService chatService;

    // API để lấy tất cả các phòng chat của người dùng hiện tại
    @GetMapping
    public ResponseEntity<List<ChatRoomResponse>> getMyChatRooms(Authentication authentication) {
        String userId = authentication.getName();
        List<ChatRoomResponse> rooms = chatService.getChatRoomsForUser(userId);
        return ResponseEntity.ok(rooms);
    }

    // API để mở box chat 1-1 với người dùng khác
    @PostMapping("/private/{otherUserId}")
    public ResponseEntity<ChatRoomResponse> findOrCreatePrivateRoom(@PathVariable String otherUserId, Authentication authentication) {
        String currentUserId = authentication.getName();
        ChatRoomResponse room = chatService.findOrCreatePrivateRoom(currentUserId, otherUserId);
        return ResponseEntity.ok(room);
    }
    
    // API để tạo nhóm chat
    @PostMapping("/group")
    public ResponseEntity<ChatRoomResponse> createGroupRoom(@RequestBody ChatRoomRequest request, Authentication authentication) {
        String creatorId = authentication.getName();
        ChatRoomResponse room = chatService.createGroupRoom(creatorId, request);
        return new ResponseEntity<>(room, HttpStatus.CREATED);
    }

    // API để lấy lịch sử tin nhắn của một phòng chat
    @GetMapping("/{chatRoomId}/messages")
    public ResponseEntity<Page<ChatMessageResponse>> getMessageHistory(@PathVariable UUID chatRoomId, Pageable pageable, Authentication authentication) {
        String requesterId = authentication.getName();
        Page<ChatMessageResponse> messages = chatService.getMessageHistory(chatRoomId, requesterId, pageable);
        return ResponseEntity.ok(messages);
    }

    // API để tìm nhóm chat chung giữa 2 người
    @GetMapping("/common-groups/{otherUserId}")
    public ResponseEntity<List<ChatRoomResponse>> findCommonGroupRooms(@PathVariable String otherUserId, Authentication authentication) {
        String currentUserId = authentication.getName();
        List<ChatRoomResponse> commonRooms = chatService.findCommonGroupRooms(currentUserId, otherUserId);
        return ResponseEntity.ok(commonRooms);
    }
}