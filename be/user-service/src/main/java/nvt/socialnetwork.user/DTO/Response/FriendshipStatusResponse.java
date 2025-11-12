package nvt.socialnetwork.user.DTO.Response;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class FriendshipStatusResponse {
    private boolean isFriends;           // Hai người đã là bạn bè
    private boolean isRequestSentByMe;   // Tôi đã gửi yêu cầu cho họ
    private boolean isRequestReceivedByMe; // Tôi đã nhận được yêu cầu từ họ
}