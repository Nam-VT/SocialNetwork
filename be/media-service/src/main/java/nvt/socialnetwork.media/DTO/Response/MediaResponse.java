package nvt.socialnetwork.media.DTO.Response;

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
    private UUID id;
    private String userId;
    private String fileName;
    private String contentType;
    private long size;
    private LocalDateTime createdAt;
    private String url; // URL để client có thể truy cập file
}