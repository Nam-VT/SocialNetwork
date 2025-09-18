package nvt.socialnetwork.post.repository;

import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import nvt.socialnetwork.post.entity.Post;

import org.springframework.stereotype.Repository;

@Repository
public interface PostRepo extends JpaRepository<Post, UUID> {

    List<Post> findByUserIdAndIsDeletedFalseOrderByCreatedAtDesc(String userId);

}
