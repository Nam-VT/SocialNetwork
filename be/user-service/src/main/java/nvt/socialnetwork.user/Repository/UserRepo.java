package nvt.socialnetwork.user.Repository;

import java.util.List;
import java.util.Optional;
import java.util.Set;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import nvt.socialnetwork.user.Entity.User;

@Repository
public interface UserRepo extends JpaRepository<User, String> {
    // Bạn có thể thêm các phương thức truy vấn tùy chỉnh nếu cần
    @Override
    boolean existsById(String id);

    @Override
    Optional<User> findById(String id);

    Optional<User> findByDisplayName(String displayName); // Phương thức tìm người dùng theo tên hiển thị

    long countByIdIn(Set<String> ids);

    List<User> findByIdIn(Set<String> ids);

    org.springframework.data.domain.Page<User> findByDisplayNameContainingIgnoreCase(String displayName,
            org.springframework.data.domain.Pageable pageable);

    long countByCreatedAt(java.time.LocalDate createdAt);
}
