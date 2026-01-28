package nvt.socialnetwork.chat.Config;

import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

@Configuration
@EnableWebSocketMessageBroker
@lombok.RequiredArgsConstructor
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    private final nvt.socialnetwork.chat.Util.JwtUtil jwtUtil;

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
    public void configureClientInboundChannel(
            org.springframework.messaging.simp.config.ChannelRegistration registration) {
        registration.interceptors(new org.springframework.messaging.support.ChannelInterceptor() {
            @Override
            public org.springframework.messaging.Message<?> preSend(org.springframework.messaging.Message<?> message,
                    org.springframework.messaging.MessageChannel channel) {
                org.springframework.messaging.simp.stomp.StompHeaderAccessor accessor = org.springframework.messaging.support.MessageHeaderAccessor
                        .getAccessor(message, org.springframework.messaging.simp.stomp.StompHeaderAccessor.class);

                if (org.springframework.messaging.simp.stomp.StompCommand.CONNECT.equals(accessor.getCommand())) {
                    String authorizationHeader = accessor.getFirstNativeHeader("Authorization");
                    if (authorizationHeader != null && authorizationHeader.startsWith("Bearer ")) {
                        String token = authorizationHeader.substring(7);
                        if (jwtUtil.validateToken(token)) {
                            String userId = jwtUtil.extractUserId(token);

                            // Tạo Authentication object (đơn giản, chỉ cần userId là Principal name)
                            java.security.Principal userPrincipal = new java.security.Principal() {
                                @Override
                                public String getName() {
                                    return userId;
                                }
                            };

                            accessor.setUser(
                                    new org.springframework.security.authentication.UsernamePasswordAuthenticationToken(
                                            userPrincipal, null, java.util.Collections.emptyList()));
                        }
                    }
                }
                return message;
            }
        });
    }

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        // Đăng ký endpoint để client bắt đầu kết nối WebSocket
        registry.addEndpoint("/ws-chat")
                .setAllowedOriginPatterns("*") // Cho phép kết nối từ mọi nguồn gốc
                .withSockJS();
    }
}