package nvt.socialnetwork.follow.Dto.Response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FollowStatusResponse {
    // True nếu người dùng hiện tại đang follow người dùng mục tiêu
    private boolean isFollowing; 

    // True nếu người dùng mục tiêu đang follow người dùng hiện tại
    private boolean isFollowedBy;
}