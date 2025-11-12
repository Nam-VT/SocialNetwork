package nvt.socialnetwork.user.Entity;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

import jakarta.persistence.ElementCollection;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "users")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User {

    @Id
    private String id;

    private String displayName; // Tên hiển thị (nickname)
    private String bio; // Giới thiệu bản thân
    private UUID avatarId;
    private UUID coverId;
    private String publicEmail; // Email hiển thị (khác với đăng nhập)
    private String phoneNumber; // Số điện thoại (tùy chọn)
    private String gender; // Giới tính (Male / Female / Other)
    private LocalDate birthday; // Ngày sinh

    @ElementCollection
    private List<String> interests; // Danh sách sở thích

    private String location;
    private LocalDate createdAt;
    private boolean privateProfile;
}
