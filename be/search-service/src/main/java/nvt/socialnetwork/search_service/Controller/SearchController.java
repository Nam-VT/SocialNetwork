package nvt.socialnetwork.search_service.Controller;

import lombok.RequiredArgsConstructor;
import nvt.socialnetwork.search_service.Document.PostDocument;
import nvt.socialnetwork.search_service.Document.UserDocument;
import nvt.socialnetwork.search_service.Dto.Response.SearchResponse;
import nvt.socialnetwork.search_service.Service.SearchService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/search")
@RequiredArgsConstructor
public class SearchController {

    private final SearchService searchService;

    // Endpoint tìm kiếm tổng hợp
    @GetMapping
    public ResponseEntity<SearchResponse> searchAll(
            @RequestParam(name = "q") String query,
            Pageable pageable) {
        SearchResponse response = searchService.searchAll(query, pageable);
        return ResponseEntity.ok(response);
    }

    // Endpoint chỉ tìm kiếm user
    @GetMapping("/users")
    public ResponseEntity<Page<UserDocument>> searchUsers(
            @RequestParam(name = "q") String query,
            Pageable pageable) {
        Page<UserDocument> response = searchService.searchUsers(query, pageable);
        return ResponseEntity.ok(response);
    }

    // Endpoint chỉ tìm kiếm post
    @GetMapping("/posts")
    public ResponseEntity<Page<PostDocument>> searchPosts(
            @RequestParam(name = "q") String query,
            Pageable pageable) {
        Page<PostDocument> response = searchService.searchPosts(query, pageable);
        return ResponseEntity.ok(response);
    }
}