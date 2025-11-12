package nvt.socialweb.Config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.cloud.gateway.filter.GatewayFilterChain;
import org.springframework.cloud.gateway.filter.GlobalFilter;
import org.springframework.core.Ordered;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;

import reactor.core.publisher.Mono;

@Component
public class LoggingGlobalFilter implements GlobalFilter, Ordered {

    private static final Logger logger = LoggerFactory.getLogger(LoggingGlobalFilter.class);

    @Override
    public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {
        // Log thông tin request đến Gateway từ Client (Frontend)
        logger.info("\n\n===== GATEWAY RECEIVED REQUEST =====");
        logger.info("Path: {}", exchange.getRequest().getPath());
        logger.info("Headers: {}", exchange.getRequest().getHeaders());
        
        // Log thông tin request sẽ được chuyển đi đến Microservice
        return chain.filter(exchange).then(Mono.fromRunnable(() -> {
            logger.info("===== GATEWAY FORWARDED REQUEST & RECEIVED RESPONSE =====");
            logger.info("Response Status Code: {}", exchange.getResponse().getStatusCode());
        }));
    }

    @Override
    public int getOrder() {
        // Chạy filter này trước các filter khác để có log sớm nhất
        return -1; 
    }
}