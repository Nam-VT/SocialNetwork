package nvt.socialnetwork.user.Repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import nvt.socialnetwork.user.Entity.User;

import org.springframework.stereotype.Repository;
import java.util.Set;

@Repository
public interface UserRepo extends JpaRepository<User, String> {
    // Bạn có thể thêm các phương thức truy vấn tùy chỉnh nếu cần
    boolean existsById(String id); // Phương thức kiểm tra xem người dùng có tồn tại hay không

    Optional<User> findByDisplayName(String displayName); // Phương thức tìm người dùng theo tên hiển thị

    long countByIdIn(Set<String> ids);

}
