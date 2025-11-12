package nvt.socialnetwork.Dto.Response;

import java.time.LocalDate;
import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
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
