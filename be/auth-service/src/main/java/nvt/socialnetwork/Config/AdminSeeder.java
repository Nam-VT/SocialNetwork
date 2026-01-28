package nvt.socialnetwork.Config;

import lombok.RequiredArgsConstructor;
import nvt.socialnetwork.Client.Userclient;
import nvt.socialnetwork.Entity.UserAuth;
import nvt.socialnetwork.Repository.UserAuthRepo;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.Optional;
import java.util.UUID;

@Component
@RequiredArgsConstructor
public class AdminSeeder implements CommandLineRunner {

    private final UserAuthRepo userAuthRepo;
    private final PasswordEncoder passwordEncoder;
    private final Userclient userClient;

    @Override
    public void run(String... args) throws Exception {
        String adminEmail = "admin@gmail.com";
        Optional<UserAuth> admin = userAuthRepo.findByEmail(adminEmail);

        if (admin.isEmpty()) {
            UserAuth newAdmin = UserAuth.builder()
                    .id(UUID.randomUUID())
                    .email(adminEmail)
                    .password(passwordEncoder.encode("admin123")) // Default password
                    .role("ROLE_ADMIN")
                    .build();

            userAuthRepo.save(newAdmin);

            try {
                userClient.createUser(newAdmin.getId().toString(),
                        "https://ui-avatars.com/api/?name=Admin&background=0D8ABC&color=fff");
                System.out.println("Admin account created successfully: " + adminEmail);
            } catch (Exception e) {
                System.err.println("Failed to create admin profile in user-service: " + e.getMessage());
            }
        }
    }
}
