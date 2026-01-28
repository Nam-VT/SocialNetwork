package nvt.socialnetwork.chat.Repository;

import nvt.socialnetwork.chat.Entity.ChatMessage;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface ChatMessageRepository extends JpaRepository<ChatMessage, UUID> {

    // Lấy tin nhắn theo chatRoomId, sắp xếp theo thời gian gửi (mới nhất đầu tiên)
    Page<ChatMessage> findByChatRoomIdOrderByTimestampDesc(UUID chatRoomId, Pageable pageable);

    // Xóa tất cả tin nhắn trong một phòng chat
    void deleteByChatRoomId(UUID chatRoomId);
}