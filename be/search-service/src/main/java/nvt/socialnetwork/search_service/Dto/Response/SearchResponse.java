package nvt.socialnetwork.search_service.Dto.Response;

import org.springframework.data.domain.Page;

import lombok.Data;
import nvt.socialnetwork.search_service.Document.PostDocument;
import nvt.socialnetwork.search_service.Document.UserDocument;

@Data
public class SearchResponse {
    private Page<UserDocument> users;
    private Page<PostDocument> posts;

}