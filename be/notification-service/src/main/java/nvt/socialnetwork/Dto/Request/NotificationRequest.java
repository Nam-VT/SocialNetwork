package nvt.socialnetwork.Dto.Request;

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
public class NotificationRequest {
    private String senderId;
    private String receiverId;
    private NotificationType type;
    private String content;
    private String redirectUrl;
}