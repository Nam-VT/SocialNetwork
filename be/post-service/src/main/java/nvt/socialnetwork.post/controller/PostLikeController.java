package nvt.socialnetwork.post.controller;

import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.PostMapping;

import lombok.RequiredArgsConstructor;
import nvt.socialnetwork.post.service.PostLikeService;
import nvt.socialnetwork.post.dto.response.PostLikeResponse;

import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.http.ResponseEntity;

import java.util.UUID;

import org.springframework.web.bind.annotation.GetMapping;
import java.util.List;

@RestController
@RequestMapping("/api/posts")
@RequiredArgsConstructor
public class PostLikeController {

    private final PostLikeService postLikeService;

    @PostMapping("/{postId}/likes")
    public ResponseEntity<Void> toggleLike(@PathVariable UUID postId,
            Authentication authentication) {
        postLikeService.toggleLike(postId, authentication);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/{postId}/likes")
    public ResponseEntity<Boolean> hasUserLikedPost(@PathVariable UUID postId,
            Authentication authentication) {
        boolean hasLiked = postLikeService.hasUserLikedPost(postId, authentication);
        return ResponseEntity.ok(hasLiked);
    }
}
