package nvt.socialnetwork.search_service.Repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import nvt.socialnetwork.search_service.Document.UserDocument;

public interface UserSearchRepository extends JpaRepository<UserDocument, String> {

    // Page<UserDocument> findByDisplayNameContainingOrEmailContaining(String
    // displayName, String email, Pageable pageable);

    @Query("SELECT u FROM UserDocument u WHERE LOWER(u.displayName) LIKE LOWER(CONCAT('%', :query, '%')) OR LOWER(u.email) LIKE LOWER(CONCAT('%', :query, '%'))")
    Page<UserDocument> searchUsers(@Param("query") String query, Pageable pageable);
}
