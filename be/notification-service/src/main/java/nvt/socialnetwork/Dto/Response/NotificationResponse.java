package nvt.socialnetwork.Dto.Response;

import java.time.LocalDateTime;
import java.util.UUID;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import nvt.socialnetwork.common.dto.NotificationType;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class NotificationResponse {
    private UUID id;
    private String senderId;
    private String receiverId;
    private NotificationType type;
    private String content;
    private String redirectUrl;
    private boolean isRead;
    private LocalDateTime createdAt;
}
