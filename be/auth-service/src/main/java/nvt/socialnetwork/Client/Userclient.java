package nvt.socialnetwork.Client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;

import nvt.socialnetwork.Dto.Response.UserResponse;

@FeignClient(name = "user-service", path = "/users")
public interface Userclient {

    @PostMapping("/internal/create")
    ResponseEntity<UserResponse> createUser(@RequestParam String id, @RequestParam String imageUrl);
}
