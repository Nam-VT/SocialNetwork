package nvt.socialnetwork.comment.Client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

import java.util.UUID;

@FeignClient(name = "post-service", path = "/posts")
public interface PostClient {

    @GetMapping("/{id}")
    ResponseEntity<Void> getPostById(@PathVariable("id") UUID id);

    @GetMapping("/{id}/owner")
    ResponseEntity<String> getPostOwnerId(@PathVariable("id") UUID id);
}