package nvt.socialnetwork.media.Controller;


import nvt.socialnetwork.media.DTO.Response.MediaResponse;
import nvt.socialnetwork.media.Service.MediaService;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import lombok.RequiredArgsConstructor;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/media")
@RequiredArgsConstructor
public class MediaController {

    private final MediaService mediaService;

    @PostMapping
    public ResponseEntity<MediaResponse> uploadFile(@RequestParam("file") MultipartFile file,
            Authentication authentication) {
        // Lấy userId của người dùng đã được xác thực từ Spring Security Context
        String userId = authentication.getName();

        MediaResponse mediaResponse = mediaService.uploadFile(file, userId);
        return new ResponseEntity<>(mediaResponse, HttpStatus.CREATED);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Resource> downloadFile(@PathVariable UUID id) {
        Map<String, Object> result = mediaService.downloadFile(id);
        Resource resource = (Resource) result.get("resource");
        String contentType = (String) result.get("contentType");

        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(contentType))
                .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + resource.getFilename() + "\"")
                .body(resource);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteFile(@PathVariable UUID id, Authentication authentication) {
        String userId = authentication.getName();
        mediaService.deleteFile(id, userId);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/internal/validate-ids")
    public ResponseEntity<Boolean> validateMediaIds(@RequestBody List<UUID> mediaIds) {
        boolean allValid = mediaService.validateMediaIds(mediaIds);
        return ResponseEntity.ok(allValid);
    }

    @GetMapping("/internal/exists/{id}")
    public ResponseEntity<Void> getMediaById(@PathVariable UUID id) {
        mediaService.getMediaById(id);
        return ResponseEntity.ok().build();
    }
}