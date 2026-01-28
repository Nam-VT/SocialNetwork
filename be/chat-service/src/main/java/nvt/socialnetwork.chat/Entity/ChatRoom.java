package nvt.socialnetwork.chat.Entity;

import java.time.LocalDateTime;
import java.util.Set;
import java.util.UUID;

import jakarta.persistence.CollectionTable;
import jakarta.persistence.Column;
import jakarta.persistence.ElementCollection;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import nvt.socialnetwork.chat.Entity.Enum.RoomType;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "chat_rooms")
public class ChatRoom {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    private String name;

    @Enumerated(EnumType.STRING)
    @Column(length = 20)
    private RoomType type;

    @Column(name = "creator_id")
    private String creatorId; // ID of the user who created the group

    @Column(columnDefinition = "TEXT")
    private String lastMessage;

    private LocalDateTime lastMessageTimestamp;

    // Dùng @ElementCollection để tự động tạo bảng chat_room_participants
    @ElementCollection(fetch = FetchType.LAZY)
    @CollectionTable(name = "chat_room_participants", joinColumns = @JoinColumn(name = "chat_room_id"))
    @Column(name = "user_id", nullable = false)
    private Set<String> participantIds;
}