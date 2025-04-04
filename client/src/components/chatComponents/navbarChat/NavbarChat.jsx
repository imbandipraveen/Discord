import React from "react";
import navbar2_chatcss from "./navbarChat.module.css";
import { useSelector } from "react-redux";
import ValidNavbar from "../navbar_2_chat_valid/NavbarChatValid";
import Loading from "../../pages/Loading";

function NavbarChat() {
  // redux value to check if user is in the particular server or not
  const server_exists = useSelector(
    (state) => state.current_page.server_exists
  );

  return (
    <div className={navbar2_chatcss.main}>
      {server_exists == null ? (
        <Loading></Loading>
      ) : server_exists === false ? (
        <div></div>
      ) : (
        <ValidNavbar></ValidNavbar>
      )}
    </div>
  );
}

export default NavbarChat;
