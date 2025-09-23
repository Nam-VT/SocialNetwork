package nvt.socialnetwork.search_service.Document;

import java.time.LocalDateTime;
import java.util.UUID;

import org.springframework.data.annotation.Id;
import org.springframework.data.elasticsearch.annotations.Document;
import org.springframework.data.elasticsearch.annotations.Field;
import org.springframework.data.elasticsearch.annotations.FieldType;

import lombok.Data;

@Data
@Document(indexName = "posts")
public class PostDocument {

    @Id
    private UUID id; // Chính là postId

    @Field(type = FieldType.Text, name = "content")
    private String content;

    @Field(type = FieldType.Keyword, name = "user_id")
    private String userId; // ID của người đăng

    @Field(type = FieldType.Date, name = "created_at")
    private LocalDateTime createdAt;
}