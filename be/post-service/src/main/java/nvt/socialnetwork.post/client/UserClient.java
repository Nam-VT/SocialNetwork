package nvt.socialnetwork.post.client;

import java.util.List;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

import nvt.socialnetwork.post.dto.response.UserResponse;

@FeignClient(name = "user-service", path = "/users")
public interface UserClient {

    @GetMapping("/{id}")
    ResponseEntity<UserResponse> getUserProfile(@PathVariable("id") String id);

    @PostMapping("/internal/users-by-ids")
    ResponseEntity<List<UserResponse>> getUsersByIds(@RequestBody List<String> userIds);
}
