package nvt.socialnetwork.chat.Dto.Response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Basic user info DTO for Feign client response.
 * Only contains fields needed by chat-service.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserBasicResponse {
    private String id;
    private String displayName;
    private String avatarUrl;
}
