package nvt.socialnetwork.post.service;

import lombok.RequiredArgsConstructor;
import nvt.socialnetwork.post.client.MediaClient;
import nvt.socialnetwork.post.dto.request.PostRequest;
import nvt.socialnetwork.post.dto.response.PostResponse;
import nvt.socialnetwork.post.entity.Post;
import nvt.socialnetwork.post.repository.PostRepo;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PostService {

        private final PostRepo postRepo;
        private final MediaClient mediaClient;

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
        }

        @Transactional(readOnly = true)
        public PostResponse getPostById(UUID id) {
                Post post = postRepo.findById(id)
                                .orElseThrow(() -> new RuntimeException("Post not found with id: " + id));
                return mapPostToPostResponse(post);
        }

        @Transactional(readOnly = true)
        public List<PostResponse> getPostsByUserId(String userId) {
                // Giả sử repository có phương thức này
                List<Post> posts = postRepo.findByUserIdAndIsDeletedFalseOrderByCreatedAtDesc(userId);
                return posts.stream()
                                .map(this::mapPostToPostResponse)
                                .collect(Collectors.toList());
        }

        @Transactional(readOnly = true)
        public List<PostResponse> getAllPosts() {
                List<Post> posts = postRepo.findAll();
                return posts.stream()
                                .map(this::mapPostToPostResponse)
                                .collect(Collectors.toList());
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

        private PostResponse mapPostToPostResponse(Post post) {
                List<String> mediaUrls = Collections.emptyList();
                if (post.getMediaIds() != null && !post.getMediaIds().isEmpty()) {
                        mediaUrls = post.getMediaIds().stream()
                                        .map(mediaId -> "/media/" + mediaId.toString())
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