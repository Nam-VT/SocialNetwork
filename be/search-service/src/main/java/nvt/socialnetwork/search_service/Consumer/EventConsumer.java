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
        try {
            log.info("Received post event: type={}, eventId={}", event.getType(), event.getEventId()); // Sửa event.getType() thành event.getEventId() cho đúng log
            Map<String, Object> payload = event.getPayload();
            
            // SỬA LỖI: Parse String sang UUID an toàn
            String postIdStr = (String) payload.get("postId");
            if (postIdStr == null) return;
            UUID postId = UUID.fromString(postIdStr);

            switch (event.getType()) {
                case POST_CREATED, POST_UPDATED -> {
                    PostDocument post = new PostDocument();
                    post.setId(postId);
                    post.setContent((String) payload.get("content"));
                    post.setUserId((String) payload.get("userId"));
                    
                    // SỬA LỖI: Parse String sang LocalDateTime an toàn
                    Object createdAtObj = payload.get("createdAt");
                    if (createdAtObj != null) {
                        // Xử lý trường hợp JSON gửi dạng String ISO-8601
                        post.setCreatedAt(LocalDateTime.parse(createdAtObj.toString())); 
                    }
                    
                    postSearchRepository.save(post);
                    log.info("Indexed post document for postId: {}", postId);
                }
                case POST_DELETED -> {
                    postSearchRepository.deleteById(postId);
                    log.info("Deleted post document for postId: {}", postId);
                }
            }
        } catch (Exception e) {
            log.error("Error processing post event: {}", e.getMessage(), e);
        }
    }
}
