package nvt.socialnetwork.media.Repository;

import nvt.socialnetwork.media.Entity.Media;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface MediaRepository extends JpaRepository<Media, String> {

    // Tìm kiếm Media theo ID
    Optional<Media> findById(UUID id);

    long countByIdIn(List<UUID> ids);
}