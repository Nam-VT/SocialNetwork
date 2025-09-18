package nvt.socialnetwork.Controller;

import org.springframework.web.bind.annotation.*;
import lombok.RequiredArgsConstructor;

import nvt.socialnetwork.Dto.Request.LoginRequest;
import nvt.socialnetwork.Dto.Request.RegisterRequest;
import nvt.socialnetwork.Dto.Response.AuthResponse;
import nvt.socialnetwork.Service.AuthService;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthController {
    private final AuthService authService;

    @PostMapping("/register")
    public AuthResponse register(@RequestBody RegisterRequest registerRequest) {
        return authService.register(registerRequest);
    }

    @PostMapping("/login")
    public AuthResponse login(@RequestBody LoginRequest loginRequest) {
        return authService.login(loginRequest);
    }
}
