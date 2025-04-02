import React, { useEffect, useState, useRef } from "react";
import { useSelector } from "react-redux";
import valid_chat_css from "../valid_main_chat/valid_chat_css.module.css";
import AddCircleIcon from "@mui/icons-material/AddCircle";
import TagIcon from "@mui/icons-material/Tag";
import socket from "../../Socket/Socket";
import { useParams } from "react-router-dom";
import { uploadFileToS3 } from "../../aws-s3-storage-blob";
import Picker from "emoji-picker-react";
import EmojiPickerButton from "../emojiPicker/EmojiPickerButton";
function Valid_chat() {
  const url = process.env.REACT_APP_URL;
  const { server_id } = useParams();
  const chatEndRef = useRef(null); // 🔹 Create a ref for the chat end

  const channel_id = useSelector((state) => state.current_page.page_id);
  const channel_name = useSelector((state) => state.current_page.page_name);
  const username = useSelector((state) => state.user_info.username);
  const tag = useSelector((state) => state.user_info.tag);
  const profile_pic = useSelector((state) => state.user_info.profile_pic);
  const id = useSelector((state) => state.user_info.id);
  const [imageUrl, setImageUrl] = useState("");
  const [chat_message, setchat_message] = useState({
    content: "",
    contentType: "text",
  });
  const [showEmojiPicker, setShowEmojiPicket] = useState(false);
  const [all_messages, setall_messages] = useState([]);
  const [latest_message, setlatest_message] = useState(null);
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
    if (channel_id) {
      socket.emit("join_chat", channel_id);
      setall_messages([]);
      get_messages();
    }
  }, [channel_id]);

  const send_message = (e) => {
    if (
      (e.code === "Enter" && chat_message["content"].trim() !== "") ||
      imageUrl
    ) {
      const message_to_send =
        chat_message.contentType === "image"
          ? imageUrl
          : chat_message["content"].trim();
      const timestamp = Date.now();
      const contentType = chat_message.contentType;
      setchat_message({ content: "", contentType: "text" });
      setImageUrl("");

      // Ensure profile_pic is a string and not undefined
      const userProfilePic =
        profile_pic || "https://cdn.discordapp.com/embed/avatars/0.png";

      const newMessage = {
        content: message_to_send,
        sender_id: id,
        sender_name: username,
        sender_pic: userProfilePic,
        contentType,
        timestamp,
      };

      // Add new message to state with guaranteed profile pic
      setall_messages((prev) => [...prev, newMessage]);

      socket.emit(
        "send_message",
        channel_id,
        message_to_send,
        timestamp,
        username,
        tag,
        contentType,
        userProfilePic
      );

      store_message(message_to_send, contentType, timestamp);
    }
  };

  const store_message = async (chat_message, contentType, timestamp) => {
    try {
      const res = await fetch(`${url}/chats/message`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-auth-token": localStorage.getItem("token"),
        },
        body: JSON.stringify({
          message: chat_message,
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

  const get_messages = async () => {
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
        setall_messages(data.chats);
      }
    } catch (error) {}
  };

  useEffect(() => {
    if (latest_message) {
      const {
        message,
        timestamp,
        sender_name,
        sender_tag,
        sender_pic,
        sender_id,
      } = latest_message.message_data;

      // Ensure profile_pic is a string and not undefined
      const userProfilePic =
        sender_pic || "https://cdn.discordapp.com/embed/avatars/0.png";

      setall_messages((prev) => [
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
  }, [latest_message]);

  useEffect(() => {
    const messageListener = (message_data) => {
      setlatest_message(message_data);
    };

    socket.on("recieve_message", messageListener);

    return () => {
      socket.off("recieve_message", messageListener);
    };
  }, []);

  // 🔹 Scroll to bottom when messages update
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [all_messages]);
  const handleImageSelect = async (e) => {
    const file = e.target.files[0];
    let imgUrl = await uploadFileToS3(file);
    setchat_message({
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

          {all_messages.length > 0 &&
            all_messages.map((elem, index) => {
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
      {chat_message.contentType === "image" && (
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
              color: "black",
              transition: "color 0.2s",
              color: "white",
            }}
            title="Remove"
            onClick={() => {
              setchat_message({ content: "", contentType: "text" });
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
            onKeyDown={send_message}
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
                  setchat_message((prev) => {
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
            onKeyDown={send_message}
            value={chat_message.content}
            onChange={(e) => {
              const input = e.target.value.slice(0, 150);
              setchat_message({
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

export default Valid_chat;
