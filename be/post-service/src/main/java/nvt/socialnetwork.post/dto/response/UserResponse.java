package nvt.socialnetwork.post.dto.response;

import lombok.*;
import java.time.LocalDate;
import java.util.List;

@NoArgsConstructor
@AllArgsConstructor
@Builder
@Data
public class UserResponse {
    private String id;
    private String displayName;
    private String bio;
    private String avatarUrl;
    private String coverUrl;
    private String publicEmail;
    private String phoneNumber;
    private String gender;
    private LocalDate birthday;
    private List<String> interests;
    private String location;
    private LocalDate createdAt;
    private boolean privateProfile;
}