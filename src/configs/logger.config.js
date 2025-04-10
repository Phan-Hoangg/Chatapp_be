// Import thư viện winston dùng để ghi log
import winston from "winston";

// Tạo định dạng xử lý lỗi tùy chỉnh:
// Nếu info là instance của Error, thì gán thuộc tính message bằng stack để log chi tiết lỗi.
const enumerateErrorFormat = winston.format((info) => {
  if (info instanceof Error) {
    Object.assign(info, { message: info.stack });
  }
  return info;
});

// Tạo logger với cấu hình:
const logger = winston.createLogger({
  // Cấu hình mức log: Nếu ở chế độ development thì log chi tiết ("debug"), còn lại chỉ log thông tin cơ bản ("info")
  level: process.env.NODE_ENV === "development" ? "debug" : "info",
  // Kết hợp các định dạng:
  format: winston.format.combine(
    // Áp dụng định dạng xử lý lỗi
    enumerateErrorFormat(),
    // Nếu ở development thì sử dụng màu sắc cho log, ngược lại không dùng màu
    process.env.NODE_ENV === "development"
      ? winston.format.colorize()
      : winston.format.uncolorize(),
    // Cho phép sử dụng placeholder trong thông điệp log (ví dụ: %s)
    winston.format.splat(),
    // Định dạng lại thông điệp log theo mẫu: "level: message"
    winston.format.printf(({ level, message }) => `${level}: ${message}`)
  ),
  // Cấu hình nơi gửi log (transports)
  transports: [
    // Sử dụng transport ghi log ra console
    new winston.transports.Console({
      // Các log có mức "error" sẽ được ghi ra stderr thay vì stdout
      stderrLevels: ["error"],
    }),
  ],
});

// Xuất logger mặc định để có thể sử dụng ở các file khác
export default logger;

