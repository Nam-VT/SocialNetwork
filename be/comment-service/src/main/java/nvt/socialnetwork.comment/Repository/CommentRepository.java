package nvt.socialnetwork.comment.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import nvt.socialnetwork.comment.Entity.Comment;

@Repository
public interface CommentRepository extends JpaRepository<Comment, UUID> {

    Page<Comment> findByPostIdAndParentCommentIdIsNullAndIsDeletedFalseOrderByCreatedAtDesc(UUID postId, Pageable pageable);

    Page<Comment> findByParentCommentIdAndIsDeletedFalseOrderByCreatedAtAsc(UUID parentCommentId, Pageable pageable);

    long countByParentCommentIdAndIsDeletedFalse(UUID parentCommentId);
    
    List<Comment> findByIsDeletedTrueAndCreatedAtBefore(LocalDateTime timestamp);

    @Query("SELECT c.parentCommentId as parentId, COUNT(c.id) as replyCount " +
           "FROM Comment c " +
           "WHERE c.parentCommentId IN :parentIds AND c.isDeleted = false " +
           "GROUP BY c.parentCommentId")
    List<Map<String, Object>> countRepliesByParentIds(@Param("parentIds") List<UUID> parentIds);
}
