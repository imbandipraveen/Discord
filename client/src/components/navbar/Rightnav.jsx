import React from "react";
import rightcss from "./css/rightNav.module.css";
import { useParams } from "react-router-dom";
import RightnavChat from "../chat_components/rightnav_chat/RightnavChat";
import RightnavDashboard from "../dashboard/RightnavDashboard";

function Rightnav() {
  const { server_id } = useParams();
  return (
    <div id={rightcss.main_wrap}>
      <div id={rightcss.main}>
        <>
          {server_id === "@me" || server_id === undefined ? (
            <RightnavDashboard></RightnavDashboard>
          ) : (
            <RightnavChat></RightnavChat>
          )}
        </>
      </div>
    </div>
  );
}

export default Rightnav;
