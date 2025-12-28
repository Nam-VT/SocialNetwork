package nvt.socialnetwork.user.Controller;

import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import lombok.RequiredArgsConstructor;
import nvt.socialnetwork.user.DTO.Response.FriendshipStatusResponse;
import nvt.socialnetwork.user.DTO.Response.UserResponse;
import nvt.socialnetwork.user.Service.FriendshipService;

@RestController
@RequestMapping("/api/friendships")
@RequiredArgsConstructor
public class FriendshipController {

    private final FriendshipService friendshipService;

    @PostMapping("/requests/{addresseeId}")
    public ResponseEntity<Void> sendFriendRequest(@PathVariable String addresseeId, Authentication authentication) {
        friendshipService.sendFriendRequest(addresseeId, authentication);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/requests/{requestId}/accept")
    public ResponseEntity<Void> acceptFriendRequest(@PathVariable UUID requestId, Authentication authentication) {
        friendshipService.acceptFriendRequest(requestId, authentication);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/requests/{requestId}")
    public ResponseEntity<Void> declineOrCancelRequest(@PathVariable UUID requestId, Authentication authentication) {
        friendshipService.declineOrCancelRequest(requestId, authentication);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/friends/{friendId}")
    public ResponseEntity<Void> unfriend(@PathVariable String friendId, Authentication authentication) {
        friendshipService.unfriend(friendId, authentication);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/friends/{userId}")
    public ResponseEntity<Page<UserResponse>> getFriends(@PathVariable String userId, Pageable pageable) {
        return ResponseEntity.ok(friendshipService.getFriends(userId, pageable));
    }
    
    @GetMapping("/status/{otherUserId}")
    public ResponseEntity<FriendshipStatusResponse> getFriendshipStatus(@PathVariable String otherUserId, Authentication authentication) {
        return ResponseEntity.ok(friendshipService.getFriendshipStatus(otherUserId, authentication));
    }

    // Bổ sung vào FriendshipController.java
    @GetMapping("/requests/pending")
    public ResponseEntity<Page<UserResponse>> getPendingRequests(
            Authentication authentication, 
            Pageable pageable) {
        Page<UserResponse> pendingRequests = friendshipService.getPendingRequests(authentication, pageable);
    
        return ResponseEntity.ok(pendingRequests);
    }

    @GetMapping("/suggestions")
    public ResponseEntity<Page<UserResponse>> getSuggestions(
            Authentication authentication, 
            Pageable pageable) {
        String currentUserId = authentication.getName();
        return ResponseEntity.ok(friendshipService.getSuggestions(currentUserId, pageable));
    }
}