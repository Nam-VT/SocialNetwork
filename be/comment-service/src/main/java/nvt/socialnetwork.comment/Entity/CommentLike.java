package nvt.socialnetwork.comment.Entity;

import lombok.*;

import java.util.UUID;
import java.time.LocalDateTime;

import jakarta.persistence.*;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CommentLike {
    @Id
    private UUID id;

    private UUID commentId;
    private String userId;

    private LocalDateTime createdAt;
}
