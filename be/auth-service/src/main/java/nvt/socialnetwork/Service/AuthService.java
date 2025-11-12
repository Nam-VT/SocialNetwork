package nvt.socialnetwork.Service;

import java.util.Optional;
import java.util.UUID;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import lombok.RequiredArgsConstructor;
import nvt.socialnetwork.Dto.Request.LoginRequest;
import nvt.socialnetwork.Dto.Request.RegisterRequest;
import nvt.socialnetwork.Dto.Response.AuthResponse;
import nvt.socialnetwork.Entity.UserAuth;
import nvt.socialnetwork.Repository.UserAuthRepo;
import nvt.socialnetwork.Util.JwtUtil;
import nvt.socialnetwork.Client.Userclient;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final JwtUtil jwtUtil;
    private final UserAuthRepo userAuthRepo;
    private final PasswordEncoder passwordEncoder;
    private final Userclient userclient;

    public AuthResponse register(RegisterRequest registerRequest) {
        Optional<UserAuth> userAuthOptional = userAuthRepo.findByEmail(registerRequest.getEmail());
        if (userAuthOptional.isPresent()) {
            throw new RuntimeException("User already exists");
        }

        if(registerRequest.getImageUrl() == null) {
            registerRequest.setImageUrl("https://cdn-icons-png.flaticon.com/512/149/149071.png");
        }

        UserAuth userAuth = UserAuth.builder()
                .id(UUID.randomUUID())
                .email(registerRequest.getEmail())
                .password(passwordEncoder.encode(registerRequest.getPassword()))
                .role("ROLE_USER")
                .build();

        userAuthRepo.save(userAuth);
        userclient.createUser(userAuth.getId().toString(), registerRequest.getImageUrl());
        String token = jwtUtil.generateToken(userAuth.getId().toString(), userAuth.getRole());
        return AuthResponse.builder()
                .token(token)
                .userId(userAuth.getId().toString())
                .email(userAuth.getEmail())
                .role(userAuth.getRole())
                .build();
    }

    public AuthResponse login(LoginRequest loginRequest) {
        Optional<UserAuth> userAuthOptional = userAuthRepo.findByEmail(loginRequest.getEmail());
        if (userAuthOptional.isEmpty()) {
            throw new RuntimeException("User not found");
        }

        UserAuth userAuth = userAuthOptional.get();
        if(!passwordEncoder.matches(loginRequest.getPassword(), userAuth.getPassword())) {
            throw new RuntimeException("Invalid password");
        }

        String token = jwtUtil.generateToken(userAuth.getId().toString(), userAuth.getRole());
        return AuthResponse.builder()
                .token(token)
                .userId(userAuth.getId().toString())
                .email(userAuth.getEmail())
                .role(userAuth.getRole())
                .build();
    }

    public AuthResponse getUserProfile(String userId) {
        UserAuth userAuth = userAuthRepo.findById(UUID.fromString(userId))
                .orElseThrow(() -> new RuntimeException("User not found"));
        return AuthResponse.builder()
                .userId(userAuth.getId().toString())
                .email(userAuth.getEmail())
                .role(userAuth.getRole())
                .build();
    }

    
}
