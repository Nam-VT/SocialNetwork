package nvt.socialnetwork.user.DTO.Response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserSummaryResponse {

    private String id;
    private String displayName;
    private String avatarUrl;
    private Boolean isFollowing;
}