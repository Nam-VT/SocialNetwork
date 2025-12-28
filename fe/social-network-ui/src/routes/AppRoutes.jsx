// src/routes/AppRoutes.jsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import MainLayout from '../layout/MainLayout'; // Đảm bảo thư mục là 'layout' chứ không phải 'layouts'
import HomePage from '../pages/HomePage';
import LoginPage from '../pages/LoginPage';
import ChatLayout from '../layout/ChatLayout';
import ChatWindow from '../features/chat/ChatWindow';
import SearchPage from '../pages/SearchPage'; 
import ProfilePage from '../pages/ProfilePage';
import PostDetailPage from '../features/post/PostDetailPage';
import PrivateRoute from '../components/auth/PrivateRoute';
// SỬA LỖI 1: Thêm import cho FriendRequestsPage
import FriendRequestsPage from '../pages/FriendRequestsPage'; 

const AppRoutes = () => {
    return (
        <BrowserRouter>
            <Routes>
                {/* Public Route */}
                <Route path="/login" element={<LoginPage />} />

                {/* Protected Routes - Đã được bọc bởi PrivateRoute */}
                <Route element={<PrivateRoute />}>
                    
                    {/* Routes sử dụng MainLayout (Có Header/Sidebar chung) */}
                    <Route element={<MainLayout />}>
                        <Route path="/" element={<HomePage />} />
                        <Route path="/profile/:userId" element={<ProfilePage />} />
                        <Route path="/post/:postId" element={<PostDetailPage />} />
                        <Route path="/search" element={<SearchPage />} />
                        {/* SỬA LỖI 2: Đưa FriendRequests vào đây để có giao diện chung, bỏ bọc PrivateRoute dư thừa */}
                        <Route path="/friend-requests" element={<FriendRequestsPage />} />
                    </Route>

                    {/* Routes sử dụng ChatLayout (Giao diện nhắn tin riêng biệt) */}
                    <Route path="/chat" element={<ChatLayout />}>
                        <Route index element={<ChatWindow />} />
                        <Route path=":chatRoomId" element={<ChatWindow />} />
                    </Route>

                </Route>

                {/* Not Found Route */}
                <Route path="*" element={<div>404 Not Found</div>} />
            </Routes>
        </BrowserRouter>
    );
};

export default AppRoutes;


