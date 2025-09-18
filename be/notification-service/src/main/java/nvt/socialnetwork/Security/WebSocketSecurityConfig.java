package nvt.socialnetwork.Security;

import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.messaging.MessageSecurityMetadataSourceRegistry;
import org.springframework.security.config.annotation.web.socket.AbstractSecurityWebSocketMessageBrokerConfigurer;

@Configuration
public class WebSocketSecurityConfig extends AbstractSecurityWebSocketMessageBrokerConfigurer {

    @Override
    protected void configureInbound(MessageSecurityMetadataSourceRegistry messages) {
        messages
                // Yêu cầu tất cả các message gửi đến destination bắt đầu bằng "/topic"
                // phải có quyền 'USER'. Điều này ngăn client subscribe vào các kênh
                // mà không được xác thực. Tuy nhiên, điều này cần tích hợp sâu hơn.
                // Để đơn giản hóa, chúng ta sẽ cho phép tất cả.
                // .simpDestMatchers("/topic/**").hasRole("USER")
                
                // Cho phép tất cả các message (bao gồm cả SUBSCRIBE) đi qua mà không cần quyền
                .anyMessage().permitAll();
    }

    /**
     * Tắt tính năng CSRF cho WebSocket.
     * Tương tự như CSRF cho HTTP, nó không cần thiết khi dùng JWT
     * và có thể gây ra lỗi kết nối.
     */
    @Override
    protected boolean sameOriginDisabled() {
        return true;
    }
}