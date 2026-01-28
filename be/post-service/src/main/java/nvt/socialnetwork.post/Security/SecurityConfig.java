package nvt.socialnetwork.post.Security;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;

    public SecurityConfig(JwtAuthenticationFilter jwtAuthenticationFilter) {
        this.jwtAuthenticationFilter = jwtAuthenticationFilter;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .csrf(AbstractHttpConfigurer::disable)
                .authorizeHttpRequests(auth -> auth
                        // 1. QUAN TRỌNG: Cho phép OPTIONS đi qua (để trình duyệt không chặn CORS)
                        .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()

                        // 2. Feed cá nhân bắt buộc phải đăng nhập (Đặt trước rules public aka
                        // permitAll)
                        .requestMatchers("/posts/feed").authenticated()

                        // 3. Cho phép xem bài viết công khai
                        .requestMatchers(HttpMethod.GET, "/posts/**").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/posts/**").permitAll()
                        // 4. Các hành động ghi (Tạo, Sửa, Xóa, Like) bắt buộc đăng nhập
                        .anyRequest().authenticated())
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}