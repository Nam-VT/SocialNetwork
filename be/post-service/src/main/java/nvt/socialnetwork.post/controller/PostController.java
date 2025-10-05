package nvt.socialnetwork.post.controller;

import java.util.List;
import java.util.UUID;

import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.DeleteMapping;
import lombok.RequiredArgsConstructor;
import nvt.socialnetwork.post.service.PostService;
import nvt.socialnetwork.post.dto.response.PostResponse;
import nvt.socialnetwork.post.dto.request.PostRequest;
import org.springframework.security.core.Authentication;
import org.springframework.http.ResponseEntity;
import org.springframework.data.domain.Page;
import org.springframework.web.bind.annotation.RequestParam;

@RestController
@RequestMapping("/posts")
@RequiredArgsConstructor
public class PostController {

    private final PostService postService;

    @PostMapping
    public PostResponse createPost(@RequestBody PostRequest request, Authentication authentication) {
        return postService.createPost(request, authentication);
    }

    @GetMapping
    public Page<PostResponse> getAllPosts(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        return postService.getAllPosts(page, size);
    }

    @GetMapping("/user/{userId}")
    public Page<PostResponse> getPostsByUserId(
            @PathVariable String userId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
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
    public Page<PostResponse> getNewFeeds (Authentication authentication,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return postService.getNewFeeds(authentication, page, size);
    }
}
