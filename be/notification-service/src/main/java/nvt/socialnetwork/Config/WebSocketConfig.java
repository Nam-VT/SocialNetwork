package nvt.socialnetwork.Config;

import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

@Configuration
@EnableWebSocketMessageBroker // Bật tính năng message broker qua WebSocket
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    @Override
    public void configureMessageBroker(MessageBrokerRegistry registry) {
        // Bật một simple broker để gửi message tới client trên các destination bắt đầu bằng "/topic"
        registry.enableSimpleBroker("/topic");
        // Định nghĩa prefix cho các message gửi từ client đến server
        registry.setApplicationDestinationPrefixes("/app");
    }

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        // Đăng ký một endpoint mà client sẽ kết nối tới để bắt đầu phiên WebSocket
        // setAllowedOriginPatterns("*") cho phép kết nối từ mọi domain (dùng cho dev)
        registry.addEndpoint("/ws-notifications").setAllowedOriginPatterns("*").withSockJS();
    }
}