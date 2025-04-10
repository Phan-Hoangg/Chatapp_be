// Import thư viện express để tạo router
import express from "express";

// Import các route con được định nghĩa ở các file riêng biệt
import authRoutes from "./auth.route.js"; // Các route liên quan đến xác thực (auth)
import userROutes from "./user.route.js"; // Các route liên quan đến người dùng (user)
// Lưu ý: tên biến "userROutes" có thể viết thành "userRoutes" để thống nhất chính tả
import ConversationRoutes from "./conversation.route.js"; // Các route liên quan đến cuộc hội thoại
import MessageRoutes from "./message.route.js"; // Các route liên quan đến tin nhắn

// Tạo instance của router từ express
const router = express.Router();

// Sử dụng middleware để phân chia các route theo đường dẫn cơ sở
// Khi một request đến có đường dẫn bắt đầu với "/auth", nó sẽ được chuyển đến authRoutes
router.use("/auth", authRoutes);

// Khi một request đến có đường dẫn bắt đầu với "/user", nó sẽ được chuyển đến userROutes
router.use("/user", userROutes);

// Khi một request đến có đường dẫn bắt đầu với "/conversation", nó sẽ được chuyển đến ConversationRoutes
router.use("/conversation", ConversationRoutes);

// Khi một request đến có đường dẫn bắt đầu với "/message", nó sẽ được chuyển đến MessageRoutes
router.use("/message", MessageRoutes);

// Xuất router này để sử dụng trong file chính của ứng dụng (ví dụ: server.js)
export default router;
