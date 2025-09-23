package nvt.socialnetwork.search_service.Repository;

import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.elasticsearch.repository.ElasticsearchRepository;
import org.springframework.stereotype.Repository;

import nvt.socialnetwork.search_service.Document.PostDocument;

@Repository
public interface PostSearchRepository extends ElasticsearchRepository<PostDocument, UUID> {

    Page<PostDocument> findByContentContaining(String content, Pageable pageable);

}
