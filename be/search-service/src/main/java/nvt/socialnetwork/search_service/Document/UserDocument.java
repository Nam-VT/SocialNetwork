package nvt.socialnetwork.search_service.Document;

import lombok.Data;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.persistence.Column;

@Data
@Entity
@Table(name = "search_users")
public class UserDocument {

    @Id
    private String id; // Chính là userId

    @Column(name = "display_name")
    private String displayName;

    @Column(name = "email")
    private String email;

    @Column(name = "avatar_url")
    private String avatarUrl;
}