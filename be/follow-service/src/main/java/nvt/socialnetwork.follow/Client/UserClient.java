package nvt.socialnetwork.follow.Client;

import java.util.List;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

import nvt.socialnetwork.follow.Dto.Response.UserResponse;

// name = "user-service": Tên của service đã đăng ký trên Eureka
// path = "/api/users": URL cơ sở của các API trong UserController của user-service
// BẠN CẦN XÁC NHẬN LẠI "path" NÀY CHO ĐÚNG
@FeignClient(name = "user-service", path = "users")
public interface UserClient {

    @GetMapping("/internal/exists/{userId}")
    ResponseEntity<Boolean> checkUserExists(@PathVariable("userId") String userId);

    @PostMapping("/internal/users-by-ids")
    ResponseEntity<List<UserResponse>> getUsersByIds(@RequestBody List<String> userIds);


}