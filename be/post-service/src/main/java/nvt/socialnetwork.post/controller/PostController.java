package nvt.socialnetwork.post.controller;

import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import lombok.RequiredArgsConstructor;
import nvt.socialnetwork.post.dto.request.PostRequest;
import nvt.socialnetwork.post.dto.response.PostResponse;
import nvt.socialnetwork.post.service.PostService;

@RestController
@RequestMapping("/posts")
@RequiredArgsConstructor
public class PostController {

    @GetMapping("/admin/stats")
    @PreAuthorize("hasRole('ADMIN')")
    public java.util.Map<String, Object> getAdminStats() {
        return postService.getAdminStats();
    }

    private final PostService postService;

    @PostMapping
    public PostResponse createPost(@RequestBody PostRequest request, Authentication authentication) {
        return postService.createPost(request, authentication);
    }

    @GetMapping
    public Page<PostResponse> getAllPosts(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return postService.getAllPosts(page, size);
    }

    @GetMapping("/user/{userId}")
    public Page<PostResponse> getPostsByUserId(
            @PathVariable String userId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return postService.getPostsByUserId(userId, page, size);
    }

    @GetMapping("/{id}")
    public PostResponse getPostById(@PathVariable UUID id) {
        return postService.getPostById(id);
    }

    @PutMapping("/{id}")
    public PostResponse updatePost(@PathVariable UUID id, @RequestBody PostRequest request,
            Authentication authentication) {
        return postService.updatePost(id, request, authentication);
    }

    @DeleteMapping("/{id}")
    public void deletePost(@PathVariable UUID id, Authentication authentication) {
        postService.deletePost(id, authentication);
    }

    @GetMapping("/{id}/owner")
    public ResponseEntity<String> getPostOwnerId(@PathVariable UUID id) {
        String ownerId = postService.getPostOwnerId(id);
        return ResponseEntity.ok(ownerId);
    }

    @GetMapping("/feed")
    public Page<PostResponse> getNewFeeds(Authentication authentication,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return postService.getNewFeeds(authentication, page, size);
    }

    // Admin Endpoints
    @PutMapping("/{id}/hide")
    @PreAuthorize("hasRole('ADMIN')")
    public void hidePost(@PathVariable UUID id, @RequestBody java.util.Map<String, Boolean> body) {
        boolean hidden = body.getOrDefault("hidden", true);
        postService.hidePost(id, hidden);
    }

    @GetMapping("/search")
    public Page<PostResponse> searchPosts(
            @RequestParam(defaultValue = "") String content,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return postService.searchPosts(content, page, size);
    }
}
