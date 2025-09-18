package nvt.socialnetwork.comment.Controller;

import nvt.socialnetwork.comment.DTO.Request.CommentRequest;
import nvt.socialnetwork.comment.DTO.Response.CommentResponse;
import nvt.socialnetwork.comment.Service.CommentService;

import java.util.List;
import java.util.UUID;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.Authentication;

@RestController
@RequiredArgsConstructor
@RequestMapping("/comments")
public class CommentController {

    private final CommentService commentService;

    @PostMapping
    public ResponseEntity<CommentResponse> createComment(@RequestBody CommentRequest commentRequest, Authentication authentication) {
        CommentResponse commentResponse = commentService.createComment(commentRequest, authentication);
        return new ResponseEntity<>(commentResponse, HttpStatus.CREATED);
    }

    // @GetMapping("/{id}")
    // public ResponseEntity<CommentResponse> getCommentById(@PathVariable String id) {
    //     CommentResponse commentResponse = commentService.getCommentById(id);
    //     return ResponseEntity.ok(commentResponse);
    // }

    @PutMapping("/{id}")
    public ResponseEntity<CommentResponse> updateComment(@PathVariable UUID id, @RequestBody CommentRequest commentRequest, Authentication authentication) {
        CommentResponse commentResponse = commentService.updateComment(id, commentRequest.getContent(), authentication);
        return ResponseEntity.ok(commentResponse);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteComment(@PathVariable UUID id, Authentication authentication) {
        commentService.deleteComment(id, authentication);
        return ResponseEntity.noContent().build();
    }

    // API để lấy các bình luận gốc của một bài đăng (phân trang)
    @GetMapping("/post/{postId}")
    public ResponseEntity<Page<CommentResponse>> getCommentsByPost(
            @PathVariable UUID postId, Pageable pageable, Authentication authentication) {
        Page<CommentResponse> response = commentService.getCommentsByPost(postId, pageable, authentication);
        return ResponseEntity.ok(response);
    }

    // API để lấy các bình luận trả lời của một bình luận cha (phân trang)
    @GetMapping("/{parentId}/replies")
    public ResponseEntity<Page<CommentResponse>> getCommentReplies(
            @PathVariable UUID parentId, Pageable pageable, Authentication authentication) {
        Page<CommentResponse> response = commentService.getCommentReplies(parentId, pageable, authentication);
        return ResponseEntity.ok(response);
    }
}
