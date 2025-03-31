import React from "react";
import topnavcss from "../top_nav/top_nav.module.css";
import Topnav_chat from "../chat_components/topnav_chat/Topnav_chat";
import Topnav_dashboard from "../dashboard_components/top_nav_dashboard/Topnav_dashboard";
import { useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import { OverlayTrigger } from "react-bootstrap";
import { Tooltip } from "react-bootstrap";

function Top_nav({ button_status, setHideMembers }) {
  const page_check = useSelector((state) => state.current_page.is_dashboard);
  const { server_id } = useParams();

  const tooltips = (value, props) => (
    <Tooltip id="button-tooltip" {...props}>
      {value}
    </Tooltip>
  );

  function buttons(message, Icon) {
    return (
      <div
        key={message}
        className={topnavcss.right_part_icons}
        onClick={() => {
          switch (message) {
            case "Logout":
              localStorage.clear();
              window.location.reload();
              break;
            case "Hide Member List":
              setHideMembers(true);
              break;
            case "Notification Settings":
              // TODO: Implement notification settings
              console.log("Notification settings clicked");
              break;
            case "Pinned Messages":
              // TODO: Implement pinned messages
              console.log("Pinned messages clicked");
              break;
            case "Inbox":
              // TODO: Implement inbox
              console.log("Inbox clicked");
              break;
            default:
              console.log(`${message} clicked`);
          }
        }}
      >
        <OverlayTrigger placement="bottom" overlay={tooltips(message)}>
          {<Icon />}
        </OverlayTrigger>
      </div>
    );
  }

  return (
    <div id={topnavcss.main}>
      {server_id == "@me" ? (
        <Topnav_dashboard button_status={button_status}></Topnav_dashboard>
      ) : (
        <Topnav_chat setHideMembers={setHideMembers}></Topnav_chat>
      )}
    </div>
  );
}

export default Top_nav;
