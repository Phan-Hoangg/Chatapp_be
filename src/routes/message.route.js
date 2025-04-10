// Import thư viện express để tạo router
import express from "express";
// Import trim-request để loại bỏ khoảng trắng dư thừa trong dữ liệu nhận được từ client (body, params, query)
import trimRequest from "trim-request";
// Import middleware xác thực, đảm bảo rằng chỉ những người dùng đã đăng nhập mới có thể truy cập các endpoint này
import authMiddleware from "../middlewares/authMiddleware.js";
// Import các controller xử lý logic gửi và lấy tin nhắn
import { sendMessage, getMessages } from "../controllers/message.controller.js";

// Tạo instance của router từ express
const router = express.Router();

/**
 * Định nghĩa route gửi tin nhắn:
 * - Đường dẫn: "/"
 * - Phương thức: POST
 * - Middleware:
 *    + trimRequest.all: Làm sạch dữ liệu đầu vào bằng cách loại bỏ khoảng trắng thừa.
 *    + authMiddleware: Kiểm tra xem người dùng đã xác thực chưa.
 * - Controller: sendMessage - xử lý việc tạo tin nhắn mới và cập nhật thông tin liên quan.
 */
router.route("/").post(trimRequest.all, authMiddleware, sendMessage);

/**
 * Định nghĩa route lấy tin nhắn của một cuộc hội thoại:
 * - Đường dẫn: "/:convo_id" (tham số convo_id được truyền qua URL)
 * - Phương thức: GET
 * - Middleware:
 *    + trimRequest.all: Làm sạch dữ liệu đầu vào.
 *    + authMiddleware: Kiểm tra xác thực người dùng.
 * - Controller: getMessages - lấy danh sách tin nhắn của cuộc hội thoại tương ứng.
 */
router.route("/:convo_id").get(trimRequest.all, authMiddleware, getMessages);

// Xuất router để sử dụng trong các module khác của ứng dụng (ví dụ: tích hợp vào server chính)
export default router;
