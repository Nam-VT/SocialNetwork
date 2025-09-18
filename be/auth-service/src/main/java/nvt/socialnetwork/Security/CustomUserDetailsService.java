package nvt.socialnetwork.Security;

import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import lombok.RequiredArgsConstructor;
import nvt.socialnetwork.Entity.UserAuth;
import nvt.socialnetwork.Repository.UserAuthRepo;

@RequiredArgsConstructor
@Service
public class CustomUserDetailsService implements UserDetailsService {

    private final UserAuthRepo userAuthRepo;
    
    @Override
    public UserDetails loadUserByUsername(String username) {
        UserAuth userAuth = userAuthRepo.findByEmail(username)
            .orElseThrow(() -> new UsernameNotFoundException("User not found"));
        return new CustomUserDetails(userAuth);
    }
}
