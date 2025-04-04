import React from "react";
import rightcss from "../right_nav/right_nav.module.css";
import { useParams } from "react-router-dom";
import Rightnav_chat from "../chat_components/rightnav_chat/RightnavChat";
import Rightnav_dashboard from "../dashboard_components/rightnav_dashboard/RightnavDashboard";

function Rightnav() {
  const { server_id } = useParams();
  return (
    <div id={rightcss.main_wrap}>
      <div id={rightcss.main}>
        <>
          {server_id === "@me" || server_id === undefined ? (
            <Rightnav_dashboard></Rightnav_dashboard>
          ) : (
            <Rightnav_chat></Rightnav_chat>
          )}
        </>
      </div>
    </div>
  );
}

export default Rightnav;
