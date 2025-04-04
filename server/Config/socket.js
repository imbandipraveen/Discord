const { Server } = require("socket.io");
const DirectMessage = require("../models/DirectMessage");

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

    // Direct Message socket events
    socket.on("join_dm", ({ userId, friendId }) => {
      try {
        if (!userId || !friendId) {
          console.error(" Missing userId or friendId in join_dm event");
          return;
        }

        const roomId = [userId, friendId].sort().join("_");

        // Join both user's individual room and the DM room
        socket.join(userId);
        socket.join(roomId);

        // Fetch message history for this room
        DirectMessage.find({ room_id: roomId })
          .sort({ timestamp: 1 })
          .then((messages) => {
            // Send message history to the user who just joined
            socket.emit("dm_history", messages);
          })
          .catch((err) => {
            socket.emit("dm_error", {
              error: "Failed to load message history",
            });
          });
      } catch (error) {
        socket.emit("dm_error", { error: "Server error joining DM room" });
      }
    });

    socket.on("leave_dm", ({ userId, friendId }) => {
      const roomId = [userId, friendId].sort().join("_");
      socket.leave(roomId);
    });

    // Handle typing indicator
    socket.on("typing", (data) => {
      try {
        const { sender_id, receiver_id, room_id } = data;

        if (!sender_id || !receiver_id) {
          return;
        }

        // Use provided room_id or create one if not provided
        const roomId = room_id || [sender_id, receiver_id].sort().join("_");

        // Emit typing event to the room (excluding the sender)
        socket.to(roomId).emit("typing_indicator", {
          sender_id,
          receiver_id,
          timestamp: Date.now(),
        });
      } catch (error) {
        throw error;
      }
    });

    socket.on("send_dm", (messageData) => {
      try {
        // Extract fields with proper snake_case field names
        // Use optional chaining to avoid errors with undefined fields
        const sender_id = messageData?.sender_id;
        const receiver_id = messageData?.receiver_id;
        const content = messageData?.content;
        const timestamp = messageData?.timestamp || Date.now();
        const sender_name = messageData?.sender_name;
        const sender_pic = messageData?.sender_pic;
        const contentType = messageData?.contentType;

        // Validate required fields
        if (!sender_id) {
          socket.emit("dm_error", {
            error: "Missing sender_id field",
            messageData,
          });
          return;
        }

        if (!receiver_id) {
          socket.emit("dm_error", {
            error: "Missing receiver_id field",
            messageData,
          });
          return;
        }

        if (!content) {
          socket.emit("dm_error", {
            error: "Missing content field",
            messageData,
          });
          return;
        }

        // Create a consistent room ID by sorting the user IDs and joining them
        const roomId = [sender_id, receiver_id].sort().join("_");

        // Create a new message document with ONLY the fields defined in our schema
        const newMessage = {
          sender_id,
          receiver_id,
          room_id: roomId,
          content,
          contentType,
          timestamp,
        };

        // Only add optional fields if they exist
        if (sender_name) newMessage.sender_name = sender_name;
        if (sender_pic) newMessage.sender_pic = sender_pic;

        // Now create the database document
        const directMessage = new DirectMessage(newMessage);

        directMessage
          .save()
          .then((savedMessage) => {
            console.log("Message saved to database with ID:", savedMessage._id);

            try {
              // Only emit to the room once - everyone in the conversation should be in this room
              io.to(roomId).emit("receive_dm", savedMessage);

              // No need to emit to individual rooms since both users are in the shared room
              // This avoids duplicate messages for receivers
            } catch (emitError) {
              socket.emit("dm_error", {
                error: "Error sending message to recipient",
                details: emitError.message || "Unknown emit error",
              });
            }
          })
          .catch((err) => {
            let errorMessage = "Failed to save message to database";

            // Check for duplicate key error
            if (err.code === 11000) {
              errorMessage = "Duplicate message detected";
              console.error(
                "Duplicate key error details:",
                err.keyPattern,
                err.keyValue
              );
            }

            // Notify sender about error
            socket.emit("dm_error", {
              error: errorMessage,
              details: err.message || "Unknown database error",
              code: err.code,
            });
          });
      } catch (error) {
        socket.emit("dm_error", {
          error: "Server error processing message",
          details: error.message || "Unknown error",
        });
      }
    });
  });

  return io;
};

module.exports = { setupSocket };
