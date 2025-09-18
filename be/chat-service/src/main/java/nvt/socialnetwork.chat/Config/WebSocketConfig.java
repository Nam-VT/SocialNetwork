package nvt.socialnetwork.chat.Config;

import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    @Override
    public void configureMessageBroker(MessageBrokerRegistry registry) {
        // Destination prefix cho các message gửi từ server đến client
        // Client sẽ subscribe vào các kênh bắt đầu bằng /topic
        // Ví dụ: /topic/chats/{chatRoomId}
        registry.enableSimpleBroker("/topic");

        // Destination prefix cho các message gửi từ client đến server
        // Ví dụ: Client gửi message đến /app/chat/{chatRoomId}
        registry.setApplicationDestinationPrefixes("/app");
    }

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        // Đăng ký endpoint để client bắt đầu kết nối WebSocket
        registry.addEndpoint("/ws-chat")
                .setAllowedOriginPatterns("*") // Cho phép kết nối từ mọi nguồn gốc
                .withSockJS();
    }
}