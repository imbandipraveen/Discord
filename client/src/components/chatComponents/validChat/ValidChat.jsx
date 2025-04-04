import React, { useEffect, useState, useRef } from "react";
import { useSelector } from "react-redux";
import valid_chat_css from "./validChat.module.css";
import AddCircleIcon from "@mui/icons-material/AddCircle";
import TagIcon from "@mui/icons-material/Tag";
import socket from "../../Socket/Socket";
import { useParams } from "react-router-dom";
import { uploadFileToS3 } from "../../storage/aws-s3-storage-blob";
import Picker from "emoji-picker-react";
import EmojiPickerButton from "../emojiPicker/EmojiPickerButton";
import { useNavigate } from "react-router-dom";
import config from "../../../config/config";

function ValidChat() {
  const url = config.API_BASE_URL;
  const { server_id } = useParams();
  const chatEndRef = useRef(null); // 🔹 Create a ref for the chat end

  const channel_id = useSelector((state) => state.current_page.page_id);
  const channel_name = useSelector((state) => state.current_page.page_name);
  const username = useSelector((state) => state.user_info.username);
  const tag = useSelector((state) => state.user_info.tag);
  const profile_pic = useSelector((state) => state.user_info.profile_pic);
  const id = useSelector((state) => state.user_info.id);
  const [imageUrl, setImageUrl] = useState("");
  const [chatMessage, setChatMessage] = useState({
    content: "",
    contentType: "text",
  });
  const [showEmojiPicker, setShowEmojiPicket] = useState(false);
  const [allMessages, setAllMessages] = useState([]);
  const [latestMessage, setLatestMessage] = useState(null);
  const pickerRef = useRef(null);
  const navigate = useNavigate();

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
    if (channel_id) {
      socket.emit("join_chat", channel_id);
      setAllMessages([]);
      getMessages();
    }
  }, [channel_id]);

  const sendMessage = (e) => {
    if (
      (e.code === "Enter" && chatMessage["content"].trim() !== "") ||
      imageUrl
    ) {
      const messageToSend =
        chatMessage.contentType === "image"
          ? imageUrl
          : chatMessage["content"].trim();
      const timestamp = Date.now();
      const contentType = chatMessage.contentType;
      setChatMessage({ content: "", contentType: "text" });
      setImageUrl("");

      // Ensure profile_pic is a string and not undefined
      const userProfilePic =
        profile_pic || "https://cdn.discordapp.com/embed/avatars/0.png";

      const newMessage = {
        content: messageToSend,
        sender_id: id,
        sender_name: username,
        sender_pic: userProfilePic,
        contentType,
        timestamp,
      };

      // Add new message to state with guaranteed profile pic
      setAllMessages((prev) => [...prev, newMessage]);

      socket.emit(
        "sendMessage",
        channel_id,
        messageToSend,
        timestamp,
        username,
        tag,
        contentType,
        userProfilePic
      );

      storeMessage(messageToSend, contentType, timestamp);
    }
  };

  const storeMessage = async (chatMessage, contentType, timestamp) => {
    try {
      const res = await fetch(`${url}/chats/message`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-auth-token": localStorage.getItem("token"),
        },
        body: JSON.stringify({
          message: chatMessage,
          server_id,
          channel_id,
          channel_name,
          timestamp,
          username,
          tag,
          id,
          contentType,
          profile_pic,
        }),
      });

      const data = await res.json();
      if (data.status === 200) {
      }
    } catch (error) {
      throw error;
    }
  };

  const getMessages = async () => {
    try {
      const res = await fetch(`${url}/chats/messages`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-auth-token": localStorage.getItem("token"),
        },
        body: JSON.stringify({
          channel_id,
          server_id,
        }),
      });

      const data = await res.json();
      if (data.chats?.length) {
        setAllMessages(data.chats);
      }
    } catch (error) {
      navigate("/");
      console.log(error);
    }
  };

  useEffect(() => {
    if (latestMessage) {
      const { message, timestamp, sender_name, sender_pic, sender_id } =
        latestMessage.message_data;

      // Ensure profile_pic is a string and not undefined
      const userProfilePic =
        sender_pic || "https://cdn.discordapp.com/embed/avatars/0.png";

      setAllMessages((prev) => [
        ...prev,
        {
          content: message,
          sender_id,
          sender_name,
          sender_pic: userProfilePic,
          timestamp,
        },
      ]);
    }
  }, [latestMessage]);

  useEffect(() => {
    const messageListener = (message_data) => {
      setLatestMessage(message_data);
    };

    socket.on("recieve_message", messageListener);

    return () => {
      socket.off("recieve_message", messageListener);
    };
  }, []);

  //  Scroll to bottom when messages update
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [allMessages]);
  const handleImageSelect = async (e) => {
    const file = e.target.files[0];
    let imgUrl = await uploadFileToS3(file);
    setChatMessage({
      content: "",
      contentType: "image",
    });
    setImageUrl(imgUrl);
  };
  return (
    <div className={valid_chat_css.mainchat}>
      <div id={valid_chat_css.top}>
        <div id={valid_chat_css.welcome_part}>
          <div id={valid_chat_css.tag}>
            <TagIcon fontSize="large" />
          </div>
          <div
            className={valid_chat_css.welcome_comps}
            id={valid_chat_css.welcome_comp_1}
          >
            Welcome to #{channel_name}
          </div>
          <div
            className={valid_chat_css.welcome_comps}
            id={valid_chat_css.welcome_comp_2}
          >
            This is the start of the #{channel_name} channel
          </div>

          {allMessages.length > 0 &&
            allMessages.map((elem, index) => {
              let timestamp_init = parseInt(elem.timestamp, 10);
              const date = new Date(timestamp_init);
              const timestamp = `${date.toDateString()}, ${date.getHours()}:${date.getMinutes()}`;

              return (
                <div key={index} id={valid_chat_css.message_box}>
                  <div
                    className={valid_chat_css.message_box_comps}
                    id={valid_chat_css.message_left}
                  >
                    <div className={valid_chat_css.user_image_wrap}>
                      <img
                        id={valid_chat_css.user_image}
                        src={
                          elem?.sender_pic ||
                          "https://cdn.discordapp.com/embed/avatars/0.png"
                        }
                        alt="User"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src =
                            "https://cdn.discordapp.com/embed/avatars/0.png";
                        }}
                      />
                    </div>
                  </div>
                  <div
                    className={valid_chat_css.message_box_comps}
                    id={valid_chat_css.message_right}
                  >
                    <div
                      className={valid_chat_css.message_right_comps}
                      id={valid_chat_css.message_right_top}
                    >
                      <div id={valid_chat_css.message_username}>
                        {elem.sender_name}
                      </div>
                      <div id={valid_chat_css.message_timestamp}>
                        {timestamp}
                      </div>
                    </div>
                    <div
                      className={valid_chat_css.message_right_comps}
                      id={valid_chat_css.message_right_bottom}
                    >
                      {elem.contentType === "image" ? (
                        <img
                          src={elem.content}
                          style={{ width: "200px" }}
                          alt="message "
                        />
                      ) : (
                        <div>{elem.content}</div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}

          <div ref={chatEndRef} />
        </div>
      </div>
      {chatMessage.contentType === "image" && (
        <div
          style={{
            width: "100%",
            height: "200px",
            position: "absolute",
            bottom: "100px",
            backgroundColor: "rgba(108, 122, 137, 0.3)", // bg-slate-700 with opacity
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            borderRadius: "8px",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              position: "absolute",
              top: 0,
              right: 0,
              width: "fit-content",
              padding: "8px",
              cursor: "pointer",
              transition: "color 0.2s",
              color: "white",
            }}
            title="Remove"
            onClick={() => {
              setChatMessage({ content: "", contentType: "text" });
            }}
          >
            X
          </div>
          <div
            style={{
              backgroundColor: "white",
              padding: "12px",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <img
              src={imageUrl}
              alt="uploadImage"
              style={{
                width: "250px",
                height: "250px",
                objectFit: "contain",
                borderRadius: "8px",
              }}
            />
          </div>
        </div>
      )}

      <div id={valid_chat_css.bottom}>
        <div id={valid_chat_css.message_input}>
          <input
            type="file"
            id="fileInput"
            style={{ display: "none" }}
            onChange={handleImageSelect}
            onKeyDown={sendMessage}
          />

          <AddCircleIcon
            htmlColor="#B9BBBE"
            style={{ cursor: "pointer" }}
            onClick={() => document.getElementById("fileInput").click()}
          />
          <EmojiPickerButton
            setShowEmojiPicket={() => {
              setShowEmojiPicket(!showEmojiPicker);
            }}
          />
          {showEmojiPicker && (
            <div
              style={{
                position: "absolute",
                bottom: "100px",
                left: "100px",
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
                  setChatMessage((prev) => {
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
            onKeyDown={sendMessage}
            value={chatMessage.content}
            onChange={(e) => {
              const input = e.target.value.slice(0, 150);
              setChatMessage({
                content: input,
                contentType: "text",
              });
            }}
            placeholder={`Message #${channel_name}`}
            maxLength="150"
          />
        </div>
      </div>
    </div>
  );
}

export default ValidChat;
