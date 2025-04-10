// Import thư viện mongoose để tương tác với MongoDB
import mongoose from "mongoose";
// Import Server từ socket.io để thiết lập kết nối WebSocket
import { Server } from "socket.io";
// Import ứng dụng Express đã cấu hình
import app from "./app.js";
// Import logger để ghi log thông tin và lỗi
import logger from "./configs/logger.config.js";
// Import module xử lý các sự kiện của Socket.IO
import SocketServer from "./SocketServer.js";

// Lấy các biến môi trường cần thiết
const { DATABASE_URL } = process.env;
const PORT = process.env.PORT || 8000;

// Lắng nghe sự kiện lỗi kết nối của MongoDB.
// Nếu có lỗi xảy ra, log lỗi và dừng quá trình chạy của server.
mongoose.connection.on("error", (err) => {
  logger.error(`Mongodb connection error : ${err}`);
  process.exit(1);
});

// Nếu không ở môi trường production, bật chế độ debug cho mongoose để log các truy vấn cơ sở dữ liệu
if (process.env.NODE_ENV !== "production") {
  mongoose.set("debug", true);
}

// Kết nối đến MongoDB sử dụng URL lấy từ biến môi trường
mongoose.connect(DATABASE_URL).then(() => {
  logger.info("Connected to Mongodb.");
});

// Khởi động Express server và lắng nghe trên cổng đã chỉ định
let server;
server = app.listen(PORT, () => {
  logger.info(`Server is listening at ${PORT}.`);
});

// Thiết lập Socket.IO với server đã khởi động, cấu hình các tuỳ chọn cho kết nối
const io = new Server(server, {
  pingTimeout: 60000, // Đặt thời gian timeout cho ping là 60 giây
  cors: {
    origin: process.env.CLIENT_ENDPOINT, // Cho phép truy cập từ client endpoint được cấu hình trong biến môi trường
  },
});

// Khi một client kết nối qua Socket.IO
io.on("connection", (socket) => {
  logger.info("socket io connected successfully.");
  // Gọi hàm SocketServer để xử lý các sự kiện liên quan đến socket,
  // truyền vào đối tượng socket và instance của io
  SocketServer(socket, io);
});

// Hàm exitHandler để đóng server và dừng quá trình chạy khi có lỗi nghiêm trọng hoặc tín hiệu dừng
const exitHandler = () => {
  if (server) {
    logger.info("Server closed.");
    process.exit(1);
  } else {
    process.exit(1);
  }
};

// Hàm unexpectedErrorHandler xử lý các lỗi không mong muốn (uncaught exceptions hoặc unhandled rejections)
// Log lỗi và gọi exitHandler để dừng server
const unexpectedErrorHandler = (error) => {
  logger.error(error);
  exitHandler();
};

// Lắng nghe và xử lý các lỗi không được bắt (uncaught exceptions) và các promise không được xử lý (unhandled rejections)
process.on("uncaughtException", unexpectedErrorHandler);
process.on("unhandledRejection", unexpectedErrorHandler);

// Lắng nghe tín hiệu SIGTERM (thường do hệ thống yêu cầu dừng server) và đóng server một cách an toàn
process.on("SIGTERM", () => {
  if (server) {
    logger.info("Server closed.");
    process.exit(1);
  }
});
