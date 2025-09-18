package nvt.socialnetwork.Service;

import java.time.LocalDateTime;
import java.util.UUID;

import org.springframework.stereotype.Service;

import nvt.socialnetwork.Entity.Notification;
import nvt.socialnetwork.common.dto.NotificationEvent;

@Service
public class NotificationProcessingService {

    public Notification createNotificationFromEvent(NotificationEvent event) {
        String content = generateContent(event);
        String redirectUrl = generateRedirectUrl(event);

        return Notification.builder()
                .id(UUID.randomUUID()) // Server tự tạo khóa chính
                .eventId(event.getEventId()) // Lưu eventId để chống lặp
                .senderId(event.getSenderId())
                .receiverId(event.getReceiverId())
                .type(event.getType())
                .content(content)
                .redirectUrl(redirectUrl)
                .isRead(false)
                .createdAt(LocalDateTime.now())
                .build();
    }

    private String generateContent(NotificationEvent event) {
        // Giả sử payload chứa "senderName"
        String senderName = (String) event.getPayload().getOrDefault("senderName", "Someone");
        
        return switch (event.getType()) {
            case FOLLOW -> senderName + " has started following you.";
            case COMMENT_ON_POST -> senderName + " commented on your post.";
            case REPLY_TO_COMMENT -> senderName + " replied to your comment.";
            case POST_LIKE -> senderName + " liked your post.";
            case COMMENT_LIKE -> senderName + " liked your comment.";
            default -> "You have a new notification.";
        };
    }

    private String generateRedirectUrl(NotificationEvent event) {
        String postId = (String) event.getPayload().get("postId");
        String commentId = (String) event.getPayload().get("commentId");

        return switch (event.getType()) {
            case FOLLOW -> "/profile/" + event.getSenderId();
            case POST_LIKE, COMMENT_ON_POST -> "/posts/" + postId;
            case COMMENT_LIKE, REPLY_TO_COMMENT -> "/posts/" + postId + "?comment=" + commentId;
            default -> "/";
        };
    }
}