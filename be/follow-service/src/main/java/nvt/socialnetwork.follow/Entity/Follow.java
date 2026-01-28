package nvt.socialnetwork.follow.Entity;

import java.util.UUID;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.Builder;

@Entity
@Table(name = "follow")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Follow {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "follower_id")
    private String followerId;

    @Column(name = "following_id")
    private String followingId;

}