package nvt.socialnetwork.user.Entity;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(name = "reports")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Report {
    @Id
    private String id;

    private String reporterId;
    private String targetId;
    private String targetType; // USER, POST
    private String reason;
    private String status; // PENDING, RESOLVED, REJECTED
    private LocalDateTime createdAt;
}
