// Import hàm sign và verify từ module token.ultil.js, đây là các hàm xử lý ký và xác minh token
import { sign, verify } from "../utils/token.ultil.js";

/**
 * Hàm generateToken tạo token dựa trên payload, thời gian hết hạn và bí mật (secret)
 * @param {Object} payload - Dữ liệu cần được mã hóa vào token (ví dụ: userId, role,...)
 * @param {String} expiresIn - Thời gian hết hạn của token (ví dụ: "1d", "30d")
 * @param {String} secret - Khóa bí mật dùng để ký token, đảm bảo tính bảo mật của token
 * @returns {Promise<String>} - Trả về token đã được ký (string)
 */
export const generateToken = async (payload, expiresIn, secret) => {
  // Gọi hàm sign để tạo token với payload, thời gian hết hạn và secret đã cung cấp
  let token = await sign(payload, expiresIn, secret);
  return token;
};

/**
 * Hàm verifyToken xác minh token có hợp lệ hay không
 * @param {String} token - Token cần được xác minh
 * @param {String} secret - Khóa bí mật dùng để xác minh token
 * @returns {Promise<Object>} - Trả về payload đã giải mã nếu token hợp lệ, hoặc ném lỗi nếu không hợp lệ
 */
export const verifyToken = async (token, secret) => {
  // Gọi hàm verify để kiểm tra token với khóa bí mật
  let check = await verify(token, secret);
  return check;
};
