package nvt.socialnetwork.comment.DTO.Request;

import lombok.*;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CommentRequest {
    private UUID postId;
    private String content;
    private UUID parentCommentId;
}
