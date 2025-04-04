import React from "react";
import topnavcss from "./top_nav.module.css";
import TopnavChat from "../chat_components/topnav_chat/TopnavChat";
import TopnavDashboard from "../dashboard/dashboard_components/top_nav_dashboard/TopnavDashboard";
import { useParams } from "react-router-dom";
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
