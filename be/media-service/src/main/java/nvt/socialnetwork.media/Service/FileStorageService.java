package nvt.socialnetwork.media.Service;

import nvt.socialnetwork.media.Exception.StorageException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import jakarta.annotation.PostConstruct;
import java.io.IOException;
import java.io.InputStream;
import java.net.MalformedURLException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.UUID;

@Service
public class FileStorageService {

    // Lớp record nội bộ để trả về thông tin file đã lưu
    public record StoredFileMetadata(String storageFileName, String originalFileName, String contentType, long size) {
    }

    // Lấy đường dẫn thư mục upload từ file application.yml
    @Value("${file.upload-dir}")
    private String uploadDir;

    private Path rootLocation;

    // Phương thức này sẽ được gọi ngay sau khi service được tạo
    // Dùng để tạo thư mục upload nếu nó chưa tồn tại
    @PostConstruct
    public void init() {
        this.rootLocation = Paths.get(uploadDir);
        try {
            Files.createDirectories(rootLocation);
        } catch (IOException e) {
            throw new StorageException("Could not initialize storage location", e);
        }
    }

    // Phương thức để lưu file
    public StoredFileMetadata store(MultipartFile file) {
        // Chuẩn hóa tên file gốc (loại bỏ các ký tự không an toàn)
        String originalFileName = StringUtils.cleanPath(file.getOriginalFilename());

        try {
            if (file.isEmpty()) {
                throw new StorageException("Failed to store empty file " + originalFileName);
            }
            if (originalFileName.contains("..")) {
                throw new StorageException(
                        "Cannot store file with relative path outside current directory " + originalFileName);
            }

            // Tạo tên file duy nhất để lưu trữ
            String fileExtension = StringUtils.getFilenameExtension(originalFileName);
            String storageFileName = UUID.randomUUID().toString() + "." + fileExtension;

            // Copy file vào thư mục đích
            Path destinationFile = this.rootLocation.resolve(Paths.get(storageFileName)).normalize().toAbsolutePath();
            try (InputStream inputStream = file.getInputStream()) {
                Files.copy(inputStream, destinationFile, StandardCopyOption.REPLACE_EXISTING);
            }

            // Trả về metadata của file đã lưu
            return new StoredFileMetadata(storageFileName, originalFileName, file.getContentType(), file.getSize());

        } catch (IOException e) {
            throw new StorageException("Failed to store file " + originalFileName, e);
        }
    }

    // Phương thức để tải file dưới dạng Resource
    public Resource loadAsResource(String storageFileName) {
        try {
            Path file = rootLocation.resolve(storageFileName);
            Resource resource = new UrlResource(file.toUri());
            if (resource.exists() || resource.isReadable()) {
                return resource;
            } else {
                throw new StorageException("Could not read file: " + storageFileName);
            }
        } catch (MalformedURLException e) {
            throw new StorageException("Could not read file: " + storageFileName, e);
        }
    }

    // Phương thức để xóa file
    public void delete(String storageFileName) {
        try {
            Path file = rootLocation.resolve(storageFileName);
            Files.deleteIfExists(file);
        } catch (IOException e) {
            throw new StorageException("Could not delete file: " + storageFileName, e);
        }
    }
}