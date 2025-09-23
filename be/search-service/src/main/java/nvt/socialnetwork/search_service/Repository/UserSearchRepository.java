package nvt.socialnetwork.search_service.Repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.elasticsearch.repository.ElasticsearchRepository;
import org.springframework.stereotype.Repository;

import nvt.socialnetwork.search_service.Document.UserDocument;

@Repository
public interface UserSearchRepository extends ElasticsearchRepository<UserDocument, String> {

    // Spring Data Elasticsearch sẽ tự động tạo câu truy vấn
    // để tìm kiếm trên các trường `displayName` hoặc `email`
    Page<UserDocument> findByDisplayNameContainingOrEmailContaining(String displayName, String email, Pageable pageable);

}
