// Import thư viện tạo lỗi HTTP để ném lỗi với mã trạng thái phù hợp
import createHttpError from "http-errors";
// Import các model cần thiết: ConversationModel và UserModel
import { ConversationModel, UserModel } from "../models/index.js";

/**
 * Hàm kiểm tra xem cuộc hội thoại đã tồn tại hay chưa.
 * Nếu là cuộc hội thoại cá nhân (isGroup === false):
 *   - Tìm các cuộc hội thoại không phải nhóm mà có chứa cả sender_id và receiver_id trong mảng users.
 *   - Populate các field "users" (loại trừ password) và "latestMessage".
 *   - Sau đó, populate trường "sender" của latestMessage để lấy các thông tin cần thiết (name, email, picture, status).
 *   - Trả về cuộc hội thoại đầu tiên tìm thấy.
 *
 * Nếu là cuộc hội thoại nhóm (isGroup khác false):
 *   - Giả sử tham số isGroup chứa id của cuộc trò chuyện nhóm.
 *   - Tìm cuộc hội thoại theo id và populate các field "users" và "admin" (loại trừ password), cùng với "latestMessage".
 *   - Sau đó, populate trường "sender" của latestMessage.
 *   - Trả về cuộc hội thoại tìm được.
 */
export const doesConversationExist = async (
  sender_id,
  receiver_id,
  isGroup
) => {
  if (isGroup === false) {
    // Tìm các cuộc hội thoại cá nhân chứa cả sender và receiver
    let convos = await ConversationModel.find({
      isGroup: false,
      $and: [
        { users: { $elemMatch: { $eq: sender_id } } },
        { users: { $elemMatch: { $eq: receiver_id } } },
      ],
    })
      .populate("users", "-password") // Populate thông tin người dùng, loại bỏ trường password
      .populate("latestMessage"); // Populate tin nhắn mới nhất

    // Nếu không tìm thấy cuộc hội thoại nào, ném lỗi BadRequest
    if (!convos)
      throw createHttpError.BadRequest("Oops...Something went wrong !");

    // Populate trường "sender" của latestMessage để lấy thông tin chi tiết của người gửi
    convos = await UserModel.populate(convos, {
      path: "latestMessage.sender",
      select: "name email picture status",
    });

    // Trả về cuộc hội thoại đầu tiên tìm được
    return convos[0];
  } else {
    // Trường hợp cuộc hội thoại nhóm:
    // Ở đây, isGroup được sử dụng như id của cuộc hội thoại nhóm
    let convo = await ConversationModel.findById(isGroup)
      .populate("users admin", "-password") // Populate thông tin người dùng và admin, loại bỏ password
      .populate("latestMessage"); // Populate tin nhắn mới nhất

    // Nếu không tìm thấy, ném lỗi BadRequest
    if (!convo)
      throw createHttpError.BadRequest("Oops...Something went wrong !");

    // Populate trường "sender" của latestMessage để lấy thông tin của người gửi tin nhắn
    convo = await UserModel.populate(convo, {
      path: "latestMessage.sender",
      select: "name email picture status",
    });

    return convo;
  }
};

/**
 * Hàm tạo một cuộc hội thoại mới.
 * @param {Object} data - Dữ liệu cho cuộc hội thoại (bao gồm tên, danh sách user, isGroup, admin, v.v.).
 * @returns {Object} - Đối tượng cuộc hội thoại mới được tạo.
 * @throws {HttpError} - Nếu không tạo được cuộc hội thoại.
 */
export const createConversation = async (data) => {
  const newConvo = await ConversationModel.create(data);
  if (!newConvo)
    throw createHttpError.BadRequest("Oops...Something went wrong !");
  return newConvo;
};

/**
 * Hàm populate các trường của cuộc hội thoại dựa trên id.
 * @param {String} id - id của cuộc hội thoại cần populate.
 * @param {String} fieldToPopulate - Tên field muốn populate (ví dụ: "users", "admin").
 * @param {String} fieldsToRemove - Các trường muốn loại bỏ (ví dụ: "-password").
 * @returns {Object} - Cuộc hội thoại đã được populate các field tương ứng.
 * @throws {HttpError} - Nếu không tìm thấy cuộc hội thoại.
 */
export const populateConversation = async (
  id,
  fieldToPopulate,
  fieldsToRemove
) => {
  const populatedConvo = await ConversationModel.findOne({ _id: id }).populate(
    fieldToPopulate,
    fieldsToRemove
  );
  if (!populatedConvo)
    throw createHttpError.BadRequest("Oops...Something went wrong !");
  return populatedConvo;
};

/**
 * Hàm lấy danh sách các cuộc hội thoại của một người dùng.
 * @param {String} user_id - id của người dùng.
 * @returns {Array} - Danh sách các cuộc hội thoại mà người dùng tham gia, được sắp xếp theo thời gian cập nhật giảm dần.
 * @throws {HttpError} - Nếu có lỗi trong quá trình truy xuất dữ liệu.
 */
export const getUserConversations = async (user_id) => {
  let conversations;
  await ConversationModel.find({
    users: { $elemMatch: { $eq: user_id } },
  })
    .populate("users", "-password") // Populate thông tin người dùng trong cuộc hội thoại
    .populate("admin", "-password") // Populate thông tin admin nếu có
    .populate("latestMessage") // Populate tin nhắn mới nhất
    .sort({ updatedAt: -1 }) // Sắp xếp theo thời gian cập nhật giảm dần
    .then(async (results) => {
      // Populate trường "sender" của latestMessage trong từng cuộc hội thoại
      results = await UserModel.populate(results, {
        path: "latestMessage.sender",
        select: "name email picture status",
      });
      conversations = results;
    })
    .catch((err) => {
      throw createHttpError.BadRequest("Oops...Something went wrong !");
    });
  return conversations;
};

/**
 * Hàm cập nhật tin nhắn mới nhất (latestMessage) của một cuộc hội thoại.
 * @param {String} convo_id - id của cuộc hội thoại cần cập nhật.
 * @param {Object} msg - Tin nhắn mới nhất cần cập nhật vào cuộc hội thoại.
 * @returns {Object} - Cuộc hội thoại sau khi đã được cập nhật.
 * @throws {HttpError} - Nếu không thể cập nhật cuộc hội thoại.
 */
export const updateLatestMessage = async (convo_id, msg) => {
  const updatedConvo = await ConversationModel.findByIdAndUpdate(convo_id, {
    latestMessage: msg,
  });
  if (!updatedConvo)
    throw createHttpError.BadRequest("Oops...Something went wrong !");
  return updatedConvo;
};
