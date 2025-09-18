package nvt.socialnetwork.comment.Service;

// import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import nvt.socialnetwork.comment.Entity.Comment;
import nvt.socialnetwork.comment.Entity.CommentLike;
import nvt.socialnetwork.comment.Repository.CommentLikeRepository;
import nvt.socialnetwork.comment.Repository.CommentRepository;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.kafka.core.KafkaTemplate;
import nvt.socialnetwork.common.dto.NotificationType;
import nvt.socialnetwork.common.dto.NotificationEvent;

import java.time.Instant;
import java.util.Map;
import java.util.UUID;

@Service
// @RequiredArgsConstructor
public class CommentLikeService {

    private final CommentRepository commentRepository;
    private final CommentLikeRepository commentLikeRepository;
    private final KafkaTemplate<String, NotificationEvent> kafkaTemplate;

    @Autowired
    public CommentLikeService(CommentRepository commentRepository,
                              CommentLikeRepository commentLikeRepository,
                              KafkaTemplate<String, NotificationEvent> kafkaTemplate) {
        this.commentRepository = commentRepository;
        this.commentLikeRepository = commentLikeRepository;
        this.kafkaTemplate = kafkaTemplate;
    }

    @Value("${app.kafka.notification-topic}")
    private String notificationTopic;

    @Transactional
    public void toggleLike(UUID commentId, Authentication authentication) {
        String userId = authentication.getName();

        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new RuntimeException("Comment not found with id: " + commentId));

        if (commentLikeRepository.existsByCommentIdAndUserId(commentId, userId)) {
            commentLikeRepository.deleteByCommentIdAndUserId(commentId, userId);
            comment.setLikeCount(comment.getLikeCount() - 1);
        } else {
            CommentLike newLike = new CommentLike();
            newLike.setId(UUID.randomUUID());
            newLike.setCommentId(commentId);
            newLike.setUserId(userId);
            
            commentLikeRepository.save(newLike);
            comment.setLikeCount(comment.getLikeCount() + 1);

            if(!userId.equals(comment.getUserId())) {
                NotificationEvent notificationEvent = NotificationEvent.builder()
                        .eventId(UUID.randomUUID().toString())
                        .eventTimestamp(Instant.now())
                        .senderId(userId)
                        .receiverId(comment.getUserId())
                        .type(NotificationType.COMMENT_LIKE)
                        .payload(Map.of("postId", comment.getPostId(), "commentId", comment.getId()))
                        .build();
                kafkaTemplate.send(notificationTopic, notificationEvent);
            }
        }

        
        commentRepository.save(comment);
    }
}