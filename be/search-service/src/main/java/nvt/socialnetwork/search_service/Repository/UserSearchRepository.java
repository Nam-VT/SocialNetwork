package nvt.socialnetwork.search_service.Repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.elasticsearch.annotations.Query;
import org.springframework.data.elasticsearch.repository.ElasticsearchRepository;
import org.springframework.stereotype.Repository;

import nvt.socialnetwork.search_service.Document.UserDocument;

@Repository
public interface UserSearchRepository extends ElasticsearchRepository<UserDocument, String> {

    //Page<UserDocument> findByDisplayNameContainingOrEmailContaining(String displayName, String email, Pageable pageable);

    @Query("{\"multi_match\": {\"query\": \"?0\", \"fields\": [\"display_name^2\", \"email\"], \"fuzziness\": \"AUTO\"}}")
    Page<UserDocument> searchUsers(String query, Pageable pageable);
}
