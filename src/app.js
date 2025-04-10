// Import các thư viện cần thiết
import express from "express"; // Framework xây dựng ứng dụng web
import dotenv from "dotenv"; // Quản lý biến môi trường từ file .env
import morgan from "morgan"; // Ghi log các request HTTP, hỗ trợ debug
import helmet from "helmet"; // Bảo mật HTTP headers
import mongoSanitize from "express-mongo-sanitize"; // Ngăn chặn NoSQL injection bằng cách loại bỏ ký tự không hợp lệ
import cookieParser from "cookie-parser"; // Phân tích cookie trong request
import compression from "compression"; // Nén (gzip) response để giảm kích thước dữ liệu gửi đi
import fileUpload from "express-fileupload"; // Hỗ trợ tải file lên server
import cors from "cors"; // Cho phép cấu hình Cross-Origin Resource Sharing (CORS)
import createHttpError from "http-errors"; // Tạo lỗi HTTP với mã trạng thái tương ứng
import routes from "./routes/index.js"; // Import tập hợp các route của ứng dụng

// Cấu hình dotenv để đọc biến môi trường từ file .env
dotenv.config();

// Tạo instance của Express app
const app = express();

// Morgan: Ghi log chi tiết các request khi không ở môi trường production
if (process.env.NODE_ENV !== "production") {
  app.use(morgan("dev"));
}

// Helmet: Thiết lập các HTTP header bảo mật
app.use(helmet());

// Phân tích dữ liệu JSON gửi lên (đối với request body có dạng JSON)
app.use(express.json());

// Phân tích dữ liệu từ request body dạng urlencoded (ví dụ: form submissions)
app.use(express.urlencoded({ extended: true }));

// Sanitize dữ liệu trong request để ngăn chặn NoSQL injection
app.use(mongoSanitize());

// Sử dụng cookie parser để phân tích cookie từ request headers
app.use(cookieParser());

// Nén các response gửi về cho client bằng gzip để tối ưu tốc độ truyền tải
app.use(compression());

// Cấu hình file upload, sử dụng tệp tin tạm thời khi tải file lên
app.use(
  fileUpload({
    useTempFiles: true,
  })
);

// Cho phép Cross-Origin Resource Sharing để ứng dụng có thể được gọi từ các nguồn khác nhau
app.use(cors());

// Định nghĩa các route chính của API, tiền tố "/api/v1" sẽ được áp dụng cho tất cả các route được định nghĩa trong "routes"
app.use("/api/v1", routes);

// Middleware xử lý route không tồn tại: Khi không tìm thấy route nào khớp,
// trả về lỗi NotFound với thông báo "This route does not exist."
app.use(async (req, res, next) => {
  next(createHttpError.NotFound("This route does not exist."));
});

// Middleware xử lý lỗi: Bắt mọi lỗi phát sinh trong quá trình xử lý request,
// trả về status code và thông tin lỗi (message)
app.use(async (err, req, res, next) => {
  res.status(err.status || 500);
  res.send({
    error: {
      status: err.status || 500,
      message: err.message,
    },
  });
});

// Xuất ra app để có thể được sử dụng trong file chính (ví dụ: server.js) để khởi động server
export default app;
