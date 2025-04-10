// Mảng lưu trữ danh sách các người dùng online, mỗi phần tử chứa userId và socketId
let onlineUsers = [];

// Export một hàm xử lý các sự kiện của Socket.IO.
// Hàm này nhận vào đối tượng socket của client kết nối và instance io của Socket.IO.
export default function (socket, io) {
  // Khi một người dùng kết nối hoặc mở ứng dụng (join)
  socket.on("join", (user) => {
    // Đưa socket của người dùng vào một room có tên là user (userId)
    socket.join(user);

    // Nếu user chưa có trong danh sách onlineUsers, thêm vào danh sách
    if (!onlineUsers.some((u) => u.userId === user)) {
      onlineUsers.push({ userId: user, socketId: socket.id });
    }

    // Phát (broadcast) danh sách các người dùng online tới tất cả client
    io.emit("get-online-users", onlineUsers);

    // Phát socket id của client vừa kết nối tới tất cả client
    io.emit("setup socket", socket.id);
  });

  // Khi socket disconnect (ngắt kết nối)
  socket.on("disconnect", () => {
    // Loại bỏ người dùng có socket id khớp khỏi danh sách onlineUsers
    onlineUsers = onlineUsers.filter((user) => user.socketId !== socket.id);
    // Phát danh sách onlineUsers cập nhật tới tất cả client
    io.emit("get-online-users", onlineUsers);
  });

  // Khi một người dùng tham gia một phòng cuộc hội thoại cụ thể
  socket.on("join conversation", (conversation) => {
    // Socket sẽ gia nhập room có tên là conversation (thường là id của cuộc hội thoại)
    socket.join(conversation);
  });

  // Khi một người dùng gửi tin nhắn
  socket.on("send message", (message) => {
    // Lấy thông tin cuộc hội thoại từ tin nhắn
    let conversation = message.conversation;
    // Nếu không có trường users trong conversation, không xử lý tiếp
    if (!conversation.users) return;
    // Với mỗi user trong cuộc hội thoại
    conversation.users.forEach((user) => {
      // Nếu user là người gửi, bỏ qua
      if (user._id === message.sender._id) return;
      // Gửi sự kiện "receive message" tới các room của người nhận, dựa trên user id
      socket.in(user._id).emit("receive message", message);
    });
  });

  // Khi người dùng đang gõ tin nhắn (typing)
  socket.on("typing", (conversation) => {
    // Phát sự kiện "typing" tới các client khác trong room của cuộc hội thoại
    socket.in(conversation).emit("typing", conversation);
  });

  // Khi người dùng dừng gõ tin nhắn (stop typing)
  socket.on("stop typing", (conversation) => {
    // Phát sự kiện "stop typing" tới các client khác trong room của cuộc hội thoại
    socket.in(conversation).emit("stop typing");
  });

  // Xử lý cuộc gọi:
  // Khi người dùng gọi đến một người khác
  socket.on("call user", (data) => {
    // Lấy user id của người cần gọi từ data
    let userId = data.userToCall;
    // Tìm socket id của người dùng đó từ danh sách onlineUsers
    let userSocketId = onlineUsers.find((user) => user.userId == userId);
    // Gửi sự kiện "call user" tới socket của người dùng được gọi, kèm theo thông tin thiết lập cuộc gọi
    io.to(userSocketId.socketId).emit("call user", {
      signal: data.signal,
      from: data.from,
      name: data.name,
      picture: data.picture,
    });
  });

  // Khi người dùng trả lời cuộc gọi
  socket.on("answer call", (data) => {
    // Gửi sự kiện "call accepted" tới người gọi (dựa trên socket id được cung cấp trong data)
    io.to(data.to).emit("call accepted", data.signal);
  });

  // Khi cuộc gọi kết thúc
  socket.on("end call", (id) => {
    // Gửi sự kiện "end call" tới socket có id được chỉ định
    io.to(id).emit("end call");
  });
}
