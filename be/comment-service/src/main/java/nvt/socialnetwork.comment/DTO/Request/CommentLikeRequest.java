package nvt.socialnetwork.comment.DTO.Request;

import lombok.*;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CommentLikeRequest {
    private UUID commentId;
    private String userId;
}
