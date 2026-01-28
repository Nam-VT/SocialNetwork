package nvt.socialnetwork.chat.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import nvt.socialnetwork.chat.Entity.ChatRoom;
import nvt.socialnetwork.chat.Entity.Enum.RoomType;

@Repository
public interface ChatRoomRepo extends JpaRepository<ChatRoom, UUID> {

       // Tìm các phòng chat mà một user là thành viên
       List<ChatRoom> findByParticipantIdsContaining(String userId);

       // Query để tìm phòng chat 1-1 giữa hai người (fixed to avoid duplicates)
       @Query("SELECT cr FROM ChatRoom cr " +
                     "WHERE cr.type = :type " +
                     "AND :userId1 MEMBER OF cr.participantIds " +
                     "AND :userId2 MEMBER OF cr.participantIds " +
                     "AND SIZE(cr.participantIds) = 2")
       Optional<ChatRoom> findPrivateChatRoomByParticipants(@Param("userId1") String userId1,
                     @Param("userId2") String userId2,
                     @Param("type") RoomType type);
}
