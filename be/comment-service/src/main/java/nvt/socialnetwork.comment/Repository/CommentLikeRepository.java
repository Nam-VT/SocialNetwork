package nvt.socialnetwork.comment.Repository;

import nvt.socialnetwork.comment.Entity.CommentLike;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Repository
public interface CommentLikeRepository extends JpaRepository<CommentLike, UUID> {

    boolean existsByCommentIdAndUserId(UUID commentId, String userId);

    @Transactional
    void deleteByCommentIdAndUserId(UUID commentId, String userId);

    @Query("SELECT cl.commentId FROM CommentLike cl WHERE cl.userId = :userId AND cl.commentId IN :commentIds")
    List<UUID> findLikedCommentIdsByUserId(@Param("userId") String userId, @Param("commentIds") List<UUID> commentIds);
}
