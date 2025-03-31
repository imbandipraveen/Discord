import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import valid_chat_css from "../valid_main_chat/valid_chat_css.module.css";
import AddCircleIcon from "@mui/icons-material/AddCircle";
import TagIcon from "@mui/icons-material/Tag";
import socket from "../../Socket/Socket";
import { useParams } from "react-router-dom";

function Valid_chat() {
  const url = process.env.REACT_APP_URL;
  const { server_id } = useParams();
  console.log(server_id, "server_id");

  // Redux state selectors
  const channel_id = useSelector((state) => state.current_page.page_id);
  const channel_name = useSelector((state) => state.current_page.page_name);
  const username = useSelector((state) => state.user_info.username);
  const tag = useSelector((state) => state.user_info.tag);
  const profile_pic = useSelector((state) => state.user_info.profile_pic);
  const id = useSelector((state) => state.user_info.id);

  // Component state
  const [chat_message, setchat_message] = useState("");
  const [all_messages, setall_messages] = useState([]);
  const [latest_message, setlatest_message] = useState(null);

  useEffect(() => {
    if (channel_id) {
      socket.emit("join_chat", channel_id);
      setall_messages([]);
      get_messages();
    }
  }, [channel_id]);

  const send_message = (e) => {
    if (e.code === "Enter" && chat_message.trim() !== "") {
      const message_to_send = chat_message.trim();
      const timestamp = Date.now();
      setchat_message("");

      const newMessage = {
        content: message_to_send,
        sender_id: id,
        sender_name: username,
        sender_pic: profile_pic,
        timestamp,
      };
      console.log("New Message:", newMessage);

      setall_messages((prev) => [...prev, newMessage]);

      socket.emit(
        "send_message",
        channel_id,
        message_to_send,
        timestamp,
        username,
        tag,
        profile_pic
      );

      store_message(message_to_send, timestamp);
    }
  };

  const store_message = async (chat_message, timestamp) => {
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
          profile_pic,
        }),
      });

      const data = await res.json();
      console.log(data);
      if (data.status === 200) {
        console.log("Message stored successfully");
      }
    } catch (error) {
      console.error("Error storing message:", error);
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
      console.log(data, "sent_chats");

      if (data.chats?.length) {
        setall_messages(data.chats);
      }
    } catch (error) {
      console.error("Error fetching messages:", error);
    }
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

      setall_messages((prev) => [
        ...prev,
        {
          content: message,
          sender_id,
          sender_name,
          sender_pic,
          timestamp,
        },
      ]);
    }
  }, [latest_message]);

  useEffect(() => {
    const messageListener = (message_data) => {
      console.log(message_data, "this is message");
      setlatest_message(message_data);
    };

    socket.on("recieve_message", messageListener);

    return () => {
      socket.off("recieve_message", messageListener);
    };
  }, []);

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
                        src={elem?.sender_pic}
                        alt="User"
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
                      {elem.content}
                    </div>
                  </div>
                </div>
              );
            })}
        </div>
      </div>

      <div id={valid_chat_css.bottom}>
        <div id={valid_chat_css.message_input}>
          <AddCircleIcon htmlColor="#B9BBBE" />
          <input
            type="text"
            onKeyDown={send_message}
            value={chat_message}
            onChange={(e) => setchat_message(e.target.value)}
            placeholder={`Message #${channel_name}`}
          />
        </div>
      </div>
    </div>
  );
}

export default Valid_chat;
