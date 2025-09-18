package nvt.socialnetwork.chat.Client;

import java.util.Set;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

@FeignClient(name = "user-service", path = "/users")
public interface UserClient {
    @GetMapping("/internal/exists/{userId}")
    ResponseEntity<Boolean> checkUserExists(@PathVariable("userId") String userId);

    @PostMapping("/internal/validate-ids")
    ResponseEntity<Boolean> validateUserIds(@RequestBody Set<String> userIds);
}