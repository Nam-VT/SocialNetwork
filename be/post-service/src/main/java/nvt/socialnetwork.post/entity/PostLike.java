package nvt.socialnetwork.post.entity;

import java.time.LocalDateTime;

import jakarta.persistence.*;
import java.util.UUID;
import lombok.*;

@Entity
@Table(name = "post_likes", uniqueConstraints = {
        @UniqueConstraint(columnNames = { "postId", "userId" })
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PostLike {

    @Id
    private UUID id;

    private UUID postId;
    private String userId;

    private LocalDateTime likedAt;
}