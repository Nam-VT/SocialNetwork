package nvt.socialnetwork.comment.Service;

import java.time.Duration;
import java.time.Instant;
import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import lombok.RequiredArgsConstructor;
import nvt.socialnetwork.comment.Client.PostClient;
import nvt.socialnetwork.comment.DTO.Request.CommentRequest;
import nvt.socialnetwork.comment.DTO.Response.CommentResponse;
import nvt.socialnetwork.comment.Entity.Comment;
import nvt.socialnetwork.comment.Repository.CommentLikeRepository;
import nvt.socialnetwork.comment.Repository.CommentRepository;
import nvt.socialnetwork.common.dto.NotificationEvent;
import nvt.socialnetwork.common.dto.NotificationType;

// import org.springframework.beans.factory.annotation.Autowired;

@Service
@RequiredArgsConstructor
public class CommentService {

    private final CommentRepository commentRepository;
    private final CommentLikeRepository commentLikeRepository;
    private final PostClient postClient;
    private final KafkaTemplate<String, Object> kafkaTemplate;

    // @Autowired
    // public CommentService(CommentRepository commentRepository,
    // CommentLikeRepository commentLikeRepository,
    // PostClient postClient,
    // KafkaTemplate<String, Object> kafkaTemplate) {
    // this.commentRepository = commentRepository;
    // this.commentLikeRepository = commentLikeRepository;
    // this.postClient = postClient;
    // this.kafkaTemplate = kafkaTemplate;
    // }

    @Value("${app.kafka.notification-topic}")
    private String notificationTopic;

    @Value("${app.kafka.comment-topic}")
    private String commentTopic;

    @Transactional
    public CommentResponse createComment(CommentRequest request, Authentication authentication) {
        String userId = authentication.getName();

        try {
            postClient.getPostById(request.getPostId());
        } catch (Exception e) {
            throw new RuntimeException("Post not found with id: " + request.getPostId(), e);
        }

        if (request.getParentCommentId() != null) {
            if (!commentRepository.existsById(request.getParentCommentId())) {
                throw new RuntimeException("Parent comment not found with id: " + request.getParentCommentId());
            }
        }

        Comment comment = Comment.builder()
                .id(UUID.randomUUID())
                .postId(request.getPostId())
                .userId(userId)
                .content(request.getContent())
                .parentCommentId(request.getParentCommentId())
                .build();

        Comment savedComment = commentRepository.save(comment);

        sendCommentEvent(savedComment, "CREATED");

        if (comment.getParentCommentId() != null) {
            Optional<Comment> parentComment = commentRepository.findById(comment.getParentCommentId());
            if (parentComment.isPresent()) {
                String postOwnerId = postClient.getPostOwnerId(comment.getPostId()).getBody();

                if (postOwnerId != null && !userId.equals(postOwnerId)) {
                    NotificationEvent notificationEvent = NotificationEvent.builder()
                            .eventId(UUID.randomUUID().toString())
                            .eventTimestamp(Instant.now())
                            .senderId(userId)
                            .receiverId(parentComment.get().getUserId())
                            .type(NotificationType.REPLY_TO_COMMENT)
                            .payload(Map.of("postId", comment.getPostId(), "commentId", comment.getId()))
                            .build();
                    kafkaTemplate.send(notificationTopic, notificationEvent);
                }
            }
        } else {
            String postOwnerId = postClient.getPostOwnerId(comment.getPostId()).getBody();

            if (postOwnerId != null && !userId.equals(postOwnerId)) {
                NotificationEvent notificationEvent = NotificationEvent.builder()
                        .eventId(UUID.randomUUID().toString())
                        .eventTimestamp(Instant.now())
                        .senderId(userId)
                        .receiverId(postOwnerId)
                        .type(NotificationType.COMMENT_ON_POST)
                        .payload(Map.of("postId", comment.getPostId(), "commentId", comment.getId()))
                        .build();
                kafkaTemplate.send(notificationTopic, notificationEvent);
            }
        }
        return mapCommentToResponse(savedComment, Collections.emptySet(), 0);
    }

    @Transactional
    public CommentResponse updateComment(UUID commentId, String content, Authentication authentication) {
        String userId = authentication.getName();
        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new RuntimeException("Comment not found"));

        if (!userId.equals(comment.getUserId())) {
            throw new RuntimeException("You are not allowed to update this comment");
        }

        Duration duration = Duration.between(comment.getCreatedAt(), LocalDateTime.now());
        if (duration.toMinutes() > 30) { // Giới hạn 30 phút
            throw new RuntimeException("Comment is too old to update");
        }

        comment.setContent(content);
        Comment updatedComment = commentRepository.save(comment);

        // Kiểm tra lại trạng thái like của user hiện tại cho comment này
        boolean isLiked = commentLikeRepository.existsByCommentIdAndUserId(commentId, userId);

