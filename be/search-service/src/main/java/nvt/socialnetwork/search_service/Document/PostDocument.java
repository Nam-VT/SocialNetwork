package nvt.socialnetwork.search_service.Document;

import java.time.LocalDateTime;
import java.util.UUID;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.persistence.Column;
import jakarta.persistence.Lob;

import lombok.Data;

@Data
@Entity
@Table(name = "search_posts")
public class PostDocument {

    @Id
    private UUID id; // Chính là postId

    @Lob
    @Column(name = "content", columnDefinition = "TEXT")
    private String content;

    @Column(name = "user_id")
    private String userId; // ID của người đăng

    @Column(name = "created_at")
    private LocalDateTime createdAt;
}