package nvt.socialnetwork.Repository;

import java.util.List;
import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import nvt.socialnetwork.Entity.Notification;

@Repository
public interface NotificationRepo extends JpaRepository<Notification, UUID> {
    List<Notification> findByReceiverIdOrderByCreatedAtDesc(String receiverId);
    Page<Notification> findByReceiverIdOrderByCreatedAtDesc(String receiverId, Pageable pageable);
    boolean existsByEventId(String eventId);
    
    @Query("SELECT COUNT(n) FROM Notification n WHERE n.receiverId = :userId AND n.isRead = false")
    long countUnreadNotifications(@Param("userId") String userId);

    @Modifying
    @Transactional
    @Query("UPDATE Notification n SET n.isRead = true WHERE n.receiverId = :userId AND n.isRead = false")
    void markAllAsRead(@Param("userId") String userId);
}
