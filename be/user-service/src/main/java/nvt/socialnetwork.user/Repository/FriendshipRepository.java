package nvt.socialnetwork.user.Repository;

import java.util.Optional;
import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import nvt.socialnetwork.user.Entity.Enum.FriendshipStatus;
import nvt.socialnetwork.user.Entity.Friendship;
import nvt.socialnetwork.user.Entity.User;

public interface FriendshipRepository extends JpaRepository<Friendship, UUID> {

    // Tìm một mối quan hệ bất kỳ giữa 2 người
    @Query("SELECT f FROM Friendship f WHERE (f.requesterId = :user1Id AND f.addresseeId = :user2Id) OR (f.requesterId = :user2Id AND f.addresseeId = :user1Id)")
    Optional<Friendship> findFriendshipBetweenUsers(@Param("user1Id") String user1Id, @Param("user2Id") String user2Id);

    // Tìm các yêu cầu đã gửi đến cho một user
    Page<Friendship> findByAddresseeIdAndStatus(String addresseeId, FriendshipStatus status, Pageable pageable);

    // Tìm tất cả bạn bè của một user
    @Query("SELECT f FROM Friendship f WHERE (f.requesterId = :userId OR f.addresseeId = :userId) AND f.status = :status")
    Page<Friendship> findFriendsByUserId(@Param("userId") String userId, @Param("status") FriendshipStatus status,
            Pageable pageable);

    // Tìm tất cả các quan hệ bạn bè đã chấp nhận của một người
    @Query("SELECT f FROM Friendship f WHERE (f.requesterId = :userId OR f.addresseeId = :userId) AND f.status = nvt.socialnetwork.user.Entity.Enum.FriendshipStatus.ACCEPTED")
    Page<Friendship> findAllAcceptedFriends(String userId, Pageable pageable);

    @Query("SELECT u FROM User u WHERE u.id != :currentUserId " +
            "AND u.id NOT IN (SELECT f.addresseeId FROM Friendship f WHERE f.requesterId = :currentUserId) " +
            "AND u.id NOT IN (SELECT f.requesterId FROM Friendship f WHERE f.addresseeId = :currentUserId)")
    Page<User> findFriendSuggestions(@Param("currentUserId") String currentUserId, Pageable pageable);
}