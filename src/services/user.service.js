// Import thư viện createHttpError để tạo lỗi HTTP với các mã trạng thái phù hợp
import createHttpError from "http-errors";
// Import UserModel từ các model đã được tập hợp (index.js), dùng để tương tác với collection người dùng trong cơ sở dữ liệu
import { UserModel } from "../models/index.js";

/**
 * Hàm tìm kiếm người dùng dựa trên userId.
 * @param {String} userId - ID của người dùng cần tìm.
 * @returns {Object} - Trả về đối tượng người dùng nếu tìm thấy.
 * @throws {HttpError} - Ném lỗi BadRequest nếu không tìm thấy người dùng.
 */
export const findUser = async (userId) => {
  // Tìm người dùng trong cơ sở dữ liệu dựa trên userId
  const user = await UserModel.findById(userId);
  // Nếu không tìm thấy người dùng, ném lỗi BadRequest với thông báo lỗi
  if (!user) throw createHttpError.BadRequest("Please fill all fields.");
  // Trả về đối tượng người dùng tìm được
  return user;
};

/**
 * Hàm tìm kiếm người dùng dựa trên từ khóa và loại trừ người dùng hiện tại.
 * @param {String} keyword - Từ khóa tìm kiếm, có thể xuất hiện trong tên hoặc email của người dùng.
 * @param {String} userId - ID của người dùng hiện tại, được loại trừ khỏi kết quả tìm kiếm.
 * @returns {Array} - Mảng các đối tượng người dùng phù hợp với từ khóa tìm kiếm.
 */
export const searchUsers = async (keyword, userId) => {
  // Tìm người dùng có tên hoặc email khớp với từ khóa tìm kiếm (không phân biệt chữ hoa chữ thường)
  // Sau đó loại trừ người dùng có _id trùng với userId được cung cấp (để không trả về người dùng hiện tại)
  const users = await UserModel.find({
    $or: [
      // Tìm kiếm trong trường "name" với biểu thức chính quy, $options: "i" nghĩa là không phân biệt chữ hoa chữ thường
      { name: { $regex: keyword, $options: "i" } },
      // Tìm kiếm trong trường "email" với biểu thức chính quy, $options: "i" nghĩa là không phân biệt chữ hoa chữ thường
      { email: { $regex: keyword, $options: "i" } },
    ],
  }).find({
    // Loại trừ người dùng hiện tại ra khỏi kết quả tìm kiếm
    _id: { $ne: userId },
  });

  // Trả về danh sách người dùng tìm được
  return users;
};
