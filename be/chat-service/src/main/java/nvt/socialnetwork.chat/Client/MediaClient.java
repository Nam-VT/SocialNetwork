package nvt.socialnetwork.chat.Client;

import java.util.UUID;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

@FeignClient(name = "media-service", path = "/media")
public interface MediaClient {
    @GetMapping("/{id}")
    ResponseEntity<Void> getMediaById(@PathVariable("id") UUID id);
}
