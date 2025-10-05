// src/routes/AppRoutes.jsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import MainLayout from '../layout/MainLayout';
import ProtectedRoute from './ProtectedRoute.jsx';
import HomePage from '../pages/HomePage';
import LoginPage from '../pages/LoginPage';
import ChatLayout from '../layout/ChatLayout';
import ChatWindow from '../features/chat/ChatWindow';
import SearchPage from '../pages/SearchPage'; 
import ProfilePage from '../pages/ProfilePage';
import PostDetailPage from '../features/post/PostDetailPage';

// import các component layout và page cần thiết
// import các pages khác...

const AppRoutes = () => {
    return (
        <BrowserRouter>
            <Routes>
                {/* Public Route */}
                <Route path="/login" element={<LoginPage />} />

                {/* Protected Routes */}
                <Route element={<ProtectedRoute />}>
                    <Route element={<MainLayout />}>
                        <Route path="/" element={<HomePage />} />
                        <Route path="/profile/:userId" element={<ProfilePage />} />
                        <Route path="/post/:postId" element={<PostDetailPage />} />
                        <Route path="/search" element={<SearchPage />} />
                    </Route>
                    <Route path="/chat" element={<ChatLayout />}>
                        {/* Trang mặc định khi vào /chat */}
                        <Route index element={<ChatWindow />} />
                        {/* Trang khi chọn một cuộc trò chuyện cụ thể */}
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