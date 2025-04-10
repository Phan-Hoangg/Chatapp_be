// Import thư viện express để tạo router cho các route của ứng dụng
import express from "express";
// Import trim-request để loại bỏ khoảng trắng thừa ở tất cả các trường của request (body, query, params)
import trimRequest from "trim-request";
// Import các controller xử lý logic cho authentication: đăng ký, đăng nhập, đăng xuất và làm mới token
import {
  login,
  logout,
  refreshToken,
  register,
} from "../controllers/auth.controller.js";
// Import middleware xác thực người dùng, dùng để bảo vệ các route cần xác thực
import authMiddleware from "../middlewares/authMiddleware.js";

// Tạo instance của router từ express
const router = express.Router();

// Định nghĩa route cho đăng ký người dùng (POST /register)
// Sử dụng middleware trimRequest.all để loại bỏ khoảng trắng thừa trong request
// Sau đó gọi hàm register từ auth.controller.js để xử lý đăng ký
router.route("/register").post(trimRequest.all, register);

// Định nghĩa route cho đăng nhập (POST /login)
// Sử dụng trimRequest.all để làm sạch dữ liệu đầu vào, sau đó gọi hàm login
router.route("/login").post(trimRequest.all, login);

// Định nghĩa route cho đăng xuất (POST /logout)
// Middleware trimRequest.all đảm bảo dữ liệu request được xử lý trước khi gọi hàm logout
router.route("/logout").post(trimRequest.all, logout);

// Định nghĩa route cho làm mới token (POST /refreshToken)
// Middleware trimRequest.all sẽ xử lý dữ liệu trước khi gọi hàm refreshToken
router.route("/refreshToken").post(trimRequest.all, refreshToken);

// Định nghĩa route để kiểm tra middleware xác thực authMiddleware (GET /testingauthMiddleware)
// Route này sẽ:
// 1. Sử dụng trimRequest.all để xử lý dữ liệu request.
// 2. Áp dụng authMiddleware để kiểm tra token xác thực.
// 3. Nếu xác thực thành công, trả về thông tin người dùng được lưu trong req.user.
router
  .route("/testingauthMiddleware")
  .get(trimRequest.all, authMiddleware, (req, res) => {
    res.send(req.user);
  });

// Xuất router này để có thể import và sử dụng trong các phần khác của ứng dụng,
// ví dụ: khi tích hợp vào file chính (server.js hoặc index.js)
export default router;
