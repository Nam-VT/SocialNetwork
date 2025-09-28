package nvt.socialnetwork.post.service;

import lombok.RequiredArgsConstructor;
import java.util.Optional;
import java.time.LocalDateTime;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.security.core.Authentication;
import static java.util.UUID.randomUUID;
import nvt.socialnetwork.post.repository.PostLikeRepo;
import nvt.socialnetwork.post.entity.PostLike;
import nvt.socialnetwork.post.repository.PostRepo;
import nvt.socialnetwork.post.entity.Post;
import java.util.UUID;
import java.util.List;
import nvt.socialnetwork.post.dto.response.PostLikeResponse;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PostLikeService {

    private final PostLikeRepo postLikeRepo;
    private final PostRepo postRepo;

    @Transactional
    public void toggleLike(UUID postId, Authentication authentication) {
        String userId = authentication.getName();

        Post post = postRepo.findById(postId)
                .orElseThrow(() -> new RuntimeException("Post not found"));

        Optional<PostLike> postLike = postLikeRepo.findByPostIdAndUserId(postId, userId);

        if (postLike.isPresent()) {
            postLikeRepo.delete(postLike.get());
            post.setLikeCount(post.getLikeCount() - 1);
        } else {
            PostLike newPostLike = PostLike.builder()
                    .id(randomUUID())
                    .postId(postId)
                    .userId(userId)
                    .likedAt(LocalDateTime.now())
                    .build();
            postLikeRepo.save(newPostLike);
            post.setLikeCount(post.getLikeCount() + 1);
        }
        postRepo.save(post);
    }

    public boolean hasUserLikedPost(UUID postId, Authentication authentication) {
        String userId = authentication.getName();
        return postLikeRepo.findByPostIdAndUserId(postId, userId).isPresent();
    }
}
