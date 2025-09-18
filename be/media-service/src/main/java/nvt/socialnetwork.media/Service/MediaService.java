package nvt.socialnetwork.media.Service;

import lombok.RequiredArgsConstructor;
import nvt.socialnetwork.media.DTO.Response.MediaResponse;
import nvt.socialnetwork.media.Entity.Media;
import nvt.socialnetwork.media.Exception.ResourceNotFoundException;
import nvt.socialnetwork.media.Repository.MediaRepository;
import org.springframework.core.io.Resource;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class MediaService {
    private final MediaRepository mediaRepository;
    private final FileStorageService fileStorageService;

    @Transactional
    public MediaResponse uploadFile(MultipartFile file, String userId) {
        // 1. Lưu file vật lý và nhận lại metadata
        FileStorageService.StoredFileMetadata metadata = fileStorageService.store(file);

        // 2. Tạo đối tượng Media Entity
        Media newMedia = Media.builder()
                .id(UUID.randomUUID())
                .userId(userId)
                .fileName(metadata.originalFileName())
                .storageFileName(metadata.storageFileName())
                .contentType(metadata.contentType())
                .size(metadata.size())
                .createdAt(LocalDateTime.now())
                .build();

        // 3. Lưu metadata vào database
        Media savedMedia = mediaRepository.save(newMedia);

        // 4. Tạo URL để client có thể truy cập
        String url = ServletUriComponentsBuilder.fromCurrentContextPath()
                .path("/media/") // Cần khớp với @RequestMapping của Controller
                .path(savedMedia.getId().toString())
                .toUriString();

        // 5. Xây dựng và trả về DTO Response
        return MediaResponse.builder()
                .id(savedMedia.getId())
                .userId(savedMedia.getUserId())
                .fileName(savedMedia.getFileName())
                .contentType(savedMedia.getContentType())
                .size(savedMedia.getSize())
                .createdAt(savedMedia.getCreatedAt())
                .url(url)
                .build();
    }

    @Transactional(readOnly = true)
    public Map<String, Object> downloadFile(UUID mediaId) {
        // 1. Tìm metadata trong DB
        Media media = mediaRepository.findById(mediaId)
                .orElseThrow(() -> new ResourceNotFoundException("Media not found with id: " + mediaId));

        // 2. Tải file từ ổ đĩa
        Resource resource = fileStorageService.loadAsResource(media.getStorageFileName());

        // 3. Đóng gói kết quả để Controller sử dụng
        Map<String, Object> result = new HashMap<>();
        result.put("resource", resource);
        result.put("contentType", media.getContentType());
        return result;
    }

    @Transactional
    public void deleteFile(UUID mediaId, String userId) {
        // 1. Tìm metadata trong DB
        Media media = mediaRepository.findById(mediaId)
                .orElseThrow(() -> new ResourceNotFoundException("Media not found with id: " + mediaId));

        // 2. Kiểm tra quyền sở hữu
        if (!media.getUserId().equals(userId)) {
            // Trong một ứng dụng thực tế, nên tạo một exception riêng như
            // AccessDeniedException
            throw new RuntimeException("User does not have permission to delete this file.");
        }

        // 3. Xóa file vật lý
        fileStorageService.delete(media.getStorageFileName());

        // 4. Xóa metadata khỏi database
        mediaRepository.delete(media);
    }

    @Transactional(readOnly = true)
    public boolean validateMediaIds(List<UUID> mediaIds) {
        if (mediaIds == null || mediaIds.isEmpty()) {
            return true;
        }
        return mediaRepository.countByIdIn(mediaIds) == mediaIds.size();
    }

    @Transactional(readOnly = true)
    public void getMediaById(UUID mediaId) {
        mediaRepository.findById(mediaId)
                .orElseThrow(() -> new ResourceNotFoundException("Media not found with id: " + mediaId));
    }
}