package nvt.socialnetwork.comment.Controller;

import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.RequestMapping;
import lombok.RequiredArgsConstructor;
import nvt.socialnetwork.comment.Service.CommentLikeService;

import java.util.UUID;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.security.core.Authentication;

@RestController
@RequestMapping("/comment-likes")
@RequiredArgsConstructor
public class CommentLikeController {

    private final CommentLikeService commentLikeService;

    // API để "like" hoặc "unlike" một bình luận
    @PostMapping
    public ResponseEntity<Void> toggleLike(@PathVariable UUID commentId, Authentication authentication) {
        commentLikeService.toggleLike(commentId, authentication);
        return ResponseEntity.ok().build();
    }

}
