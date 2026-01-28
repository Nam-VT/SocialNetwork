package nvt.socialnetwork.user.DTO.Response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.Instant;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FriendRequestResponse {
    private UUID id; // Friendship ID (Request ID)
    private UserResponse requester;
    private Instant createdAt;
}
