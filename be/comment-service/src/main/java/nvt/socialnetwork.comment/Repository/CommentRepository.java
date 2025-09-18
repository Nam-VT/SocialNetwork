package nvt.socialnetwork.comment.Repository;

import nvt.socialnetwork.comment.Entity.Comment;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;
import java.util.List;
import java.time.LocalDateTime;

@Repository
public interface CommentRepository extends JpaRepository<Comment, UUID> {

    Page<Comment> findByPostIdAndParentCommentIdIsNullAndIsDeletedFalseOrderByCreatedAtDesc(UUID postId, Pageable pageable);

    Page<Comment> findByParentCommentIdAndIsDeletedFalseOrderByCreatedAtAsc(UUID parentCommentId, Pageable pageable);

    long countByParentCommentIdAndIsDeletedFalse(UUID parentCommentId);
    
    List<Comment> findByIsDeletedTrueAndCreatedAtBefore(LocalDateTime timestamp);
}
