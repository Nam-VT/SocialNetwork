package nvt.socialnetwork.follow.Controller;

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
import nvt.socialnetwork.follow.Dto.Response.FollowStatusResponse;
import nvt.socialnetwork.follow.Dto.Response.UserResponse;
import nvt.socialnetwork.follow.Service.FollowService;

@RestController
@RequestMapping("/follows")
@RequiredArgsConstructor
public class FollowController {

    private final FollowService followService;

    @PostMapping("/{followingId}")
    public ResponseEntity<Void> followUser(@PathVariable String followingId, Authentication authentication) {
        followService.followUser(followingId, authentication);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{followingId}")
    public ResponseEntity<Void> unfollowUser(@PathVariable String followingId, Authentication authentication) {
        followService.unfollowUser(followingId, authentication);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{userId}/followers")
    public ResponseEntity<Page<UserResponse>> getFollowers(@PathVariable String userId, Pageable pageable) {
        Page<UserResponse> followers = followService.getFollowers(userId, pageable);
        return ResponseEntity.ok(followers);
    }

    @GetMapping("/{userId}/following")
    public ResponseEntity<Page<UserResponse>> getFollowing(@PathVariable String userId, Pageable pageable) {
        Page<UserResponse> following = followService.getFollowing(userId, pageable);
        return ResponseEntity.ok(following);
    }

    @GetMapping("/status/{targetUserId}")
    public ResponseEntity<FollowStatusResponse> getFollowStatus(@PathVariable String targetUserId, Authentication authentication) {
        FollowStatusResponse status = followService.getFollowStatus(targetUserId, authentication);
        return ResponseEntity.ok(status);
    }
}