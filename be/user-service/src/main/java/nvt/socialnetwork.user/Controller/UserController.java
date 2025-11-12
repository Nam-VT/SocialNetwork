package nvt.socialnetwork.user.Controller;

import java.util.List;
import java.util.Set;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.RequestParam;

import lombok.RequiredArgsConstructor;
import nvt.socialnetwork.user.DTO.Request.UserRequest;
import nvt.socialnetwork.user.DTO.Response.UserResponse;
import nvt.socialnetwork.user.Service.UserService;

@RestController
@RequiredArgsConstructor
@RequestMapping("/users")
public class UserController {

    private final UserService userService;

    @PostMapping
    public ResponseEntity<UserResponse> createUserProfile(@RequestBody UserRequest request) {
        UserResponse newUserResponse = userService.createUserProfile(request);
        return new ResponseEntity<>(newUserResponse, HttpStatus.CREATED);
    }

    @GetMapping("profile")
    public ResponseEntity<UserResponse> getUserProfileById(Authentication authentication) {
        UserResponse userResponse = userService.getCurrentUserProfileById(authentication);
        return ResponseEntity.ok(userResponse);
    }

    @GetMapping("/{id}")
    // @PreAuthorize("hasRole('ADMIN') or hasRole('USER')")
    public ResponseEntity<UserResponse> getUserProfileByUserId(@PathVariable String id) {
        UserResponse userResponse = userService.getUserProfileById(id);
        return ResponseEntity.ok(userResponse);
    }

    @GetMapping("/by-display-name/{displayName}")
    // @PreAuthorize("hasRole('ADMIN') or hasRole('USER')")
    public ResponseEntity<UserResponse> getUserProfileByDisplayName(@PathVariable String displayName) {
        UserResponse userResponse = userService.getUserProfileByDisplayName(displayName);
        return ResponseEntity.ok(userResponse);
    }

    @PutMapping("/{id}")
    // @PreAuthorize("hasRole('ADMIN') or hasRole('USER')")
    public ResponseEntity<UserResponse> updateUserProfile(@PathVariable String id, @RequestBody UserRequest request) {
        UserResponse updatedUser = userService.updateUserProfile(id, request);
        return ResponseEntity.ok(updatedUser);
    }

    @DeleteMapping("/{id}")
    // @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteUserProfile(@PathVariable String id) {
        userService.deleteUserProfile(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/internal/exists/{id}")
    public ResponseEntity<Boolean> checkUserExists(@PathVariable("id") String id) {
        boolean exists = userService.checkIfUserExists(id); // Giả sử bạn sẽ tạo phương thức này trong UserService
        return ResponseEntity.ok(exists);
    }

    @PostMapping("/internal/users-by-ids")
    public ResponseEntity<List<UserResponse>> getUsersByIds(@RequestBody List<String> userIds) {
        List<UserResponse> users = userService.findUsersByIds(userIds);
        return ResponseEntity.ok(users);
    }

    @PostMapping("/internal/validate-ids")
    public ResponseEntity<Boolean> validateUserIds(@RequestBody Set<String> userIds) {
        return ResponseEntity.ok(userService.validateUserIds(userIds));
    }

    @PostMapping("/internal/create")
    public ResponseEntity<UserResponse> createUser(@RequestParam String id, @RequestParam String imageUrl) {
        UserResponse user = userService.createUser(id, imageUrl);
        return ResponseEntity.status(HttpStatus.CREATED).body(user);
    }
}
