package nvt.socialnetwork.Repository;

import nvt.socialnetwork.Entity.UserAuth;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface UserAuthRepo extends JpaRepository<UserAuth, UUID> {
    Optional<UserAuth> findByEmail(String email);
}
