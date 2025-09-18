package nvt.socialnetwork.chat.Dto.Response;

import java.util.UUID;

import lombok.Builder;
import lombok.Data;
import nvt.socialnetwork.chat.Entity.Enum.MessageType;


@Data
@Builder
public class ChatMessageResponse {
    private UUID id;
    private UUID chatRoomId;
    private String senderId;
    private String content;
    private MessageType type;
    private String mediaUrl;
    private String timestamp;
}
