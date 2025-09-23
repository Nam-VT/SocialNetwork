package nvt.socialnetwork.search_service.Document;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.elasticsearch.annotations.Document;
import org.springframework.data.elasticsearch.annotations.Field;
import org.springframework.data.elasticsearch.annotations.FieldType;

@Data
@Document(indexName = "users") // Tên của index trong Elasticsearch
public class UserDocument {

    @Id
    private String id; // Chính là userId

    @Field(type = FieldType.Text, name = "display_name")
    private String displayName;

    @Field(type = FieldType.Text, name = "email")
    private String email;

    @Field(type = FieldType.Keyword, name = "avatar_url")
    private String avatarUrl; // Dùng để hiển thị kết quả, không dùng để tìm kiếm text
}