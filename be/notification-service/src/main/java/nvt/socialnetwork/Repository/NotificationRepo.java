package nvt.socialnetwork.Repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import nvt.socialnetwork.Entity.Notification;

@Repository
public interface NotificationRepo extends JpaRepository<Notification, UUID> {
    List<Notification> findByReceiverIdOrderByCreatedAtDesc(String receiverId);
    Page<Notification> findByReceiverIdOrderByCreatedAtDesc(String receiverId, Pageable pageable);
    boolean existsByEventId(String eventId);
}
