package nvt.socialnetwork.comment.DTO.Response;

import lombok.*;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CommentResponse {
    private UUID id;
    private UUID postId;
    private String userId; // Sẽ cần thông tin user để hiển thị (tên, avatar)
    private String content;
    private LocalDateTime createdAt;
    private int likeCount;
    private UUID parentCommentId;
    private int replyCount; // Số lượng trả lời của bình luận này
    private boolean isLiked; // Người dùng hiện tại đã like bình luận này chưa?
}
