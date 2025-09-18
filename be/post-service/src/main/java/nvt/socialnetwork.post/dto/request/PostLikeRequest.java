package nvt.socialnetwork.post.dto.request;

import lombok.Data;
import java.util.UUID;

@Data
public class PostLikeRequest {
    private UUID postId;
    // private String userId;
}
