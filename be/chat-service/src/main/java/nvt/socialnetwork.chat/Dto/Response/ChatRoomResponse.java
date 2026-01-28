package nvt.socialnetwork.chat.Dto.Response;

import java.time.LocalDateTime;
import java.util.Set;
import java.util.UUID;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import nvt.socialnetwork.chat.Entity.Enum.RoomType;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ChatRoomResponse {
    private UUID id;
    private String name;
    private RoomType type;
    private Set<String> participantIds;
    private String lastMessage;
    private LocalDateTime lastMessageTimestamp;
    private String creatorId; // ID of the group creator
}
