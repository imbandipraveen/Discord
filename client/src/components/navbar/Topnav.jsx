import React from "react";
import topnavcss from "./css/topNav.module.css";
import TopnavChat from "../chat_components/topnav_chat/TopnavChat";
import { useParams } from "react-router-dom";
import TopnavDashboard from "../dashboard/TopnavDashboard";
function Topnav({ buttonStatus, setHideMembers }) {
  const { server_id } = useParams();

  return (
    <div id={topnavcss.main}>
      {server_id === "@me" ? (
        <TopnavDashboard buttonStatus={buttonStatus}></TopnavDashboard>
      ) : (
        <TopnavChat setHideMembers={setHideMembers} />
      )}
    </div>
  );
}

export default Topnav;
