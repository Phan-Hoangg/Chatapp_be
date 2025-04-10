// Import thư viện createHttpError để tạo lỗi với mã trạng thái HTTP phù hợp
import createHttpError from "http-errors";
// Import MessageModel từ các model được tập hợp để tương tác với collection tin nhắn trong cơ sở dữ liệu
import { MessageModel } from "../models/index.js";

/**
 * Hàm tạo một tin nhắn mới.
 * @param {Object} data - Dữ liệu tin nhắn cần tạo, bao gồm các trường như sender, message, conversation, files,...
 * @returns {Object} - Đối tượng tin nhắn mới được tạo và lưu vào cơ sở dữ liệu.
 * @throws {HttpError} - Nếu không thể tạo tin nhắn, ném lỗi BadRequest.
 */
export const createMessage = async (data) => {
  // Tạo tin nhắn mới trong cơ sở dữ liệu bằng cách sử dụng MessageModel.create
  let newMessage = await MessageModel.create(data);

  // Nếu không tạo được tin nhắn, ném lỗi BadRequest với thông báo lỗi
  if (!newMessage)
    throw createHttpError.BadRequest("Oops...Something went wrong !");

  // Trả về tin nhắn mới tạo
  return newMessage;
};

/**
 * Hàm populate thông tin tin nhắn dựa trên id.
 * @param {String} id - id của tin nhắn cần truy xuất và populate.
 * @returns {Object} - Tin nhắn được populate các field liên quan, giúp có dữ liệu chi tiết hơn.
 * @throws {HttpError} - Nếu không tìm thấy tin nhắn, ném lỗi BadRequest.
 */
export const populateMessage = async (id) => {
  // Tìm tin nhắn theo id và populate các field liên quan:
  // - "sender": populate với thông tin của người gửi tin nhắn (chỉ lấy "name" và "picture") từ model UserModel.
  // - "conversation": populate với thông tin của cuộc hội thoại (lấy "name", "picture", "isGroup", "users")
  //     và tiếp tục populate trường "users" bên trong conversation để lấy các thông tin của người dùng.
  let msg = await MessageModel.findById(id)
    .populate({
      path: "sender",
      select: "name picture",
      model: "UserModel",
    })
    .populate({
      path: "conversation",
      select: "name picture isGroup users",
      model: "ConversationModel",
      // Populate nested field "users" trong conversation để có thông tin chi tiết của từng người dùng
      populate: {
        path: "users",
        select: "name email picture status",
        model: "UserModel",
      },
    });

  // Nếu không tìm thấy tin nhắn nào, ném lỗi BadRequest
  if (!msg) throw createHttpError.BadRequest("Oops...Something went wrong !");

  // Trả về tin nhắn đã được populate đầy đủ thông tin
  return msg;
};

/**
 * Hàm lấy tất cả các tin nhắn thuộc một cuộc hội thoại.
 * @param {String} convo_id - id của cuộc hội thoại cần truy xuất tin nhắn.
 * @returns {Array} - Mảng các tin nhắn trong cuộc hội thoại đó.
 * @throws {HttpError} - Nếu không tìm thấy tin nhắn, ném lỗi BadRequest.
 */
export const getConvoMessages = async (convo_id) => {
  // Tìm tất cả các tin nhắn có trường "conversation" trùng với convo_id
  const messages = await MessageModel.find({ conversation: convo_id })
    // Populate thông tin người gửi: lấy các trường name, picture, email và status từ model UserModel
    .populate("sender", "name picture email status")
    // Populate thông tin cuộc hội thoại nếu cần thiết
    .populate("conversation");

  // Nếu không tìm thấy tin nhắn nào, ném lỗi BadRequest
  if (!messages) {
    throw createHttpError.BadRequest("Oops...Something went wrong !");
  }

  // Trả về mảng tin nhắn
  return messages;
};
