package nvt.socialnetwork.user.Repository;

import nvt.socialnetwork.user.Entity.Report;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ReportRepo extends JpaRepository<Report, String> {
    Page<Report> findByStatus(String status, Pageable pageable);

    long countByStatus(String status);
}
