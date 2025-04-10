// Import thư viện tạo lỗi HTTP
import createHttpError from "http-errors";
// Import thư viện JSON Web Token để xử lý token
import jwt from "jsonwebtoken";

/**
 * Middleware xác thực người dùng thông qua JWT.
 * Middleware này kiểm tra header "authorization" để lấy token, sau đó xác minh token với secret key.
 * Nếu token hợp lệ, payload sẽ được gán cho req.user và tiếp tục qua middleware/route handler tiếp theo.
 * Nếu không hợp lệ hoặc không có header, middleware sẽ trả về lỗi Unauthorized.
 */
export default async function (req, res, next) {
  // Kiểm tra xem header "authorization" có tồn tại hay không
  if (!req.headers["authorization"]) return next(createHttpError.Unauthorized);

  // Lấy giá trị của header "authorization", thông thường có dạng "Bearer <token>"
  const bearerToken = req.headers["authorization"];
  // Tách chuỗi theo khoảng trắng, phần tử thứ 2 chính là token thực tế
  const token = bearerToken.split(" ")[1];

  // Sử dụng jwt.verify để xác thực token với secret key được lưu trong biến môi trường
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, payload) => {
    // Nếu có lỗi (token hết hạn hoặc không hợp lệ), trả về lỗi Unauthorized
    if (err) {
      return next(createHttpError.Unauthorized());
    }
    // Nếu token hợp lệ, gán payload (chứa thông tin người dùng) cho req.user
    req.user = payload;
    // Gọi next() để chuyển sang middleware hoặc route handler tiếp theo
    next();
  });
}
