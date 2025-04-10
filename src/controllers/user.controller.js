// Import thư viện tạo lỗi HTTP, giúp tạo các lỗi có mã trạng thái phù hợp (ví dụ: 400, 404, 500,...)
import createHttpError from "http-errors";
// Import logger để ghi log các thông tin lỗi hoặc debug
import logger from "../configs/logger.config.js";
// Import hàm searchUsers từ service xử lý người dùng (được đổi tên thành searchUsersService để tránh trùng tên)
import { searchUsers as searchUsersService } from "../services/user.service.js";

/**
 * Hàm tìm kiếm người dùng dựa trên từ khóa được truyền qua query string
 * Yêu cầu phải có tham số "search" trong query, nếu không sẽ trả về lỗi BadRequest.
 */
export const searchUsers = async (req, res, next) => {
  try {
    // Lấy từ khóa tìm kiếm từ query string (vd: ?search=keyword)
    const keyword = req.query.search;

    // Kiểm tra xem keyword có tồn tại hay không. Nếu không có, ghi log lỗi và ném lỗi BadRequest.
    if (!keyword) {
      logger.error("Please add a search query first");
      throw createHttpError.BadRequest("Oops...Something went wrong !");
    }

    // Gọi service searchUsersService để tìm kiếm người dùng dựa trên từ khóa và loại trừ người gửi (req.user.userId)
    const users = await searchUsersService(keyword, req.user.userId);

    // Gửi kết quả tìm kiếm (danh sách người dùng) về phía client với mã trạng thái 200
    res.status(200).json(users);
  } catch (error) {
    // Nếu có lỗi xảy ra trong quá trình xử lý, chuyển lỗi đó cho middleware xử lý lỗi
    next(error);
  }
};
