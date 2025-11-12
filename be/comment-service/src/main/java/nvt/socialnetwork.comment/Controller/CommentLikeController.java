package nvt.socialnetwork.comment.Controller;

import java.util.UUID;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import lombok.RequiredArgsConstructor;
import nvt.socialnetwork.comment.Service.CommentLikeService;

@RestController
@RequestMapping("/comment-likes")
@RequiredArgsConstructor
public class CommentLikeController {

    private final CommentLikeService commentLikeService;

    // API để "like" hoặc "unlike" một bình luận
    @PostMapping("/{commentId}")
    public ResponseEntity<Void> toggleLike(@PathVariable UUID commentId, Authentication authentication) {
        commentLikeService.toggleLike(commentId, authentication);
        return ResponseEntity.ok().build();
    }

}
