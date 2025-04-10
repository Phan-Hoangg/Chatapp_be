// Import thư viện jsonwebtoken để tạo và xác minh token
import jwt from "jsonwebtoken";
// Import logger để ghi log lỗi nếu có
import logger from "../configs/logger.config.js";

/**
 * Hàm sign tạo token dựa trên payload, thời gian hết hạn và secret key.
 * Trả về một Promise chứa token được ký, hoặc lỗi nếu quá trình ký thất bại.
 *
 * @param {Object} payload - Dữ liệu cần mã hóa vào token.
 * @param {String} expiresIn - Thời gian hết hạn của token (ví dụ: "1d", "30d").
 * @param {String} secret - Khóa bí mật dùng để ký token.
 * @returns {Promise<String>} - Promise trả về token được ký.
 */
export const sign = async (payload, expiresIn, secret) => {
  return new Promise((resolve, reject) => {
    jwt.sign(
      payload,      // Dữ liệu cần mã hóa
      secret,       // Khóa bí mật dùng để ký token
      { expiresIn: expiresIn }, // Cấu hình thời gian hết hạn của token
      (error, token) => {
        // Nếu có lỗi trong quá trình ký token
        if (error) {
          logger.error(error); // Ghi log lỗi
          reject(error);       // Từ chối Promise với lỗi
        } else {
          resolve(token);      // Nếu thành công, trả về token
        }
      }
    );
  });
};

/**
 * Hàm verify xác minh tính hợp lệ của token dựa trên secret key.
 * Trả về một Promise chứa payload giải mã nếu token hợp lệ,
 * hoặc trả về null nếu có lỗi xác minh.
 *
 * @param {String} token - Token cần được xác minh.
 * @param {String} secret - Khóa bí mật dùng để xác minh token.
 * @returns {Promise<Object|null>} - Promise trả về payload nếu hợp lệ, hoặc null nếu không hợp lệ.
 */
export const verify = async (token, secret) => {
  return new Promise((resolve, reject) => {
    jwt.verify(token, secret, (error, payload) => {
      // Nếu có lỗi trong quá trình xác minh token
      if (error) {
        logger.error(error); // Ghi log lỗi
        resolve(null);       // Trả về null thay vì ném lỗi để xử lý ở nơi gọi
      } else {
        resolve(payload);    // Nếu token hợp lệ, trả về payload giải mã
      }
    });
  });
};
