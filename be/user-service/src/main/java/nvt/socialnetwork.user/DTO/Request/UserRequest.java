package nvt.socialnetwork.user.DTO.Request;

import lombok.*;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserRequest {
    private String displayName;
    private String bio;
    // private String avatarUrl;
    // private String coverUrl;
    private String avatarId;
    private String coverId;
    private String publicEmail;
    private String phoneNumber;
    private String gender;
    private LocalDate birthday;
    private List<String> interests;
    private String location;
    private boolean privateProfile;
}
