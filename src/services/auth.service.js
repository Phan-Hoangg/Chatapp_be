// Import thư viện tạo lỗi HTTP, giúp trả về lỗi với mã trạng thái phù hợp
import createHttpError from "http-errors";
// Import validator để kiểm tra định dạng và độ dài của các trường dữ liệu
import validator from "validator";
// Import bcrypt để mã hóa và so sánh mật khẩu
import bcrypt from "bcrypt";
// Import UserModel từ các models đã được export trong index.js
import { UserModel } from "../models/index.js";

// Lấy các giá trị mặc định từ biến môi trường, dùng cho ảnh đại diện và trạng thái người dùng
const { DEFAULT_PICTURE, DEFAULT_STATUS } = process.env;

/**
 * Hàm tạo người dùng mới.
 * @param {Object} userData - Dữ liệu người dùng được gửi lên, bao gồm các trường: name, email, picture, status, password.
 * @returns {Promise<Object>} - Promise trả về đối tượng người dùng mới được lưu vào cơ sở dữ liệu.
 * @throws {HttpError} - Ném lỗi nếu các trường bắt buộc không hợp lệ hoặc nếu email đã tồn tại.
 */
export const createUser = async (userData) => {
  // Giải nén các trường từ đối tượng userData
  const { name, email, picture, status, password } = userData;

  // Kiểm tra các trường bắt buộc: tên, email và mật khẩu không được để trống
  if (!name || !email || !password) {
    throw createHttpError.BadRequest("Làm ơn điền đầy đủ thông tin.");
  }

  // Kiểm tra độ dài của tên: phải có từ 2 đến 25 kí tự
  if (!validator.isLength(name, { min: 2, max: 25 })) {
    throw createHttpError.BadRequest(
      "Tên của bạn phải nằm trong khoảng từ 2 đến 25 kí tự."
    );
  }

  // Nếu trạng thái được cung cấp, kiểm tra độ dài của nó không vượt quá 64 kí tự
  if (status && status.length > 64) {
    throw createHttpError.BadRequest(
      "Hãy chắc rằng trạng thái của bạn ít hơn 64 kí tự."
    );
  }

  // Kiểm tra định dạng email sử dụng validator.isEmail
  if (!validator.isEmail(email)) {
    throw createHttpError.BadRequest("Làm ơn nhập email hợp lệ");
  }

  // Kiểm tra xem email đã tồn tại trong cơ sở dữ liệu hay chưa
  const checkDb = await UserModel.findOne({ email });
  if (checkDb) {
    throw createHttpError.Conflict(
      "Vui lòng nhập email khác , email này đã tồn tại"
    );
  }

  // Kiểm tra độ dài của mật khẩu: phải từ 6 đến 128 kí tự
  if (!validator.isLength(password, { min: 6, max: 128 })) {
    throw createHttpError.BadRequest(
      "Vui lòng đảm bảo rằng mật khẩu của bạn là từ 6 đến 128 kí tự"
    );
  }

  // Ghi chú: Việc mã hóa (hash) mật khẩu sẽ được xử lý trong middleware pre-save của UserModel,
  // do đó ta không cần thực hiện tại đây.

  // Tạo mới người dùng bằng cách khởi tạo một instance của UserModel và lưu vào cơ sở dữ liệu.
  // Nếu không có picture hoặc status được cung cấp, sẽ sử dụng giá trị mặc định từ biến môi trường.
  const user = await new UserModel({
    name,
    email,
    picture: picture || DEFAULT_PICTURE,
    status: status || DEFAULT_STATUS,
    password,
  }).save();

  // Trả về đối tượng người dùng đã được tạo.
  return user;
};

/**
 * Hàm xác thực người dùng khi đăng nhập.
 * @param {string} email - Địa chỉ email của người dùng.
 * @param {string} password - Mật khẩu người dùng.
 * @returns {Promise<Object>} - Promise trả về đối tượng người dùng nếu thông tin xác thực hợp lệ.
 * @throws {HttpError} - Ném lỗi nếu thông tin xác thực không hợp lệ hoặc người dùng không tồn tại.
 */
export const signUser = async (email, password) => {
  // Tìm người dùng theo email, chuyển email về chữ thường để đảm bảo tính nhất quán
  // Sử dụng .lean() để trả về một plain object thay vì một document mongoose
  const user = await UserModel.findOne({ email: email.toLowerCase() }).lean();

  // Nếu không tìm thấy người dùng, ném lỗi với thông báo xác thực không hợp lệ.
  if (!user) throw createHttpError.NotFound("thông tin xác thực không hợp lệ.");

  // So sánh mật khẩu nhập vào với mật khẩu đã được mã hóa lưu trong cơ sở dữ liệu
  let passwordMatches = await bcrypt.compare(password, user.password);

  // Nếu mật khẩu không khớp, ném lỗi xác thực không hợp lệ.
  if (!passwordMatches)
    throw createHttpError.NotFound("thông tin xác thực không hợp lệ.");

  // Nếu thông tin hợp lệ, trả về đối tượng người dùng.
  return user;
};
