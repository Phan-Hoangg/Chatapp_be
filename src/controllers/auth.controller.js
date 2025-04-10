// Import thư viện tạo lỗi HTTP, dùng để ném lỗi khi không có token hoặc xác thực không thành công
import createHttpError from "http-errors";
// Import các hàm xử lý người dùng: tạo người dùng mới và xác thực đăng nhập
import { createUser, signUser } from "../services/auth.service.js";
// Import các hàm tạo và xác minh token (access token và refresh token)
import { generateToken, verifyToken } from "../services/token.service.js";
// Import hàm tìm kiếm người dùng dựa trên id
import { findUser } from "../services/user.service.js";

// Hàm đăng ký người dùng mới
export const register = async (req, res, next) => {
  try {
    // In ra dữ liệu nhận được từ client để kiểm tra
    console.log(req.body);
    // Lấy thông tin người dùng từ request body
    const { name, email, picture, status, password } = req.body;

    // Gọi hàm tạo người dùng mới, lưu thông tin vào cơ sở dữ liệu
    const newUser = await createUser({
      name,
      email,
      picture,
      status,
      password,
    });

    // Tạo access token cho người dùng mới, thời hạn 1 ngày
    const access_token = await generateToken(
      { userId: newUser._id },
      "1d",
      process.env.ACCESS_TOKEN_SECRET
    );

    // Tạo refresh token cho người dùng mới, thời hạn 30 ngày
    const refresh_token = await generateToken(
      { userId: newUser._id },
      "30d",
      process.env.REFRESH_TOKEN_SECRET
    );

    // Đặt cookie chứa refresh token
    res.cookie("refreshtoken", refresh_token, {
      httpOnly: true, // Cookie không thể truy cập từ JavaScript, giúp bảo mật
      path: "/api/v1/auth/refreshtoken", // Đường dẫn cho phép truy cập cookie
      maxAge: 30 * 24 * 60 * 60 * 1000, // Thời gian sống của cookie (30 ngày)
    });

    // Gửi phản hồi JSON về phía client, bao gồm thông điệp thành công, access token và thông tin người dùng
    res.json({
      message: "Registration successful.",
      access_token,
      user: {
        _id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        picture: newUser.picture,
        status: newUser.status,
        token: access_token,
      },
    });
  } catch (error) {
    // Nếu có lỗi xảy ra, chuyển lỗi đó cho middleware xử lý lỗi
    next(error);
  }
};

// Hàm đăng nhập người dùng
export const login = async (req, res, next) => {
  try {
    // Lấy email và password từ request body
    const { email, password } = req.body;

    // Xác thực người dùng với email và password, trả về thông tin người dùng nếu hợp lệ
    const user = await signUser(email, password);

    // Tạo access token cho người dùng, thời hạn 1 ngày
    const access_token = await generateToken(
      { userId: user._id },
      "1d",
      process.env.ACCESS_TOKEN_SECRET
    );

    // Tạo refresh token cho người dùng, thời hạn 30 ngày
    const refresh_token = await generateToken(
      { userId: user._id },
      "30d",
      process.env.REFRESH_TOKEN_SECRET
    );

    // Đặt cookie chứa refresh token với các thiết lập bảo mật
    res.cookie("refreshtoken", refresh_token, {
      httpOnly: true,
      path: "/api/v1/auth/refreshtoken",
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 ngày
    });

    // Gửi phản hồi JSON về phía client, bao gồm thông điệp thành công, access token và thông tin người dùng
    res.json({
      message: "Login successful.",
      access_token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        picture: user.picture,
        status: user.status,
        token: access_token,
      },
    });
  } catch (error) {
    // Nếu có lỗi xảy ra (như sai mật khẩu, không tìm thấy người dùng), chuyển lỗi cho middleware xử lý lỗi
    next(error);
  }
};

// Hàm đăng xuất người dùng
export const logout = async (req, res, next) => {
  try {
    // Xóa cookie chứa refresh token theo đường dẫn đã cấu hình
    res.clearCookie("refreshtoken", { path: "/api/v1/auth/refreshtoken" });

    // Gửi phản hồi JSON thông báo đăng xuất thành công
    res.json({
      message: "Logged out successfully.",
    });
  } catch (error) {
    // Nếu có lỗi xảy ra, chuyển lỗi đó cho middleware xử lý lỗi
    next(error);
  }
};

// Hàm làm mới access token sử dụng refresh token
export const refreshToken = async (req, res, next) => {
  try {
    // Lấy refresh token từ cookie của request
    const refresh_token = req.cookies.refreshtoken;
    // Nếu không tìm thấy refresh token, ném lỗi Unauthorized
    if (!refresh_token) throw createHttpError.Unauthorized("Please login.");

    // Xác minh refresh token với secret key tương ứng, trả về payload chứa userId
    const decoded = await verifyToken(
      refresh_token,
      process.env.REFRESH_TOKEN_SECRET
    );

    // Tìm người dùng trong cơ sở dữ liệu dựa trên userId từ token
    const user = await findUser(decoded.userId);

    // Tạo access token mới cho người dùng, thời hạn 1 ngày
    const access_token = await generateToken(
      { userId: user._id },
      "1d",
      process.env.ACCESS_TOKEN_SECRET
    );

    // Gửi phản hồi JSON với access token mới và thông tin người dùng
    res.json({
      access_token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        picture: user.picture,
        status: user.status,
        token: access_token,
      },
    });
  } catch (error) {
    // Nếu có lỗi (ví dụ: token không hợp lệ, hết hạn, hoặc người dùng không tồn tại), chuyển lỗi cho middleware xử lý lỗi
    next(error);
  }
};
