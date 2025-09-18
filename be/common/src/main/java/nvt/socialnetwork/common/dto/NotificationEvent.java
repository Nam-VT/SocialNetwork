package nvt.socialnetwork.common.dto;

import java.time.Instant;
import java.util.Map;

public class NotificationEvent {

    private String eventId;
    private Instant eventTimestamp;

    private String senderId;
    private String receiverId;
    private NotificationType type;

    private Map<String, Object> payload;

    private String version = "1.0";
    private String correlationId;

    // --- Constructors ---
    public NotificationEvent() {
    }

    public NotificationEvent(String eventId, Instant eventTimestamp,
                             String senderId, String receiverId,
                             NotificationType type, Map<String, Object> payload,
                             String version, String correlationId) {
        this.eventId = eventId;
        this.eventTimestamp = eventTimestamp;
        this.senderId = senderId;
        this.receiverId = receiverId;
        this.type = type;
        this.payload = payload;
        this.version = version;
        this.correlationId = correlationId;
    }

    // --- Builder thủ công ---
    public static Builder builder() {
        return new Builder();
    }

    public static class Builder {
        private String eventId;
        private Instant eventTimestamp;
        private String senderId;
        private String receiverId;
        private NotificationType type;
        private Map<String, Object> payload;
        private String version = "1.0";
        private String correlationId;

        public Builder eventId(String eventId) {
            this.eventId = eventId;
            return this;
        }

        public Builder eventTimestamp(Instant eventTimestamp) {
            this.eventTimestamp = eventTimestamp;
            return this;
        }

        public Builder senderId(String senderId) {
            this.senderId = senderId;
            return this;
        }

        public Builder receiverId(String receiverId) {
            this.receiverId = receiverId;
            return this;
        }

        public Builder type(NotificationType type) {
            this.type = type;
            return this;
        }

        public Builder payload(Map<String, Object> payload) {
            this.payload = payload;
            return this;
        }

        public Builder version(String version) {
            this.version = version;
            return this;
        }

        public Builder correlationId(String correlationId) {
            this.correlationId = correlationId;
            return this;
        }

        public NotificationEvent build() {
            return new NotificationEvent(eventId, eventTimestamp,
                    senderId, receiverId, type, payload,
                    version, correlationId);
        }
    }

    // --- Getters & Setters ---
    public String getEventId() { return eventId; }
    public void setEventId(String eventId) { this.eventId = eventId; }

    public Instant getEventTimestamp() { return eventTimestamp; }
    public void setEventTimestamp(Instant eventTimestamp) { this.eventTimestamp = eventTimestamp; }

    public String getSenderId() { return senderId; }
    public void setSenderId(String senderId) { this.senderId = senderId; }

    public String getReceiverId() { return receiverId; }
    public void setReceiverId(String receiverId) { this.receiverId = receiverId; }

    public NotificationType getType() { return type; }
    public void setType(NotificationType type) { this.type = type; }

    public Map<String, Object> getPayload() { return payload; }
    public void setPayload(Map<String, Object> payload) { this.payload = payload; }

    public String getVersion() { return version; }
    public void setVersion(String version) { this.version = version; }

    public String getCorrelationId() { return correlationId; }
    public void setCorrelationId(String correlationId) { this.correlationId = correlationId; }

    // --- toString() ---
    @Override
    public String toString() {
        return "NotificationEvent{" +
                "eventId='" + eventId + '\'' +
                ", eventTimestamp=" + eventTimestamp +
                ", senderId='" + senderId + '\'' +
                ", receiverId='" + receiverId + '\'' +
                ", type=" + type +
                ", payload=" + payload +
                ", version='" + version + '\'' +
                ", correlationId='" + correlationId + '\'' +
                '}';
    }
}
