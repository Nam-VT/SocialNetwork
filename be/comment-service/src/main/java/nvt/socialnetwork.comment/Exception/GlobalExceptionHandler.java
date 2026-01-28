package nvt.socialnetwork.comment.Exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<Object> handleRuntimeException(RuntimeException ex) {
        String message = ex.getMessage();
        if ("Comment is too old to update".equals(message)) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("message", "Không thể chỉnh sửa bình luận đã gửi quá 30 phút."));
        }
        if ("You are not allowed to update this comment".equals(message)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("message", "Bạn không có quyền chỉnh sửa bình luận này."));
        }
        if ("You are not allowed to delete this comment".equals(message)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("message", "Bạn không có quyền xóa bình luận này."));
        }
        // Fallback for other RuntimeExceptions
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("message", message != null ? message : "Đã xảy ra lỗi không xác định."));
    }
}
