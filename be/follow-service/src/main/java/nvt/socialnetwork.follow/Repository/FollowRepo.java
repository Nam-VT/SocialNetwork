package nvt.socialnetwork.follow.Repository;

import nvt.socialnetwork.follow.Entity.Follow;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.repository.query.Param;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface FollowRepo extends JpaRepository<Follow, UUID> {
    // Optional<Follow> findByEmail(String email);

    boolean existsByFollowerIdAndFollowingId(String followerId, String followingId);

    void deleteByFollowerIdAndFollowingId(String followerId, String followingId);

    @Query("SELECT f FROM Follow f WHERE f.followingId = :userId")
    Page<Follow> findFollowersByUserId(@Param("userId") String userId, Pageable pageable);

    @Query("SELECT f FROM Follow f WHERE f.followerId = :userId")
    Page<Follow> findFollowingByUserId(@Param("userId") String userId, Pageable pageable);
}
