// Import logger dùng để ghi log lỗi và thông tin debug
import logger from "../configs/logger.config.js";
// Import hàm cập nhật tin nhắn mới nhất cho cuộc hội thoại
import { updateLatestMessage } from "../services/conversation.service.js";
// Import các hàm xử lý tin nhắn từ service:
// - createMessage: tạo tin nhắn mới trong cơ sở dữ liệu
// - getConvoMessages: lấy danh sách tin nhắn của một cuộc hội thoại
// - populateMessage: populate thông tin tin nhắn (ví dụ như thông tin người gửi, loại bỏ các trường nhạy cảm)
import {
  createMessage,
  getConvoMessages,
  populateMessage,
} from "../services/message.service.js";

/**
 * Hàm gửi tin nhắn: xử lý tạo tin nhắn mới, cập nhật tin nhắn mới nhất cho cuộc hội thoại
 */
export const sendMessage = async (req, res, next) => {
  try {
    // Lấy user_id của người gửi từ thông tin đã được middleware xác thực (req.user)
    const user_id = req.user.userId;
    // Lấy thông tin tin nhắn, id của cuộc hội thoại và file đính kèm từ request body
    const { message, convo_id, files } = req.body;

    // Kiểm tra nếu không có id cuộc hội thoại hoặc không có nội dung tin nhắn và file đính kèm
    if (!convo_id || (!message && !files)) {
      logger.error("Please provider a conversation id and a message body");
      // Trả về lỗi 400 Bad Request nếu thiếu thông tin cần thiết
      return res.sendStatus(400);
    }

    // Tạo đối tượng dữ liệu tin nhắn với các thông tin cần thiết
    const msgData = {
      sender: user_id, // Id người gửi
      message, // Nội dung tin nhắn
      conversation: convo_id, // Id cuộc hội thoại
      files: files || [], // Danh sách file đính kèm (nếu không có thì gán mảng rỗng)
    };

    // Tạo tin nhắn mới trong cơ sở dữ liệu
    let newMessage = await createMessage(msgData);
    // Populate thông tin tin nhắn mới tạo (ví dụ: thêm thông tin người gửi, loại bỏ thông tin nhạy cảm)
    let populatedMessage = await populateMessage(newMessage._id);
    // Cập nhật tin nhắn mới nhất cho cuộc hội thoại tương ứng
    await updateLatestMessage(convo_id, newMessage);
    // Trả về tin nhắn đã được populate cho client
    res.json(populatedMessage);
  } catch (error) {
    // Nếu có lỗi xảy ra, chuyển lỗi cho middleware xử lý lỗi
    next(error);
  }
};

/**
 * Hàm lấy danh sách tin nhắn của một cuộc hội thoại dựa trên id cuộc hội thoại từ params
 */
export const getMessages = async (req, res, next) => {
  try {
    // Lấy id cuộc hội thoại từ tham số URL (params)
    const convo_id = req.params.convo_id;
    // Kiểm tra nếu không có id cuộc hội thoại, ghi log lỗi và trả về lỗi 400
    if (!convo_id) {
      logger.error("Please add a conversation id in params.");
      return res.sendStatus(400);
    }
    // Lấy danh sách tin nhắn của cuộc hội thoại từ service
    const messages = await getConvoMessages(convo_id);
    // Trả về danh sách tin nhắn cho client
    res.json(messages);
  } catch (error) {
    // Nếu có lỗi xảy ra, chuyển lỗi cho middleware xử lý lỗi
    next(error);
  }
};
