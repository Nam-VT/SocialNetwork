package nvt.socialnetwork.Entity;

import java.time.LocalDateTime;
import java.util.UUID;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import nvt.socialnetwork.common.dto.NotificationType;

@Entity
@Table(name = "notifications")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Notification {
    @Id
    private UUID id;

    private String senderId;
    private String receiverId;

    @Enumerated(EnumType.STRING)
    private NotificationType type;

    private String content;
    private String redirectUrl;

    private boolean isRead;

    private LocalDateTime createdAt;

    @Column(unique = true, nullable = false)
    private String eventId;
}
