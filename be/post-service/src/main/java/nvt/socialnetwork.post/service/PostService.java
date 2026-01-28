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
        public Map<String, Object> getAdminStats() {
                Map<String, Object> stats = new java.util.HashMap<>();
                stats.put("totalPosts", postRepo.countByIsDeletedFalse());
                stats.put("hiddenPosts", postRepo.countByHiddenTrue());
                return stats;
        }

        private final PostRepo postRepo;
        private final MediaClient mediaClient;
        private final FollowClient followClient;
        private final nvt.socialnetwork.post.client.UserClient userClient;
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
                        if (post == null)
                                return;

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

                boolean isAdmin = authentication.getAuthorities().stream()
                                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));

                if (!post.getUserId().equals(currentUserId) && !isAdmin) {
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
                // EXCLUDE hidden posts from profile view
                Page<Post> posts = postRepo.findByUserIdAndIsDeletedFalseAndHiddenFalse(userId, pageable);
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

                // 1. Get list of users the current user is FOLLOWING
                Pageable followingRequest = PageRequest.of(0, 100);
                Page<UserResponse> followingPage = followClient.getFollowing(userId, followingRequest).getBody();

                // 2. Initialize list of IDs to query posts from, ALWAYS including the current
                // user
                java.util.List<String> targetIds = new java.util.ArrayList<>();
                targetIds.add(userId);

                if (followingPage != null && followingPage.hasContent()) {
                        List<String> followingIds = followingPage.getContent().stream()
                                        .map(UserResponse::getId)
                                        .collect(Collectors.toList());
                        targetIds.addAll(followingIds);
                }

                // 3. Query posts for ALL target IDs (Self + Following), excluding HIDDEN posts
                Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
                Page<Post> posts = postRepo.findByUserIdInAndHiddenFalse(targetIds, pageable);

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
                                                "createdAt", post.getCreatedAt()))
                                .build();
                kafkaTemplate.send(postTopic, event);
        }

        public Page<PostResponse> searchPosts(String content, int page, int size) {
                Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
                return postRepo.findByContentContainingIgnoreCase(content, pageable)
                                .map(this::mapPostToPostResponse);
        }

        @Transactional
        public void hidePost(UUID id, boolean hidden) {
                Post post = postRepo.findById(id)
                                .orElseThrow(() -> new RuntimeException("Post not found with id: " + id));
                post.setHidden(hidden);
                postRepo.save(post);
        }

        public PostResponse mapPostToPostResponse(Post post) {
                List<String> mediaUrls = Collections.emptyList();
                if (post.getMediaIds() != null && !post.getMediaIds().isEmpty()) {
                        mediaUrls = post.getMediaIds().stream()
                                        .map(mediaId -> "http://localhost:8080/media/" + mediaId.toString())
                                        .collect(Collectors.toList());
                }

                String userName = "Unknown";
                String userAvatar = null;
                try {
                        UserResponse user = userClient.getUserProfile(post.getUserId()).getBody();
                        if (user != null) {
                                userName = user.getDisplayName();
                                userAvatar = user.getAvatarUrl();
                        }
                } catch (Exception e) {
                        // Ignore error fetching user
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
                                .hidden(post.isHidden())
                                .userName(userName)
                                .userAvatar(userAvatar)
                                .build();
        }

        public String getPostOwnerId(UUID postId) {
                return postRepo.findById(postId)
                                .orElseThrow(() -> new RuntimeException("Post not found with id: " + postId))
                                .getUserId();
        }
}