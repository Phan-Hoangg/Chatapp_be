// Import thư viện mongoose để tương tác với MongoDB
import mongoose from "mongoose";

// Lấy ObjectId từ mongoose.Schema.Types để định nghĩa các trường lưu trữ tham chiếu đến các document khác
const { ObjectId } = mongoose.Schema.Types;

// Định nghĩa schema cho collection "conversation" (cuộc trò chuyện)
const conversationSchema = new mongoose.Schema(
  {
    // Trường "name": tên của cuộc trò chuyện
    // - Kiểu dữ liệu là String
    // - Bắt buộc phải có (required) với thông báo lỗi nếu không có
    // - Sử dụng "trim" để loại bỏ khoảng trắng dư thừa ở đầu và cuối
    name: {
      type: String,
      required: [true, "tên cuộc trò chuyện là bắt buộc."],
      trim: true,
    },
    // Trường "picture": ảnh đại diện của cuộc trò chuyện
    // - Kiểu dữ liệu là String và bắt buộc phải có
    picture: {
      type: String,
      required: true,
    },
    // Trường "isGroup": đánh dấu cuộc trò chuyện có phải là nhóm chat hay không
    // - Kiểu dữ liệu là Boolean
    // - Bắt buộc và mặc định là false (tức là mặc định là cuộc trò chuyện cá nhân)
    isGroup: {
      type: Boolean,
      required: true,
      default: false,
    },
    // Trường "users": danh sách các người dùng tham gia cuộc trò chuyện
    // - Là một mảng chứa các ObjectId tham chiếu đến model "UserModel"
    users: [
      {
        type: ObjectId,
        ref: "UserModel",
      },
    ],
    // Trường "latestMessage": lưu trữ ObjectId của tin nhắn mới nhất trong cuộc trò chuyện
    // - Tham chiếu đến model "MessageModel"
    latestMessage: {
      type: ObjectId,
      ref: "MessageModel",
    },
    // Trường "admin": chỉ dành cho nhóm chat, lưu trữ ObjectId của người quản trị cuộc trò chuyện
    // - Tham chiếu đến model "UserModel"
    admin: {
      type: ObjectId,
      ref: "UserModel",
    },
  },
  {
    // Đặt tên collection trong MongoDB là "conversation"
    collection: "conversation",
    // Tự động thêm các trường "createdAt" và "updatedAt" cho mỗi document
    timestamps: true,
  }
);

// Kiểm tra xem model ConversationModel đã được tạo hay chưa.
// Nếu đã tồn tại thì sử dụng model đã tạo, nếu chưa thì tạo mới.
const ConversationModel =
  mongoose.models.ConversationModel ||
  mongoose.model("ConversationModel", conversationSchema);

// Xuất model để có thể sử dụng trong các module khác của ứng dụng
export default ConversationModel;
