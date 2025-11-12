package nvt.socialnetwork.post.service;

import java.time.Instant;
import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import lombok.RequiredArgsConstructor;
import nvt.socialnetwork.common.dto.NotificationEvent;
import nvt.socialnetwork.common.dto.NotificationType;
import nvt.socialnetwork.post.client.FollowClient;
import nvt.socialnetwork.post.client.MediaClient;
import nvt.socialnetwork.post.dto.request.PostRequest;
import nvt.socialnetwork.post.dto.response.PostResponse;
import nvt.socialnetwork.post.dto.response.UserResponse;
import nvt.socialnetwork.post.entity.Post;
import nvt.socialnetwork.post.repository.PostRepo;

@Service
@RequiredArgsConstructor
public class PostService {

        private final PostRepo postRepo;
        private final MediaClient mediaClient;
        private final FollowClient followClient;
        private final KafkaTemplate<String, NotificationEvent> kafkaTemplate;

        @Value("${app.kafka.post-topic}")
        private String postTopic;

        @KafkaListener(topics = "${app.kafka.comment-topic}", groupId = "post-group")
        @Transactional
        public void handleCommentEvent(Map<String, Object> payload) {
                try {
                UUID postId = UUID.fromString((String) payload.get("postId"));
                String action = (String) payload.get("action");

                Post post = postRepo.findById(postId).orElse(null);
                if (post == null) return;

                if ("CREATED".equals(action)) {
                        post.setCommentCount(post.getCommentCount() + 1);
                } else if ("DELETED".equals(action)) {
                        post.setCommentCount(Math.max(0, post.getCommentCount() - 1));
                }
                postRepo.save(post);
                } catch (Exception e) {
                        System.err.println("Failed to handle comment event: " + e.getMessage());
                }
        }

        @Transactional
        public PostResponse createPost(PostRequest request, Authentication authentication) {
                String userId = authentication.getName();
                validateMedia(request.getMediaIds());

                Post post = Post.builder()
                                .id(UUID.randomUUID())
                                .userId(userId)
                                .content(request.getContent())
                                .mediaIds(request.getMediaIds())
                                .createdAt(LocalDateTime.now())
                                .updatedAt(LocalDateTime.now())
                                .likeCount(0)
                                .commentCount(0)
                                .isPrivate(request.isPrivate())
                                .isDeleted(false)
                                .build();

                Post savedPost = postRepo.save(post);
                sendPostEvent(savedPost, NotificationType.POST_CREATED);
                return mapPostToPostResponse(savedPost);
        }

        @Transactional
        public PostResponse updatePost(UUID id, PostRequest request, Authentication authentication) {
                String currentUserId = authentication.getName();
                Post post = postRepo.findById(id)
                                .orElseThrow(() -> new RuntimeException("Post not found with id: " + id));

                if (!post.getUserId().equals(currentUserId)) {
                        throw new RuntimeException("User does not have permission to update this post.");
                }

                validateMedia(request.getMediaIds());

                post.setContent(request.getContent());
                post.setMediaIds(request.getMediaIds());
                post.setPrivate(request.isPrivate());
                post.setUpdatedAt(LocalDateTime.now());

                Post updatedPost = postRepo.save(post);
                sendPostEvent(updatedPost, NotificationType.POST_UPDATED);
                return mapPostToPostResponse(updatedPost);
        }

        @Transactional
        public void deletePost(UUID id, Authentication authentication) {
                String currentUserId = authentication.getName();
                Post post = postRepo.findById(id)
                                .orElseThrow(() -> new RuntimeException("Post not found with id: " + id));

                if (!post.getUserId().equals(currentUserId)) {
                        throw new RuntimeException("User does not have permission to delete this post.");
                }
                
                postRepo.deleteById(id);
                NotificationEvent event = NotificationEvent.builder()
                        .eventId(UUID.randomUUID().toString())
                        .eventTimestamp(Instant.now())
                        .type(NotificationType.POST_DELETED)
                        .payload(Map.of("postId", id))
                        .build();
                kafkaTemplate.send(postTopic, event);
        }

