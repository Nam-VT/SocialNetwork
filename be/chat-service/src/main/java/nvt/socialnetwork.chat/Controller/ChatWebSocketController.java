package nvt.socialnetwork.chat.Controller;

import java.security.Principal;
import java.util.UUID;

import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

import lombok.RequiredArgsConstructor;
import nvt.socialnetwork.chat.Dto.Request.ChatMessageRequest;
import nvt.socialnetwork.chat.Dto.Response.ChatMessageResponse;
import nvt.socialnetwork.chat.Service.ChatService;

@Controller
@RequiredArgsConstructor
public class ChatWebSocketController {

    private final ChatService chatService;
    private final SimpMessagingTemplate messagingTemplate;

    @MessageMapping("/chat/{chatRoomId}")
    public void sendMessage(@DestinationVariable UUID chatRoomId, @Payload ChatMessageRequest request, Principal principal) {
        // Principal chứa thông tin người dùng đã được xác thực qua WebSocket
        String senderId = principal.getName();
        
        // 1. Lưu tin nhắn vào DB và nhận về DTO response
        ChatMessageResponse messageResponse = chatService.processAndSaveMessage(chatRoomId, senderId, request);
        
        // 2. Phát (broadcast) tin nhắn đến tất cả các client đang subscribe kênh của phòng chat này
        String destination = "/topic/chats/" + chatRoomId;
        messagingTemplate.convertAndSend(destination, messageResponse);
    }
}
