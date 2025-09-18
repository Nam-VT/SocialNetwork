package nvt.socialnetwork.chat.Dto.Request;

import java.util.Set;

import lombok.Data;
import nvt.socialnetwork.chat.Entity.Enum.RoomType;

@Data
public class ChatRoomRequest {
    private String name;
    private RoomType type; // "PRIVATE" or "GROUP"
    private Set<String> participantIds; // Danh sách ID người tham gia
}
