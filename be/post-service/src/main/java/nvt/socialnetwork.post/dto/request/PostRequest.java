package nvt.socialnetwork.post.dto.request;

import java.util.List;
import java.util.UUID;

import lombok.Data;
import lombok.Getter;
import lombok.Setter;

@Data
@Getter
@Setter
public class PostRequest {
    // private String userId;
    private String content;
    private List<UUID> mediaIds;
    private boolean isPrivate;
}