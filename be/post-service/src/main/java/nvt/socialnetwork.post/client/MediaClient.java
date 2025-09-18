package nvt.socialnetwork.post.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import java.util.List;
import java.util.UUID;

@FeignClient(name = "media-service", path = "/media")
public interface MediaClient {
    @PostMapping("/internal/validate-ids")
    ResponseEntity<Boolean> validateMediaIds(@RequestBody List<UUID> mediaIds);
}