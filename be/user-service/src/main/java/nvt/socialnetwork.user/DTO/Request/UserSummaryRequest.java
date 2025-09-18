package nvt.socialnetwork.user.DTO.Request;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserSummaryRequest {
    private String id;
    private String displayName;
    private String avatarUrl;
    private Boolean isFollowing;
}
