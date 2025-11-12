package nvt.socialnetwork.post.Security;

import java.io.IOException;
import java.util.Collections;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException; // <-- Thêm import cho Logger
import jakarta.servlet.http.HttpServletRequest; // <-- Thêm import cho Logger
import jakarta.servlet.http.HttpServletResponse;
import nvt.socialnetwork.post.Util.JwtUtil;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtUtil jwtUtil;

    private static final Logger logger = LoggerFactory.getLogger(JwtAuthenticationFilter.class);

    public JwtAuthenticationFilter(JwtUtil jwtUtil) {
        this.jwtUtil = jwtUtil;
    }

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain) throws ServletException, IOException {

        final String authHeader = request.getHeader("Authorization");

        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            filterChain.doFilter(request, response);
            return;
        }

        String jwt = authHeader.substring(7);
        String userId = null;

        try {
            userId = jwtUtil.extractUserId(jwt);
            System.out.println("Successfully extracted userId: " + userId);
        } catch (Exception e) {
            // --- THÊM LOG LỖI Ở ĐÂY ---
            System.err.println("!!! ERROR parsing JWT: " + e.getClass().getName() + " - " + e.getMessage());
            // --- KẾT THÚC LOG LỖI ---
        }

        if (userId == null) {
            filterChain.doFilter(request, response);
            return;
        }

        if (SecurityContextHolder.getContext().getAuthentication() == null) {
            if (jwtUtil.validateToken(jwt)) { // Chỉ cần validate chữ ký và thời hạn
                String role = jwtUtil.extractRole(jwt);

                UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                        userId, // Principal là userId
                        null,
                        Collections.singletonList(new SimpleGrantedAuthority(role)));

                authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                SecurityContextHolder.getContext().setAuthentication(authToken);

                logger.info("Successfully authenticated user: {}", userId);
            }
        }
        filterChain.doFilter(request, response);
    }
}