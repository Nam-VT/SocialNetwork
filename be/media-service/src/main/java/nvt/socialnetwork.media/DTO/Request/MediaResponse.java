package nvt.socialnetwork.media.DTO.Request;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MediaResponse {
    private String userId;
    private String fileName;
    private String contentType;
    private long size;
    private LocalDateTime createdAt;
    // private String url;
}