        @Transactional(readOnly = true)
        public PostResponse getPostById(UUID id) {
                Post post = postRepo.findById(id)
                                .orElseThrow(() -> new RuntimeException("Post not found with id: " + id));
                return mapPostToPostResponse(post);
        }

        @Transactional(readOnly = true)
        public Page<PostResponse> getPostsByUserId(String userId, int page, int size) {
                Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
                Page<Post> posts = postRepo.findByUserIdAndIsDeletedFalse(userId, pageable);
                return posts.map(this::mapPostToPostResponse);
        }

        @Transactional(readOnly = true)
        public Page<PostResponse> getAllPosts(int page, int size) {
                Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
                Page<Post> posts = postRepo.findByIsDeletedFalse(pageable);
                return posts.map(this::mapPostToPostResponse);
        }

        public Page<PostResponse> getNewFeeds(Authentication authentication, int page, int size) {
                String userId = authentication.getName();

                Pageable followingPageable = PageRequest.of(page, size);
                // Sửa lại để gọi đúng client method lấy danh sách người MÌNH THEO DÕI
                Page<UserResponse> followingPage = followClient.getFollowing(userId, followingPageable).getBody();

                if (followingPage == null || followingPage.getContent().isEmpty()) {
                        return Page.empty();
                }
                List<String> followingIds = followingPage.getContent().stream() // Đây là followingIds
                        .map(UserResponse::getId)
                        .collect(Collectors.toList());

                Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
                Page<Post> posts = postRepo.findByUserIdIn(followingIds, pageable); // -> Tìm bài viết của người mình theo dõi

                return posts.map(this::mapPostToPostResponse);
        }


        private void validateMedia(List<UUID> mediaIds) {
                if (mediaIds != null && !mediaIds.isEmpty()) {
                        try {
                                ResponseEntity<Boolean> response = mediaClient.validateMediaIds(mediaIds);
                                if (response.getBody() == null || !response.getBody()) {
                                        throw new IllegalArgumentException("One or more media IDs are invalid.");
                                }
                        } catch (Exception e) {
                                throw new RuntimeException(
                                                "Failed to validate media IDs. Media service may be unavailable.", e);
                        }
                }
        }

        private void sendPostEvent(Post post, NotificationType type) {
        NotificationEvent event = NotificationEvent.builder()
                .eventId(UUID.randomUUID().toString())
                .eventTimestamp(Instant.now())
                .type(type)
                .payload(Map.of(
                    "postId", post.getId(),
                    "content", post.getContent(),
                    "userId", post.getUserId(),
                    "createdAt", post.getCreatedAt()
                ))
                .build();
        kafkaTemplate.send(postTopic, event);
        }

        private PostResponse mapPostToPostResponse(Post post) {
                List<String> mediaUrls = Collections.emptyList();
                if (post.getMediaIds() != null && !post.getMediaIds().isEmpty()) {
                        mediaUrls = post.getMediaIds().stream()
                                        .map(mediaId -> "http://localhost:8080/media/" + mediaId.toString())
                                        .collect(Collectors.toList());
                }

                return PostResponse.builder()
                                .id(post.getId())
                                .userId(post.getUserId())
                                .content(post.getContent())
                                .mediaUrls(mediaUrls)
                                .createdAt(post.getCreatedAt())
                                .updatedAt(post.getUpdatedAt())
                                .likeCount(post.getLikeCount())
                                .commentCount(post.getCommentCount())
                                .isPrivate(post.isPrivate())
                                .build();
        }

        public String getPostOwnerId(UUID postId) {
                return postRepo.findById(postId)
                                .orElseThrow(() -> new RuntimeException("Post not found with id: " + postId))
                                .getUserId();
        }
}