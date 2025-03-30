const { Server } = require("socket.io");

const setupSocket = (server) => {
  const io = new Server(server, {
    pingTimeout: 20000,
    cors: {
      origin: "http://localhost:3000",
    },
  });

  // io.on('connection', (socket) => {
  //   socket.on('get_userid', (user_id) => {
  //     socket.join(user_id);
  //   });

  //   socket.on('send_req', (receiver_id, sender_id, sender_profile_pic, sender_name) => {
  //     socket.to(receiver_id).emit('recieve_req', {
  //       sender_name,
  //       sender_profile_pic,
  //       sender_id,
  //     });
  //   });

  // });
  io.on("connection", (socket) => {
    socket.on("get_userid", (user_id) => {
      socket.join(user_id);
    });

    socket.on(
      "send_req",
      (receiver_id, sender_id, sender_profile_pic, sender_name) => {
        socket
          .to(receiver_id)
          .emit("recieve_req", { sender_name, sender_profile_pic, sender_id });
      }
    );

    socket.on(
      "req_accepted",
      (sender_id, friend_id, friend_name, friend_profile_pic) => {
        socket.to(friend_id).emit("req_accepted_notif", {
          sender_id,
          friend_name,
          friend_profile_pic,
        });
      }
    );

    socket.on("join_chat", (channel_id) => {
      socket.join(channel_id);
    });

    socket.on(
      "send_message",
      (channel_id, message, timestamp, sender_name, sender_tag, sender_pic) => {
        socket.to(channel_id).emit("recieve_message", {
          message_data: {
            message,
            timestamp,
            sender_name,
            sender_tag,
            sender_pic,
          },
        });
      }
    );
  });

  return io;
};

module.exports = { setupSocket };
