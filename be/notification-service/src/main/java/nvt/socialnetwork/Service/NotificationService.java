package nvt.socialnetwork.Service;


import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import lombok.RequiredArgsConstructor;
import nvt.socialnetwork.Dto.Response.NotificationResponse;
import nvt.socialnetwork.Entity.Notification;
import nvt.socialnetwork.Repository.NotificationRepo;

@Service
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationRepo notificationRepository;

    @Transactional(readOnly = true)
    public Page<NotificationResponse> getNotificationsForUser(String receiverId, Pageable pageable) {
        Page<Notification> notificationPage = notificationRepository.findByReceiverIdOrderByCreatedAtDesc(receiverId, pageable);
        return notificationPage.map(this::mapToResponse);
    }

    @Transactional
    public void markAsRead(UUID notificationId, String userId) {
        notificationRepository.findById(notificationId).ifPresent(notification -> {
            // Đảm bảo chỉ chủ nhân của thông báo mới có thể đánh dấu đã đọc
            if (notification.getReceiverId().equals(userId)) {
                notification.setRead(true);
                notificationRepository.save(notification);
            }
        });
    }

    private NotificationResponse mapToResponse(Notification notification) {
        return NotificationResponse.builder()
                .id(notification.getId())
                .senderId(notification.getSenderId())
                .type(notification.getType())
                .content(notification.getContent())
                .redirectUrl(notification.getRedirectUrl())
                .isRead(notification.isRead())
                .createdAt(notification.getCreatedAt())
                .build();
    }
}
