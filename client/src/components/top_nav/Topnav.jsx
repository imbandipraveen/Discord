import React from "react";
import topnavcss from "../top_nav/top_nav.module.css";
import TopnavChat from "../chat_components/topnav_chat/TopnavChat";
import TopnavDashboard from "../dashboard_components/top_nav_dashboard/TopnavDashboard";
import { useParams } from "react-router-dom";
import { OverlayTrigger } from "react-bootstrap";
import { Tooltip } from "react-bootstrap";
import LogoutIcon from "@mui/icons-material/Logout";
import GroupIcon from "@mui/icons-material/Group";
function Topnav({ button_status, setHideMembers }) {
  const { server_id } = useParams();

  const tooltips = (value, props) => (
    <Tooltip id="button-tooltip" {...props}>
      {value}
    </Tooltip>
  );

  const buttons = (message, Icon) => {
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
              break;
            case "Pinned Messages":
              break;
            // TODO: Implement pinned messages
            case "Inbox":
              // TODO: Implement inbox
              break;
            default:
          }
        }}
      >
        <OverlayTrigger placement="bottom" overlay={tooltips(message)}>
          {<Icon />}
        </OverlayTrigger>
      </div>
    );
  };

  return (
    <div id={topnavcss.main}>
      {server_id === "@me" ? (
        <TopnavDashboard button_status={button_status}></TopnavDashboard>
      ) : (
        <>
          <TopnavChat setHideMembers={setHideMembers} />
          <div style={{ display: "flex", gap: "10px", marginRight: "16px" }}>
            {buttons("Logout", LogoutIcon)}
            {buttons("Hide Member List", GroupIcon)}
            {/* Add more buttons as needed */}
          </div>
        </>
      )}
    </div>
  );
}

export default Topnav;
