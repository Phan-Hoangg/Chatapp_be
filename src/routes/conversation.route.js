// Import thư viện express để tạo router cho các route của ứng dụng
import express from "express";
// Import trim-request để tự động loại bỏ khoảng trắng dư thừa trong dữ liệu request (body, params, query)
import trimRequest from "trim-request";
// Import middleware xác thực người dùng, đảm bảo các request đến đều có token hợp lệ
import authMiddleware from "../middlewares/authMiddleware.js";
// Import các controller xử lý logic liên quan đến cuộc hội thoại: tạo cuộc trò chuyện, lấy danh sách cuộc trò chuyện, tạo nhóm chat
import {
  createGroup,
  create_open_conversation,
  getConversations,
} from "../controllers/conversation.controller.js";

// Tạo instance router từ express
const router = express.Router();

/**
 * Route chính cho các cuộc hội thoại:
 * - POST "/" dùng để tạo cuộc trò chuyện mở (open conversation) giữa hai người
 * - GET "/" dùng để lấy danh sách các cuộc hội thoại của người dùng
 *
 * Cả hai route đều sử dụng:
 * - trimRequest.all: để làm sạch dữ liệu đầu vào, loại bỏ khoảng trắng không cần thiết
 * - authMiddleware: để đảm bảo người dùng đã xác thực trước khi thực hiện các thao tác
 */
router
  .route("/")
  // Tạo cuộc trò chuyện (open conversation) giữa hai người
  .post(trimRequest.all, authMiddleware, create_open_conversation);

// Lấy danh sách các cuộc hội thoại của người dùng đã xác thực
router.route("/").get(trimRequest.all, authMiddleware, getConversations);

/**
 * Route cho việc tạo nhóm chat:
 * - POST "/group" dùng để tạo một cuộc trò chuyện nhóm
 * Cũng sử dụng trimRequest.all và authMiddleware để đảm bảo dữ liệu đầu vào sạch sẽ
 * và chỉ những người dùng đã xác thực mới được tạo nhóm.
 */
router.route("/group").post(trimRequest.all, authMiddleware, createGroup);

// Xuất router để sử dụng trong file chính của ứng dụng
export default router;
