// package nvt.socialnetwork.comment.Controller;

// import org.springframework.scheduling.annotation.Scheduled;
// import org.springframework.stereotype.Component;
// import lombok.RequiredArgsConstructor;
// import nvt.socialnetwork.comment.Service.CommentService;

// @Component
// @RequiredArgsConstructor
// public class CleanupScheduler {
//     private final CommentService commentService;

//     // Chạy vào 2 giờ sáng mỗi ngày (cron expression)
//     @Scheduled(cron = "0 0 2 * * ?") 
//     public void cleanupComments() {
//         commentService.permanentlyDeleteOldSoftDeletedComments();
//     }
// }
