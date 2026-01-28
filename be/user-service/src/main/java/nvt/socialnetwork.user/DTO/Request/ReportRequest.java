package nvt.socialnetwork.user.DTO.Request;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ReportRequest {
    private String targetId;
    private String targetType; // USER, POST
    private String reason;
}
