// Import model UserModel từ file "userModel.js"
import UserModel from "./userModel.js";

// Import model ConversationModel từ file "ConversationModel.js"
import ConversationModel from "./conversationModel.js";

// Import model MessageModel từ file "messageModel.js"
import MessageModel from "./messageModel.js";

// Xuất ra các model đã được import dưới dạng named exports.
// Điều này cho phép các module khác có thể import các model này từ một vị trí tập trung,
// thay vì phải import từ từng file riêng lẻ.
export { UserModel, ConversationModel, MessageModel };
