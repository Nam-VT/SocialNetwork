package nvt.socialnetwork.comment.Entity;

import lombok.*;

import java.time.LocalDateTime;
import java.util.UUID;
import java.util.List;

import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;

@Entity
@Table(name = "comment")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Comment {
    @Id
    private UUID id;

    @Column(nullable = false)
    private UUID postId; // ID của bài viết

    @Column(nullable = false)
    private String userId; // ID người dùng viết bình luận

    @Column(columnDefinition = "TEXT", nullable = false)
    private String content;

    @CreationTimestamp
    private LocalDateTime createdAt;

    private int likeCount;

    @Column(name = "parent_comment_id")
    private UUID parentCommentId;

    // Quan hệ tự tham chiếu để hỗ trợ trả lời lồng nhau
    @OneToMany(fetch = FetchType.LAZY)
    @JoinColumn(name = "parent_comment_id", referencedColumnName = "id", insertable = false, updatable = false)
    private List<Comment> replies;

    private boolean isDeleted;
}
