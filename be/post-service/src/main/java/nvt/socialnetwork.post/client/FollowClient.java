package nvt.socialnetwork.post.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

import nvt.socialnetwork.post.dto.response.UserResponse;

@FeignClient(name = "follow-service", path = "/follows")
public interface FollowClient {

    @GetMapping("/{userId}/followers")
    ResponseEntity<Page<UserResponse>> getFollowers(@PathVariable("userId") String userId, Pageable pageable);

    @GetMapping("/{userId}/following")
    ResponseEntity<Page<UserResponse>> getFollowing(@PathVariable("userId") String userId, Pageable pageable);
}
