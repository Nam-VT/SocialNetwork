package nvt.socialnetwork.chat.Dto.Request;

import java.util.UUID;

import lombok.Data;
import nvt.socialnetwork.chat.Entity.Enum.MessageType;

@Data
public class ChatMessageRequest {
    String content;
    MessageType type; // "TEXT", "IMAGE", "VIDEO", "FILE"
    UUID mediaId; // ID của media nếu có
}
