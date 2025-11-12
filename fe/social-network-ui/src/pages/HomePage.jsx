// src/pages/HomePage.jsx

import CreatePostForm from '../features/post/CreatePostForm';
import PostList from '../features/post/PostList';

const HomePage = () => {
    return (
        // Sử dụng một layout container để căn giữa nội dung (tùy chọn)
        <div style={{ maxWidth: '700px', margin: '0 auto' }}>
            {/* Component để người dùng tạo bài viết mới */}
            <CreatePostForm />

            {/* Component hiển thị danh sách bài viết từ những người đã follow */}
            <PostList />
        </div>
    );
};

export default HomePage;