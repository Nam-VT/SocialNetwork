package nvt.socialnetwork.post.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import nvt.socialnetwork.post.entity.PostLike;
import java.util.Optional;
import java.util.UUID;
import jakarta.transaction.Transactional;

import org.springframework.stereotype.Repository;

@Repository
public interface PostLikeRepo extends JpaRepository<PostLike, UUID> {

    boolean existsByPostIdAndUserId(UUID postId, String userId);

    Optional<PostLike> findByPostIdAndUserId(UUID postId, String userId);

    // @Transactional
    // void deleteByPostIdAndUserId(String postId, String userId);
}
