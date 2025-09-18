package nvt.socialnetwork.follow.Exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

/**
 * Exception này được ném ra khi một tài nguyên cụ thể (ví dụ: User) không được tìm thấy.
 * Annotation @ResponseStatus(HttpStatus.NOT_FOUND) sẽ tự động làm cho tất cả
 * các response HTTP trả về mã lỗi 404 khi exception này không được xử lý ở đâu khác.
 */
@ResponseStatus(HttpStatus.NOT_FOUND)
public class ResourceNotFoundException extends RuntimeException {

    public ResourceNotFoundException(String message) {
        super(message);
    }

    public ResourceNotFoundException(String message, Throwable cause) {
        super(message, cause);
    }
}