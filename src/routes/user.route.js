// Import thư viện express để tạo router cho các endpoint
import express from "express";
// Import trim-request để tự động loại bỏ khoảng trắng dư thừa trong các trường dữ liệu nhận được (body, query, params)
import trimRequest from "trim-request";
// Import controller searchUsers xử lý logic tìm kiếm người dùng dựa trên từ khóa
import { searchUsers } from "../controllers/user.controller.js";
// Import middleware authMiddleware để xác thực người dùng trước khi truy cập endpoint này
import authMiddleware from "../middlewares/authMiddleware.js";

// Tạo một instance của router từ express
const router = express.Router();

/**
 * Định nghĩa route tìm kiếm người dùng:
 * - Đường dẫn: "/" (trong module này, base route của người dùng)
 * - Phương thức: GET
 * - Middleware:
 *    + trimRequest.all: Làm sạch dữ liệu đầu vào bằng cách loại bỏ khoảng trắng không cần thiết
 *    + authMiddleware: Kiểm tra token xác thực của người dùng, chỉ cho phép người dùng đã đăng nhập truy cập
 * - Controller: searchUsers: Xử lý logic tìm kiếm người dùng dựa trên từ khóa truyền qua query string (ví dụ: ?search=keyword)
 */
router.route("/").get(trimRequest.all, authMiddleware, searchUsers);

// Xuất router này để sử dụng trong file chính của ứng dụng (ví dụ: server.js)
export default router;
