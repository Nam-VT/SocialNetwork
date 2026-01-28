package nvt.socialnetwork.user.DTO.Response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ReportResponse {
    private String id;
    private String reporterId;
    private String reporterName;
    private String targetId;
    private String targetType;
    private String reason;
    private String status;
    private LocalDateTime createdAt;
}
