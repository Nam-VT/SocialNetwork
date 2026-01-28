package nvt.socialnetwork.post.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "posts")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Post {

    @Id
    private UUID id;

    private String userId;

    @Column(columnDefinition = "TEXT")
    private String content;

    @ElementCollection
    @CollectionTable(name = "post_media", joinColumns = @JoinColumn(name = "post_id"))
    @Column(name = "media_id")
    private List<UUID> mediaIds;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    private int likeCount;
    private int commentCount;

    private boolean isDeleted;
    private boolean isPrivate;

    @Builder.Default
    private boolean hidden = false;
}