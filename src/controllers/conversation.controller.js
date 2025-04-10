// Import thư viện tạo lỗi HTTP
import createHttpError from "http-errors";
// Import logger để ghi log lỗi, thông tin debug,...
import logger from "../configs/logger.config.js";
// Import các hàm phục vụ quản lý cuộc hội thoại từ service
import {
  createConversation, // Hàm tạo cuộc hội thoại mới
  doesConversationExist, // Kiểm tra xem cuộc hội thoại đã tồn tại chưa
  getUserConversations, // Lấy danh sách cuộc hội thoại của người dùng
  populateConversation, // Thực hiện populate các field trong cuộc hội thoại (ví dụ: thông tin người dùng)
} from "../services/conversation.service.js";

/**
 * Hàm tạo cuộc hội thoại (open conversation) giữa 2 người hoặc nhóm chat
 * Dựa vào thông tin từ req.body và thông tin người dùng đã đăng nhập (req.user)
 */
export const create_open_conversation = async (req, res, next) => {
  // In dữ liệu request ra console để debug
  console.log(req.body);
  try {
    // Lấy id của người gửi từ thông tin đã được middleware xác thực (req.user)
    const sender_id = req.user.userId;
    // Lấy thông tin receiver_id và isGroup từ request body
    const { receiver_id, isGroup } = req.body;

    // Nếu đây là cuộc trò chuyện cá nhân (không phải nhóm)
    if (isGroup == false) {
      // Kiểm tra nếu không có receiver_id được cung cấp thì log lỗi và ném lỗi HTTP BadGateway
      if (!receiver_id) {
        logger.error(
          "please provide the user id you wanna start a conversation with !"
        );
        throw createHttpError.BadGateway("Oops...Something went wrong !");
      }

      // Kiểm tra xem cuộc trò chuyện giữa sender và receiver đã tồn tại hay chưa
      const existed_conversation = await doesConversationExist(
        sender_id,
        receiver_id,
        false // false vì không phải nhóm
      );

      // Nếu cuộc hội thoại đã tồn tại, trả về thông tin cuộc hội thoại đó cho client
      if (existed_conversation) {
        return res.json(existed_conversation);
      }

      // Nếu chưa có, tạo dữ liệu cho cuộc hội thoại mới
      let convoData = {
        name: "conversation name", // Tên cuộc hội thoại (có thể được cập nhật sau)
        picture: "conversation picture", // Ảnh đại diện cuộc hội thoại
        isGroup: false, // Đánh dấu đây là cuộc trò chuyện cá nhân
        users: [sender_id, receiver_id], // Danh sách người tham gia cuộc hội thoại
      };

      // Tạo cuộc hội thoại mới
      const newConvo = await createConversation(convoData);
      // Thực hiện populate các field (ví dụ: thông tin người dùng) trong cuộc hội thoại mới tạo
      const populatedConvo = await populateConversation(
        newConvo._id,
        "users", // populate field 'users'
        "-password" // loại bỏ trường password khi trả về thông tin người dùng
      );
      // Trả về thông tin cuộc hội thoại mới tạo cho client với mã trạng thái 200
      return res.status(200).json(populatedConvo);
    } else {
      // Nếu đây là cuộc hội thoại nhóm
      console.log("hnaaaaaaaaaa");
      // Kiểm tra xem nhóm chat đã tồn tại hay chưa (trong trường hợp này không sử dụng sender_id hay receiver_id)
      const existed_group_conversation = await doesConversationExist(
        "",
        "",
        isGroup
      );
      // Trả về thông tin cuộc hội thoại nhóm cho client
      return res.status(200).json(existed_group_conversation);
    }
  } catch (error) {
    // Nếu có lỗi xảy ra, chuyển lỗi cho middleware xử lý lỗi
    next(error);
  }
};

/**
 * Hàm lấy danh sách các cuộc hội thoại của người dùng hiện tại
 */
export const getConversations = async (req, res, next) => {
  try {
    // Lấy id của người dùng từ thông tin đã được xác thực (req.user)
    const user_id = req.user.userId;
    // Lấy danh sách cuộc hội thoại của người dùng thông qua service
    const conversations = await getUserConversations(user_id);
    // Trả về danh sách cuộc hội thoại với mã trạng thái 200
    res.status(200).json(conversations);
  } catch (error) {
    // Chuyển lỗi phát sinh cho middleware xử lý lỗi
    next(error);
  }
};

/**
 * Hàm tạo cuộc hội thoại nhóm (group chat)
 */
export const createGroup = async (req, res, next) => {
  // Lấy tên nhóm và danh sách các user từ request body
  const { name, users } = req.body;
  // Thêm người dùng hiện tại (người tạo nhóm) vào danh sách các user
  users.push(req.user.userId);

  // Kiểm tra xem có đầy đủ thông tin tên nhóm và danh sách user không
  if (!name || !users) {
    throw createHttpError.BadRequest("Please fill all fields.");
  }
  // Kiểm tra số lượng người dùng, phải có ít nhất 2 người (không tính người tạo nhóm)
  if (users.length < 2) {
    throw createHttpError.BadRequest(
      "Atleast 2 users are required to start a group chat."
    );
  }

  // Tạo dữ liệu cho cuộc hội thoại nhóm
  let convoData = {
    name, // Tên nhóm
    users, // Danh sách người tham gia (bao gồm người tạo nhóm)
    isGroup: true, // Đánh dấu đây là cuộc hội thoại nhóm
    admin: req.user.userId, // Người tạo nhóm được gán làm quản trị viên
    picture: process.env.DEFAULT_GROUP_PICTURE, // Ảnh mặc định của nhóm được lấy từ biến môi trường
  };
  try {
    // Tạo cuộc hội thoại nhóm mới
    const newConvo = await createConversation(convoData);
    // Populate các field như 'users' và 'admin', đồng thời loại bỏ thông tin password
    const populatedConvo = await populateConversation(
      newConvo._id,
      "users admin", // populate thông tin của users và admin
      "-password" // loại bỏ trường password khỏi dữ liệu trả về
    );
    // Trả về thông tin cuộc hội thoại nhóm mới tạo cho client
    res.status(200).json(populatedConvo);
  } catch (error) {
    // Nếu có lỗi xảy ra trong quá trình tạo nhóm, chuyển lỗi cho middleware xử lý lỗi
    next(error);
  }
};
