import React from "react";
import { useSelector } from "react-redux";
import Loading from "../../pages/Loading";
import InvalidChat from "../invalid_main_chat/InvalidChat";
import ValidChat from "../valid_main_chat/ValidChat";

function MainChat() {
  // redux value to check if user is in the particular server or not
  const server_exists = useSelector(
    (state) => state.current_page.server_exists
  );

  return (
    <>
      {server_exists == null ? (
        <Loading></Loading>
      ) : server_exists === false ? (
        <InvalidChat></InvalidChat>
      ) : (
        <ValidChat></ValidChat>
      )}
    </>
  );
}

export default MainChat;
