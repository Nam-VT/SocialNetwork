package nvt.socialnetwork.follow.Dto.Response;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FollowResponse {
    private String userId;
    private String followId;
}
