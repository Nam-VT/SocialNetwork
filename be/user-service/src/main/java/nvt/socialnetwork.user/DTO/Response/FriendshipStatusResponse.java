package nvt.socialnetwork.user.DTO.Response;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class FriendshipStatusResponse {
    @JsonProperty("isFriends")
    private boolean isFriends; // Hai người đã là bạn bè

    @JsonProperty("isRequestSentByMe")
    private boolean isRequestSentByMe; // Tôi đã gửi yêu cầu cho họ

    @JsonProperty("isRequestReceivedByMe")
    private boolean isRequestReceivedByMe; // Tôi đã nhận được yêu cầu từ họ

    private String requestId; // ID của friend request (nếu có)
}