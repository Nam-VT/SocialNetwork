package nvt.socialnetwork.search_service.Consumer;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.UUID;

import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.stereotype.Component;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import nvt.socialnetwork.common.dto.NotificationEvent;
import nvt.socialnetwork.search_service.Document.PostDocument;
import nvt.socialnetwork.search_service.Document.UserDocument;
import nvt.socialnetwork.search_service.Repository.PostSearchRepository;
import nvt.socialnetwork.search_service.Repository.UserSearchRepository;

@Component
@RequiredArgsConstructor
@Slf4j
public class EventConsumer {

    private final UserSearchRepository userSearchRepository;
    private final PostSearchRepository postSearchRepository;

    // Lắng nghe các sự kiện liên quan đến User
    @KafkaListener(topics = "${app.kafka.user-topic}", groupId = "search-group-user")
    public void consumeUserEvents(@Payload NotificationEvent event) {
        log.info("Received user event: type={}, eventId={}", event.getType(), event.getEventId());
        
        Map<String, Object> payload = event.getPayload();
        String userId = (String) payload.get("userId");

        if (userId == null) {
            log.warn("User event received with no userId. Skipping.");
            return;
        }

        switch (event.getType()) {
            case USER_CREATED, USER_UPDATED:
                UserDocument user = new UserDocument();
                user.setId(userId);
                user.setDisplayName((String) payload.get("displayName"));
                user.setEmail((String) payload.get("email"));
                user.setAvatarUrl((String) payload.get("avatarUrl"));
                userSearchRepository.save(user);
                log.info("Indexed user document for userId: {}", userId);
                break;

            case USER_DELETED:
                userSearchRepository.deleteById(userId);
                log.info("Deleted user document for userId: {}", userId);
                break;
                
            default:
                log.warn("Unhandled user event type: {}", event.getType());
        }
    }

    // Lắng nghe các sự kiện liên quan đến Post
    @KafkaListener(topics = "${app.kafka.post-topic}", groupId = "search-group-post")
    public void consumePostEvents(@Payload NotificationEvent event) {
        log.info("Received post event: type={}, eventId={}", event.getEventId(), event.getType());

        Map<String, Object> payload = event.getPayload();
        UUID postId = (UUID) payload.get("postId");

        if (postId == null) {
            log.warn("Post event received with no postId. Skipping.");
            return;
        }

        switch (event.getType()) {
            case POST_CREATED, POST_UPDATED:
                PostDocument post = new PostDocument();
                post.setId(postId);
                post.setContent((String) payload.get("content"));
                post.setUserId((String) payload.get("userId"));
                post.setCreatedAt((LocalDateTime) payload.get("createdAt"));
                postSearchRepository.save(post);
                log.info("Indexed post document for postId: {}", postId);
                break;

            case POST_DELETED:
                postSearchRepository.deleteById(postId);
                log.info("Deleted post document for postId: {}", postId);
                break;

            default:
                log.warn("Unhandled post event type: {}", event.getType());
        }
    }
}