        return mapCommentToResponse(updatedComment, isLiked ? Collections.singleton(commentId) : Collections.emptySet(),
                0);
    }

    @Transactional
    public void deleteComment(UUID commentId, Authentication authentication) {
        String currentUserId = authentication.getName();
        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new RuntimeException("Comment not found"));

        if (!currentUserId.equals(comment.getUserId())) {
            // Check if user is ADMIN
            boolean isAdmin = authentication.getAuthorities().stream()
                    .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));

            if (!isAdmin) {
                throw new RuntimeException("You are not allowed to delete this comment");
            }
        }

        comment.setDeleted(true);
        comment.setContent("This comment has been deleted.");
        commentRepository.save(comment);

        sendCommentEvent(comment, "DELETED");
    }

    @Transactional(readOnly = true)
    public Page<CommentResponse> getCommentsByPost(UUID postId, Pageable pageable, Authentication authentication) {
        String userId = (authentication != null) ? authentication.getName() : null;

        try {
            postClient.getPostById(postId);
        } catch (Exception e) {
            throw new RuntimeException("Post not found with id: " + postId, e);
        }

        Page<Comment> commentPage = commentRepository
                .findByPostIdAndParentCommentIdIsNullAndIsDeletedFalseOrderByCreatedAtDesc(postId, pageable);
        return mapCommentPageToResponsePage(commentPage, userId);
    }

    @Transactional(readOnly = true)
    public Page<CommentResponse> getCommentReplies(UUID parentId, Pageable pageable, Authentication authentication) {
        String userId = (authentication != null) ? authentication.getName() : null;

        Page<Comment> replyPage = commentRepository.findByParentCommentIdAndIsDeletedFalseOrderByCreatedAtAsc(parentId,
                pageable);
        return mapCommentPageToResponsePage(replyPage, userId);
    }

    private Page<CommentResponse> mapCommentPageToResponsePage(Page<Comment> commentPage, String userId) {
        // ... logic tối ưu N+1 query giữ nguyên, đã rất tốt ...
        List<UUID> commentIds = commentPage.getContent().stream().map(Comment::getId).collect(Collectors.toList());

        Set<UUID> likedCommentIds = (userId != null && !commentIds.isEmpty())
                ? commentLikeRepository.findLikedCommentIdsByUserId(userId, commentIds).stream()
                        .collect(Collectors.toSet())
                : Collections.emptySet();

        Map<UUID, Integer> replyCounts = (commentIds.isEmpty())
                ? Collections.emptyMap()
                : commentRepository.countRepliesByParentIds(commentIds).stream()
                        .collect(Collectors.toMap(
                                map -> (UUID) map.get("parentId"),
                                map -> ((Long) map.get("replyCount")).intValue()));

        final Map<UUID, Integer> finalReplyCounts = replyCounts;
        return commentPage.map(comment -> mapCommentToResponse(comment, likedCommentIds,
                finalReplyCounts.getOrDefault(comment.getId(), 0)));
    }

    private CommentResponse mapCommentToResponse(Comment comment, Set<UUID> likedCommentIds, int replyCount) {
        // ... logic map giữ nguyên, đã tốt ...
        return CommentResponse.builder()
                .id(comment.getId())
                .postId(comment.getPostId())
                .userId(comment.getUserId())
                .content(comment.isDeleted() ? "This comment has been deleted." : comment.getContent())
                .createdAt(comment.getCreatedAt())
                .likeCount(comment.getLikeCount())
                .parentCommentId(comment.getParentCommentId())
                .replyCount(replyCount)
                .isLiked(likedCommentIds.contains(comment.getId()))
                .build();
    }

    private void sendCommentEvent(Comment comment, String action) {
        if (comment.getParentCommentId() == null) {
            Map<String, Object> payload = Map.of("postId", comment.getPostId().toString(), "action", action);
            kafkaTemplate.send(commentTopic, payload);
        }
    }

    private void sendCreationNotification(Comment comment, String senderId) {
        if (comment.getParentCommentId() != null) { // Là một reply
            Optional<Comment> parentCommentOpt = commentRepository.findById(comment.getParentCommentId());
            if (parentCommentOpt.isPresent()) {
                Comment parentComment = parentCommentOpt.get();
                // SỬA LẠI: Điều kiện kiểm tra phải là với chủ của comment gốc, không phải chủ
                // bài viết
                if (!senderId.equals(parentComment.getUserId())) {
                    NotificationEvent event = createNotificationEvent(senderId, parentComment.getUserId(),
                            NotificationType.REPLY_TO_COMMENT, comment);
                    kafkaTemplate.send(notificationTopic, event);
                }
            }
        } else { // Là một comment gốc
            String postOwnerId = postClient.getPostOwnerId(comment.getPostId()).getBody();
            if (postOwnerId != null && !senderId.equals(postOwnerId)) {
                NotificationEvent event = createNotificationEvent(senderId, postOwnerId,
                        NotificationType.COMMENT_ON_POST, comment);
                kafkaTemplate.send(notificationTopic, event);
            }
        }
    }

    private NotificationEvent createNotificationEvent(String senderId, String receiverId, NotificationType type,
            Comment comment) {
        return NotificationEvent.builder()
                .eventId(UUID.randomUUID().toString())
                .eventTimestamp(Instant.now())
                .senderId(senderId)
                .receiverId(receiverId)
                .type(type)
                .payload(Map.of("postId", comment.getPostId(), "commentId", comment.getId()))
                .build();
    }
}