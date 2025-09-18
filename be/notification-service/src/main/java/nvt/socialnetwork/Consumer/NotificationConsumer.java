package nvt.socialnetwork.Consumer;

import nvt.socialnetwork.common.dto.NotificationEvent;
import nvt.socialnetwork.Entity.Notification;
import nvt.socialnetwork.Repository.NotificationRepo;
import nvt.socialnetwork.Dto.Response.NotificationResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.stereotype.Component;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import nvt.socialnetwork.Service.NotificationProcessingService;
import java.util.UUID; // <-- THÊM IMPORT NÀY
import org.springframework.messaging.simp.SimpMessagingTemplate;
import lombok.extern.slf4j.Slf4j;

@Component
@RequiredArgsConstructor
@Slf4j
public class NotificationConsumer {
    private static final Logger log = LoggerFactory.getLogger(NotificationConsumer.class);

    private final NotificationRepo notificationRepository;
    private final NotificationProcessingService processingService;
    private final SimpMessagingTemplate messagingTemplate;

    @KafkaListener(topics = "${app.kafka.notification-topic}", groupId = "${spring.kafka.consumer.group-id}")
    public void consumeNotification(@Payload NotificationEvent event) {
        log.info("Received notification event [eventId={}]", event.getEventId());

        try {
            // Bước 1: Kiểm tra chống lặp (Idempotency)
            String eventId = event.getEventId();
            if (notificationRepository.existsByEventId(eventId)) {
                log.warn("Event [eventId={}] has already been processed. Skipping.", event.getEventId());
                return;
            }

            // Bước 2: Tạo Entity Notification từ Event
            Notification notification = processingService.createNotificationFromEvent(event);

            // Bước 3: Lưu vào Database
            Notification savedNotification = notificationRepository.save(notification);
            log.info("Notification [id={}] created successfully from event [eventId={}]", savedNotification.getId(), event.getEventId());

            // Bước 4: Đẩy thông báo real-time qua WebSocket
            pushNotificationToUser(savedNotification);

        } catch (Exception e) {
            log.error("Failed to process event [eventId={}]. Error: {}", event.getEventId(), e.getMessage(), e);
        }
    }

    private void pushNotificationToUser(Notification notification) {
        // Tạo DTO Response để gửi cho client
        NotificationResponse response = NotificationResponse.builder()
                .id(notification.getId())
                .type(notification.getType())
                .senderId(notification.getSenderId())
                .content(notification.getContent())
                .redirectUrl(notification.getRedirectUrl())
                .isRead(notification.isRead())
                .createdAt(notification.getCreatedAt())
                .build();
        
        // Định nghĩa kênh cá nhân của người nhận
        String destination = "/topic/notifications/" + notification.getReceiverId();

        // Gửi message đến kênh đó
        messagingTemplate.convertAndSend(destination, response);
        
        log.info("Pushed notification [id={}] to user [{}] via WebSocket on destination [{}]",
                notification.getId(), notification.getReceiverId(), destination);
    }
}