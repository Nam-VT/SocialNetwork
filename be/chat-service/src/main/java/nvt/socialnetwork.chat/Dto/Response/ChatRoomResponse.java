package nvt.socialnetwork.chat.Dto.Response;

import java.time.LocalDateTime;
import java.util.Set;
import java.util.UUID;

import lombok.Builder;
import lombok.Data;
import nvt.socialnetwork.chat.Entity.Enum.RoomType;

@Data
@Builder
public class ChatRoomResponse {
    private UUID id;
    private String name;
    private RoomType type;
    private Set<String> participantIds;
    private String lastMessage;
    private LocalDateTime lastMessageTimestamp;
}
