package nvt.socialnetwork.search_service.Service;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import lombok.RequiredArgsConstructor;
import nvt.socialnetwork.search_service.Document.PostDocument;
import nvt.socialnetwork.search_service.Document.UserDocument;
import nvt.socialnetwork.search_service.Dto.Response.SearchResponse;
import nvt.socialnetwork.search_service.Repository.PostSearchRepository;
import nvt.socialnetwork.search_service.Repository.UserSearchRepository;

@Service
@RequiredArgsConstructor
public class SearchService {

    private final UserSearchRepository userSearchRepository;
    private final PostSearchRepository postSearchRepository;

    public SearchResponse searchAll(String query, Pageable pageable) {
        // Thực hiện tìm kiếm user và post
        Page<UserDocument> userResults = searchUsers(query, pageable);
        Page<PostDocument> postResults = searchPosts(query, pageable);

        // Đóng gói kết quả vào DTO response
        SearchResponse response = new SearchResponse();
        response.setUsers(userResults);
        response.setPosts(postResults);
        
        return response;
    }

    public Page<UserDocument> searchUsers(String query, Pageable pageable) {
        return userSearchRepository.findByDisplayNameContainingOrEmailContaining(query, query, pageable);
    }

    public Page<PostDocument> searchPosts(String query, Pageable pageable) {
        // Gọi đến phương thức repository đã được cập nhật
        return postSearchRepository.findByContentContaining(query, pageable);
    }
}