package nvt.socialnetwork.comment.Client;

import java.util.UUID;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

import nvt.socialnetwork.comment.DTO.Response.PostResponse;

@FeignClient(name = "post-service", path = "/posts")
public interface PostClient {

    @GetMapping("/{id}")
    PostResponse getPostById(@PathVariable("id") UUID id);

    @GetMapping("/{id}/owner")
    ResponseEntity<String> getPostOwnerId(@PathVariable("id") UUID id);
}