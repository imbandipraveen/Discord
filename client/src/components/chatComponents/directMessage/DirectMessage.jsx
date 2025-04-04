import React, { useState, useEffect, useRef } from "react";
import dmCSS from "./directMessage.module.css";
import socket from "../../Socket/Socket";
import { useSelector } from "react-redux";
import NotificationsIcon from "@mui/icons-material/Notifications";
import PushPinIcon from "@mui/icons-material/PushPin";
import PeopleAltIcon from "@mui/icons-material/PeopleAlt";
import InboxIcon from "@mui/icons-material/Inbox";
import HelpIcon from "@mui/icons-material/Help";
import AddCircleIcon from "@mui/icons-material/AddCircle";
import jwt from "jwt-decode";
import { uploadFileToS3 } from "../../aws-s3-storage-blob";
import EmojiPickerButton from "../emojiPicker/EmojiPickerButton";
import Picker from "emoji-picker-react";
import config from "../../../config/config";

function DirectMessage({ friendId }) {
  const [message, setMessage] = useState({ content: "", contentType: "text" });
  const [messages, setMessages] = useState([]);
  const [friendDetails, setFriendDetails] = useState(null);
  const [imageUrl, setImageUrl] = useState("");
  const messageEndRef = useRef(null);
  const [isTyping, setIsTyping] = useState(false);
  const [typingTimeout, setTypingTimeout] = useState(null);
  const [showEmojiPicker, setShowEmojiPicket] = useState(false);
  const userId = useSelector((state) => state.user_info.id);
  const username = useSelector((state) => state.user_info.username);
  const token = localStorage.getItem("token");
  const tokenData = token ? jwt(token) : {};
  const profile_pic = tokenData.profile_pic || "";

  const baseUrl = config.API_BASE_URL.replace(/\/api$/, "");
  const pickerRef = useRef(null);
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (pickerRef.current && !pickerRef.current.contains(event.target)) {
        setShowEmojiPicket(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);
  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    const fetchFriendDetails = async () => {
      try {
        const response = await fetch(`${baseUrl}/api/users/${friendId}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "x-auth-token": token,
          },
        });

        if (response.ok) {
          const data = await response.json();
          setFriendDetails(data);
        } else {
          setFriendDetails({
            id: friendId,
            username: `User_${friendId.substring(0, 6)}`,
            profile_pic: "https://cdn.discordapp.com/embed/avatars/0.png",
            tag: "0000",
          });
        }
      } catch (error) {
        console.error("Error fetching friend:", error);
      }
    };

    fetchFriendDetails();

    const receiveHandler = (data) => {
      const isThisChat =
        (data.sender_id === friendId && data.receiver_id === userId) ||
        (data.sender_id === userId && data.receiver_id === friendId);

      if (isThisChat) {
        setMessages((prev) => {
          const exists = prev.some((msg) => msg._id === data._id);
          if (exists) return prev;

          const hasPending = prev.some(
            (msg) =>
              msg.pending &&
              msg.content === data.content &&
              msg.sender_id === data.sender_id &&
              Math.abs(msg.timestamp - data.timestamp) < 5000
          );

          if (hasPending) {
            return prev.map((msg) =>
              msg.pending &&
              msg.content === data.content &&
              msg.sender_id === data.sender_id
                ? { ...data, pending: false }
                : msg
            );
          }

          return [...prev, data];
        });
      }
    };

    const historyHandler = (msgs) => {
      setMessages(msgs || []);
    };

    socket.off("receive_dm").on("receive_dm", receiveHandler);
    socket.off("dm_history").on("dm_history", historyHandler);
    socket.emit("join_dm", { userId, friendId });

    // Typing indicator event handlers
    const typingHandler = (data) => {
      if (data.sender_id === friendId && data.receiver_id === userId) {
        setIsTyping(true);

        // Clear any existing timeout
        if (typingTimeout) {
          clearTimeout(typingTimeout);
        }

        // Set a timeout to clear the typing indicator after 3 seconds
        const timeout = setTimeout(() => {
          setIsTyping(false);
        }, 3000);

        setTypingTimeout(timeout);
      }
    };

    // Add typing event listener
    socket.on("typing_indicator", typingHandler);

    return () => {
      socket.off("receive_dm", receiveHandler);
      socket.off("dm_history", historyHandler);
      socket.emit("leave_dm", { userId, friendId });
      socket.off("typing_indicator", typingHandler);

      // Clear any existing timeout
      if (typingTimeout) {
        clearTimeout(typingTimeout);
      }
    };
  }, [friendId, userId, token, typingTimeout]);

  const handleImageSelect = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const url = await uploadFileToS3(file);
    setImageUrl(url);
    setMessage({ content: "", contentType: "image" });
  };

  const handleSendMessage = (e) => {
    e.preventDefault();

    const isImage = message.contentType === "image";
    const text = message.content.trim();

    if (!text && !imageUrl) return;

    if (!socket.connected) {
      alert("Socket disconnected. Reconnecting...");
      socket.connect();
      return;
    }

    const timestamp = Date.now();
    const room_id = [userId, friendId].sort().join("_");
    const newMessage = {
      sender_id: userId,
      receiver_id: friendId,
      content: isImage ? imageUrl : text,
      contentType: message.contentType,
      sender_name: username,
      sender_pic: profile_pic,
      room_id,
      timestamp,
      _id: `temp-${timestamp}`,
      pending: true,
    };

    socket.emit("send_dm", newMessage);
    setMessages((prev) => [...prev, newMessage]);
    setMessage({ content: "", contentType: "text" });
    setImageUrl("");
  };

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const displayName =
    friendDetails?.username || `Friend ID: ${friendId.substring(0, 8)}...`;

  // Handle typing detection
  const handleInputChange = (e) => {
    setMessage({ content: e.target.value, contentType: "text" });

    // Emit typing event to socket
    socket.emit("typing", {
      sender_id: userId,
      receiver_id: friendId,
      room_id: [userId, friendId].sort().join("_"),
    });
  };

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
            alt={displayName}
            className={dmCSS.user_avatar}
          />
          <span className={dmCSS.user_name}>{displayName}</span>
        </div>
        <div className={dmCSS.header_actions}>
          <NotificationsIcon
            className={dmCSS.header_icon}
            sx={{ fontSize: 40 }}
          />
          <PushPinIcon
            className={dmCSS.header_icon}
            fontSize="large"
            sx={{ fontSize: 40 }}
          />
          <PeopleAltIcon
            className={dmCSS.header_icon}
            fontSize="large"
            sx={{ fontSize: 40 }}
          />
          <InboxIcon
            className={dmCSS.header_icon}
            fontSize="large"
            sx={{ fontSize: 40 }}
          />
          <HelpIcon
            className={dmCSS.header_icon}
            fontSize="large"
            sx={{ fontSize: 40 }}
          />
        </div>
      </div>

      {/* Messages */}
      <div className={dmCSS.messages_container}>
        {messages.map((msg, index) => (
          <div key={msg._id || index} className={dmCSS.messageItem}>
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
                {msg.sender_id === userId ? username : displayName}
              </span>
              <span className={dmCSS.timestamp}>
                {formatTimestamp(msg.timestamp)}
              </span>
              {msg.pending && (
                <span className={dmCSS.pendingIndicator}>Sending...</span>
              )}
            </div>
            <div className={dmCSS.messageContent}>
              {msg.contentType === "image" ? (
                <img
                  src={msg.content}
                  alt="message"
                  style={{ width: "200px" }}
                />
              ) : (
                <p>{msg.content}</p>
              )}
            </div>
          </div>
        ))}

        {/* Typing indicator */}
        {isTyping && (
          <div className={dmCSS.typing_indicator}>
            {friendDetails?.username} is typing
            <div className={dmCSS.typing_dots}>
              <div className={dmCSS.typing_dot}></div>
              <div className={dmCSS.typing_dot}></div>
              <div className={dmCSS.typing_dot}></div>
            </div>
          </div>
        )}

        <div ref={messageEndRef} />
      </div>

      {/* Image Preview */}
      {message.contentType === "image" && (
        <div className={dmCSS.imagePreview}>
          <div
            className={dmCSS.closeImage}
            onClick={() => setMessage({ content: "", contentType: "text" })}
          >
            ×
          </div>
          <img src={imageUrl} alt="preview" />
        </div>
      )}

      {/* Message Input */}
      <div className={dmCSS.messageForm}>
        <form onSubmit={handleSendMessage} style={{ width: "100%" }}>
          <input
            type="file"
            id="fileInput"
            style={{ display: "none" }}
            onChange={handleImageSelect}
          />
          <AddCircleIcon
            htmlColor="#B9BBBE"
            style={{
              cursor: "pointer",
              position: "absolute",
              bottom: "30px",
              left: "24px",
            }}
            onClick={() => document.getElementById("fileInput").click()}
          />
          {showEmojiPicker && (
            <div
              style={{
                position: "absolute",
                bottom: "100px",
                right: "380px",
                zIndex: 100,
                background: "#2f3136",
                borderRadius: "8px",
                boxShadow: "0 2px 10px rgba(0, 0, 0, 0.3)",
                width: "auto",
                maxHeight: "400px",
                overflowY: "auto",
                padding: "10px",
              }}
              ref={pickerRef}
            >
              <Picker
                pickerStyle={{ width: "100%" }}
                theme="dark"
                emojiStyle="facebook"
                onEmojiClick={(e) => {
                  setMessage((prev) => {
                    return {
                      content: prev.content + e.emoji,
                      contentType: "text",
                    };
                  });
                }}
              />
            </div>
          )}
          <input
            type="text"
            value={message.content}
            onChange={handleInputChange}
            style={{ paddingLeft: "80px" }}
            placeholder={`Message @${displayName}`}
            className={dmCSS.messageInput}
          />
          <button type="submit" className={dmCSS.sendButton}>
            Send
          </button>
        </form>
        <div style={{ position: "absolute", left: "50px" }}>
          <EmojiPickerButton
            setShowEmojiPicket={(e) => {
              e.preventDefault();
              setShowEmojiPicket(!showEmojiPicker);
            }}
          />
        </div>
      </div>

      {/* Right User Panel (Optional) */}
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
          <span className={dmCSS.profile_tag}>
            #{friendDetails?.tag || "0000"}
          </span>
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
