package nvt.socialnetwork.post.dto.response;

import java.time.LocalDateTime;
import java.util.UUID;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class PostLikeResponse {
    private UUID id;
    private UUID postId;
    private String userId;
    private LocalDateTime likedAt;
}
