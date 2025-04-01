import React, { useState, useEffect, useRef } from "react";
import dmCSS from "./directmessage.module.css";
import socket from "../../Socket/Socket";
import { useSelector } from "react-redux";
import NotificationsIcon from "@mui/icons-material/Notifications";
import PushPinIcon from "@mui/icons-material/PushPin";
import PeopleAltIcon from "@mui/icons-material/PeopleAlt";
import InboxIcon from "@mui/icons-material/Inbox";
import HelpIcon from "@mui/icons-material/Help";
import jwt from "jwt-decode";

function DirectMessage({ friendId }) {
  const [hideMembers, setHideMembers] = useState(false);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [friendDetails, setFriendDetails] = useState(null);
  const messageEndRef = useRef(null);

  // Get user details from Redux
  const userId = useSelector((state) => state.user_info.id);
  const username = useSelector((state) => state.user_info.username);

  // Get profile pic from token as fallback
  const token = localStorage.getItem("token");
  const tokenData = token ? jwt(token) : {};
  // Use the profile_pic directly from token data
  const profile_pic = tokenData.profile_pic || "";

  // URL base without /api prefix
  const baseUrl = (
    process.env.REACT_APP_URL || "http://localhost:3080"
  ).replace(/\/api$/, "");

  // Scroll to bottom of messages
  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    console.log("DirectMessage component mounted with friendId:", friendId);

    // Retrieve friend details
    const fetchFriendDetails = async () => {
      try {
        // Using baseUrl to ensure no /api prefix
        const response = await fetch(`${baseUrl}/api/users/${friendId}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "x-auth-token": localStorage.getItem("token"),
          },
        });

        if (response.ok) {
          const data = await response.json();
          console.log("Friend details:", data);
          setFriendDetails(data);
        } else {
          console.warn(
            `Failed to fetch friend details: ${response.status} ${response.statusText}`
          );

          // Create fallback friend details from friendId
          // This allows messaging to work even if API call fails
          setFriendDetails({
            id: friendId,
            username: `User_${friendId.substring(0, 6)}`,
            profile_pic: "https://cdn.discordapp.com/embed/avatars/0.png",
            tag: "0000",
          });
        }
      } catch (error) {
        console.error("Error fetching friend details:", error);

        // Create fallback friend details on error
        setFriendDetails({
          id: friendId,
          username: `User_${friendId.substring(0, 6)}`,
          profile_pic: "https://cdn.discordapp.com/embed/avatars/0.png",
          tag: "0000",
        });
      }
    };

    fetchFriendDetails();

    // useEffect for socket events
    console.log(
      "Setting up socket event listeners with friendId:",
      friendId,
      "userId:",
      userId
    );

    // Log existing listeners before adding new ones
    console.log(
      "Current socket listeners:",
      socket._events || "No events found"
    );

    // Handler for receiving direct messages
    const receiveHandler = (data) => {
      console.log("⚡ Received DM event with data:", data);
      if (
        (data.sender_id === friendId && data.receiver_id === userId) ||
        (data.sender_id === userId && data.receiver_id === friendId)
      ) {
        console.log("✅ Message is for this conversation, adding to state");

        // Check if this is a confirmation of a pending message
        setMessages((prev) => {
          // First check if we already have this exact message by _id
          // This prevents duplicate messages from appearing
          const existingMessageIndex = prev.findIndex(
            (msg) => msg._id && msg._id === data._id
          );

          // If message with this _id already exists, don't add it again
          if (existingMessageIndex >= 0) {
            console.log(
              "Message with ID already exists, not adding duplicate:",
              data._id
            );
            return prev;
          }

          // Look for a pending message with matching content and sender_id
          const hasPendingMatch = prev.some(
            (msg) =>
              msg.pending &&
              msg.content === data.content &&
              msg.sender_id === data.sender_id &&
              Math.abs(msg.timestamp - data.timestamp) < 5000 // Within 5 seconds
          );

          if (hasPendingMatch) {
            console.log(
              "Found pending message, replacing with confirmed message"
            );
            // Replace the pending message with the confirmed one
            return prev.map((msg) =>
              msg.pending &&
              msg.content === data.content &&
              msg.sender_id === data.sender_id &&
              Math.abs(msg.timestamp - data.timestamp) < 5000
                ? { ...data, pending: false } // Replace with server message
                : msg
            );
          } else {
            // Add as a new message
            return [...prev, data];
          }
        });
      } else {
        console.log("❌ Message is NOT for this conversation, ignoring");
      }
    };

    // Handler for message history
    const historyHandler = (messages) => {
      console.log("⚡ Received dm_history event with messages:", messages);
      setMessages(messages || []);
    };

    // Handler for errors
    const errorHandler = (error) => {
      console.error("⚠️ Socket error:", error);
      console.error("Error type:", typeof error);
      console.error("Error details:", JSON.stringify(error, null, 2));
      // Show an alert for better visibility during testing
      alert(`Socket error: ${JSON.stringify(error)}`);
    };

    // Clean up any existing listeners to prevent duplicates
    socket.off("receive_dm");
    socket.off("dm_history");
    socket.off("dm_error");

    // Add listeners
    socket.on("receive_dm", receiveHandler);
    socket.on("dm_history", historyHandler);
    socket.on("dm_error", errorHandler);

    // Join DM room
    const roomId = [userId, friendId].sort().join("_");
    console.log(`🔌 Joining DM room: ${roomId}`);
    socket.emit("join_dm", { userId, friendId });

    // Clean up listeners when component unmounts
    return () => {
      console.log("Cleaning up socket event listeners");
      socket.off("receive_dm", receiveHandler);
      socket.off("dm_history", historyHandler);
      socket.off("dm_error", errorHandler);
      // Leave the room when component unmounts
      socket.emit("leave_dm", { userId, friendId });
    };
  }, [friendId, userId]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (message.trim()) {
      // Check if socket is connected
      if (!socket.connected) {
        console.error("Socket is not connected! Attempting to reconnect...");
        alert("Connection to chat server lost. Attempting to reconnect...");
        socket.connect(); // Try to reconnect
        return; // Don't send the message yet
      }

      const timestamp = Date.now();

      // Create a consistent room ID
      const roomId = [userId, friendId].sort().join("_");

      console.log(`📤 Sending message to room ${roomId}:`, message);

      // Use only snake_case field names to be consistent with server schema
      const messageData = {
        sender_id: userId,
        receiver_id: friendId,
        content: message,
        timestamp: timestamp,
        sender_name: username,
        sender_pic: profile_pic,
        room_id: roomId,
      };

      // Add message to local state with format matching database schema
      const localMessage = {
        content: message,
        sender_id: userId,
        receiver_id: friendId,
        sender_name: username,
        sender_pic: profile_pic,
        timestamp: timestamp,
        room_id: roomId,
        _id: `temp-${Date.now()}`, // Temporary ID until server assigns one
        pending: true, // Mark as pending until confirmed
      };

      setMessages((prev) => [...prev, localMessage]);
      console.log("Added message to local state:", localMessage);

      // Send message through socket
      console.log("Emitting send_dm event with data:", messageData);

      try {
        socket.emit("send_dm", messageData);
        setMessage("");
      } catch (error) {
        console.error("Error sending message:", error);
        alert(`Failed to send message: ${error.message}`);
      }
    }
  };

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return `Today at ${date.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      })}`;
    } else if (date.toDateString() === yesterday.toDateString()) {
      return `Yesterday at ${date.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      })}`;
    } else {
      return `${date.toLocaleDateString()} ${date.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      })}`;
    }
  };

  // Get the friend's name to display
  const displayName =
    friendDetails?.username || `Friend ID: ${friendId.substring(0, 8)}...`;

  return (
    <div className={dmCSS.dm_container}>
      {/* Header */}
      <div className={dmCSS.dm_header}>
        <div className={dmCSS.user_info}>
          <img
            src={
              friendDetails?.profile_pic ||
              "https://cdn.discordapp.com/embed/avatars/0.png"
            }
            alt={friendDetails?.username}
            className={dmCSS.user_avatar}
          />
          <span className={dmCSS.user_name}>
            {friendDetails?.username || "Loading..."}
          </span>
        </div>
        <div className={dmCSS.header_actions}>
          <NotificationsIcon className={dmCSS.header_icon} sx={{ fontSize: 40 }} />
          <PushPinIcon className={dmCSS.header_icon} fontSize="large" sx={{ fontSize: 40 }} />
          <PeopleAltIcon className={dmCSS.header_icon} fontSize="large" sx={{ fontSize: 40 }} />
          <InboxIcon className={dmCSS.header_icon} fontSize="large" sx={{ fontSize: 40 }} />
          <HelpIcon className={dmCSS.header_icon} fontSize="large" sx={{ fontSize: 40 }} />
        </div>
      </div>

      {/* Messages Area */}
      <div className={dmCSS.messages_container}>
        {messages.map((msg, index) => (
          <div
            key={msg._id || `${msg.sender_id}-${index}`}
            className={dmCSS.messageItem}
          >
            <div className={dmCSS.messageHeader}>
              <img
                src={
                  msg.sender_id === userId
                    ? profile_pic
                    : friendDetails?.profile_pic
                }
                alt=""
                className={dmCSS.avatar}
              />
              <span className={dmCSS.username}>
                {msg.sender_id === userId ? username : friendDetails?.username}
              </span>
              <span className={dmCSS.timestamp}>
                {new Date(msg.timestamp).toLocaleTimeString()}
              </span>
              {msg.pending && (
                <span className={dmCSS.pendingIndicator}>(sending...)</span>
              )}
            </div>
            <div className={dmCSS.messageContent}>
              <p>{msg.content}</p>
            </div>
          </div>
        ))}
        <div ref={messageEndRef} />
      </div>

      {/* Message Input */}
      <form onSubmit={handleSendMessage} className={dmCSS.messageForm}>
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder={`Message @${friendDetails?.username || "..."}`}
          className={dmCSS.messageInput}
        />
        <button type="submit" className={dmCSS.sendButton}>
          Send
        </button>
      </form>

      {/* User Info Panel */}
      <div className={dmCSS.user_info_panel}>
        <div className={dmCSS.user_profile}>
          <img
            src={
              friendDetails?.profile_pic ||
              "https://cdn.discordapp.com/embed/avatars/0.png"
            }
            alt={friendDetails?.username}
            className={dmCSS.profile_avatar}
          />
          <h2 className={dmCSS.profile_name}>{friendDetails?.username}</h2>
          <span className={dmCSS.profile_tag}>#{friendDetails?.tag}</span>
        </div>

        <div className={dmCSS.divider} />

        <div className={dmCSS.user_section}>
          <h3 className={dmCSS.section_title}>Discord Member Since</h3>
          <div className={dmCSS.section_content}>
            {new Date().toLocaleDateString()}
          </div>
        </div>

        <div className={dmCSS.user_section}>
          <h3 className={dmCSS.section_title}>Note</h3>
          <div className={dmCSS.section_content}>Click to add a note</div>
        </div>
      </div>
    </div>
  );
}

export default DirectMessage;
