package main.java.nvt.socialnetwork.DTO.Response;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CommentLikeResponse {
    private String id;
    private String commentId;
    private String userId;
}
