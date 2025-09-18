package nvt.socialnetwork.post.controller;

import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

import lombok.RequiredArgsConstructor;
import nvt.socialnetwork.post.service.PostLikeService;
import nvt.socialnetwork.post.dto.request.PostLikeRequest;
import nvt.socialnetwork.post.dto.response.PostLikeResponse;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.http.ResponseEntity;
import java.util.UUID;

@RestController
@RequestMapping("/api/posts/{postId}/likes")
@RequiredArgsConstructor
public class PostLikeController {

    private final PostLikeService postLikeService;

    @PostMapping
    public ResponseEntity<Void> toggleLike(@PathVariable UUID postId,
            Authentication authentication) {
        postLikeService.toggleLike(postId, authentication);
        return ResponseEntity.ok().build();
    }

}
