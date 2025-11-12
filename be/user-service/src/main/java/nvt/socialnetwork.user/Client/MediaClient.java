package nvt.socialnetwork.user.Client;

import java.util.List;
import java.util.UUID;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

@FeignClient(name = "media-service", path = "/media")
public interface MediaClient {

    @GetMapping("/internal/exists/{id}")
    ResponseEntity<Void> getMediaById(@PathVariable("id") UUID id);

    @PostMapping("/media/internal/validate-ids")
    ResponseEntity<Boolean> validateMediaIds(@RequestBody List<UUID> mediaIds);
}