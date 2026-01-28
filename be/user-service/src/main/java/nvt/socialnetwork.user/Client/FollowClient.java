package nvt.socialnetwork.user.Client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;

@FeignClient(name = "follow-service", path = "/follows")
public interface FollowClient {

    @PostMapping("/{followingId}")
    ResponseEntity<Void> followUser(@PathVariable("followingId") String followingId);

    @DeleteMapping("/{followingId}")
    ResponseEntity<Void> unfollowUser(@PathVariable("followingId") String followingId);

    // Internal endpoint for system-level operations
    @PostMapping("/internal/{followerId}/{followingId}")
    ResponseEntity<Void> createFollowRelationship(
            @PathVariable("followerId") String followerId,
            @PathVariable("followingId") String followingId);

    @DeleteMapping("/internal/{followerId}/{followingId}")
    ResponseEntity<Void> deleteFollowRelationship(
            @PathVariable("followerId") String followerId,
            @PathVariable("followingId") String followingId);
}
