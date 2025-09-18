package nvt.socialnetwork.user.Entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

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
    // private String avatarUrl; // Link ảnh đại diện
    // private String coverUrl; // Ảnh bìa (nếu có)
    private UUID avatarId;
    private UUID coverId;
    private String publicEmail; // Email hiển thị (khác với đăng nhập)
    private String phoneNumber; // Số điện thoại (tùy chọn)
    private String gender; // Giới tính (Male / Female / Other)
    private LocalDate birthday; // Ngày sinh

    @ElementCollection
    private List<String> interests; // Danh sách sở thích

    private String location; // Nơi ở / quê quán
    private LocalDate createdAt;
    private boolean privateProfile;
}
