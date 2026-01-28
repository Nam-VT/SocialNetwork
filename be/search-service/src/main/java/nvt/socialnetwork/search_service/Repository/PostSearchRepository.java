package nvt.socialnetwork.search_service.Repository;

import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import nvt.socialnetwork.search_service.Document.PostDocument;

public interface PostSearchRepository extends JpaRepository<PostDocument, UUID> {

    @Query("SELECT p FROM PostDocument p WHERE p.content LIKE CONCAT('%', :query, '%')")
    Page<PostDocument> searchByContent(@Param("query") String query, Pageable pageable);
}
