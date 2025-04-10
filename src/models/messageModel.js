// Import thư viện mongoose để tương tác với MongoDB
import mongoose from "mongoose";

// Lấy ObjectId từ mongoose.Schema.Types, dùng để định nghĩa trường tham chiếu đến các document khác
const { ObjectId } = mongoose.Schema.Types;

// Định nghĩa schema cho collection "messages" (tin nhắn)
const messageSchema = mongoose.Schema(
  {
    // Trường "sender": lưu trữ ObjectId của người gửi tin nhắn
    // Tham chiếu đến model "UserModel"
    sender: {
      type: ObjectId,
      ref: "UserModel",
    },
    // Trường "message": nội dung tin nhắn dạng chuỗi
    // Sử dụng "trim" để loại bỏ khoảng trắng thừa ở đầu và cuối
    message: {
      type: String,
      trim: true,
    },
    // Trường "conversation": lưu trữ ObjectId của cuộc hội thoại mà tin nhắn thuộc về
    // Tham chiếu đến model "ConversationModel"
    conversation: {
      type: ObjectId,
      ref: "ConversationModel",
    },
    // Trường "files": lưu trữ danh sách file đính kèm nếu có
    // Ở đây được định nghĩa là một mảng, có thể chứa các thông tin file (ví dụ: đường dẫn file,...)
    files: [],
  },
  {
    // Đặt tên collection trong MongoDB là "messages"
    collection: "messages",
    // Tự động thêm các trường "createdAt" và "updatedAt" vào mỗi document
    timestamps: true,
  }
);

// Kiểm tra xem model MessageModel đã được định nghĩa chưa,
// nếu chưa có thì tạo mới, nếu đã có thì sử dụng model đã tồn tại
const MessageModel =
  mongoose.models.MessageModel || mongoose.model("MessageModel", messageSchema);

// Xuất model MessageModel để có thể sử dụng ở các module khác trong ứng dụng
export default MessageModel;
