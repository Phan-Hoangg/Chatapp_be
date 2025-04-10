// Import mongoose để tương tác với MongoDB
import mongoose from "mongoose";
// Import validator để xác thực định dạng email
import validator from "validator";
// Import bcrypt để mã hóa (hash) mật khẩu
import bcrypt from "bcrypt";

// Định nghĩa schema cho người dùng
const userSchema = new mongoose.Schema(
  {
    // Trường "name": lưu tên của người dùng
    // - Kiểu: String
    // - Bắt buộc, nếu không có sẽ trả về thông báo lỗi "Vui lòng cung cấp tên của bạn:"
    name: {
      type: String,
      required: [true, "Vui lòng cung cấp tên của bạn:"],
    },
    // Trường "email": lưu địa chỉ email của người dùng
    // - Kiểu: String
    // - Bắt buộc, nếu không có sẽ trả về thông báo lỗi "Vui lòng cung cấp địa chỉ email của bạn:"
    // - Phải là duy nhất (unique)
    // - Chuyển đổi về chữ thường (lowercase)
    // - Xác thực định dạng email bằng validator.isEmail
    email: {
      type: String,
      required: [true, "Vui lòng cung cấp địa chỉ email của bạn:"],
      unique: [true, "Địa chỉ email này đã tồn tại"],
      lowercase: true,
      validate: [validator.isEmail, "Vui lòng cung cấp email hợp lệ"],
    },
    // Trường "picture": lưu đường dẫn ảnh đại diện của người dùng
    // - Kiểu: String
    // - Nếu không cung cấp sẽ sử dụng URL mặc định
    picture: {
      type: String,
      default:
        "https://res.cloudinary.com/dkd5jblv5/image/upload/v1675976806/Default_ProfilePicture_gjngnb.png",
    },
    // Trường "status": lưu trạng thái của người dùng (ví dụ: trạng thái hiển thị)
    // - Kiểu: String
    // - Có giá trị mặc định nếu không cung cấp
    status: {
      type: String,
      default: "Hey, I am using chatapp",
    },
    // Trường "password": lưu mật khẩu của người dùng
    // - Kiểu: String
    // - Bắt buộc, nếu không cung cấp sẽ trả về thông báo lỗi "Vui lòng cung cấp mật khẩu"
    // - Có giới hạn độ dài tối thiểu là 6 ký tự và tối đa 128 ký tự
    password: {
      type: String,
      required: [true, "Vui lòng cung cấp mật khẩu"],
      minLength: [6, "Đảm bảo rằng mật khẩu của bạn dài ít nhất 6 kí tự"],
      maxLength: [128, "Đảm bảo rằng mật khẩu của bạn ít hơn 128 kí tự"],
    },
  },
  {
    // Xác định tên collection trong MongoDB là "users"
    collection: "users",
    // Tự động thêm các trường "createdAt" và "updatedAt" cho mỗi document
    timestamps: true,
  }
);

// Middleware "pre-save" để mã hóa mật khẩu trước khi lưu document vào cơ sở dữ liệu
userSchema.pre("save", async function (next) {
  try {
    // Kiểm tra nếu đây là document mới
    if (this.isNew) {
      // Tạo một salt với 12 vòng lặp
      const salt = await bcrypt.genSalt(12);
      // Mã hóa mật khẩu với salt vừa tạo
      const hashedPassword = await bcrypt.hash(this.password, salt);
      // Gán mật khẩu đã mã hóa thay thế cho mật khẩu ban đầu
      this.password = hashedPassword;
    }
    // Tiếp tục quá trình lưu document
    next();
  } catch (error) {
    // Nếu có lỗi, chuyển lỗi đó cho middleware xử lý lỗi
    next(error);
  }
});

// Tạo hoặc lấy model UserModel từ mongoose.models (để tránh tạo model trùng lặp)
const UserModel =
  mongoose.models.UserModel || mongoose.model("UserModel", userSchema);

// Xuất model UserModel để sử dụng ở các module khác của ứng dụng
export default UserModel;
