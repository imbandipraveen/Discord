import React from "react";
import topnav_chatcss from "./topnavChat.module.css";
import TagIcon from "@mui/icons-material/Tag";
import NotificationsIcon from "@mui/icons-material/Notifications";
import PushPinIcon from "@mui/icons-material/PushPin";
import PeopleAltIcon from "@mui/icons-material/PeopleAlt";
import InboxIcon from "@mui/icons-material/Inbox";
import OverlayTrigger from "react-bootstrap/OverlayTrigger";
import Tooltip from "react-bootstrap/Tooltip";
import { useSelector } from "react-redux";
import LogoutIcon from "@mui/icons-material/Logout";
import { useNavigate } from "react-router-dom";

function TopnavChat({ setHideMembers }) {
  const channel_name = useSelector((state) => state.current_page.page_name);
  const navigate = useNavigate();
  function buttons(message, Icon) {
    return (
      <div
        key={message}
        className={topnav_chatcss.right_comps}
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
              // TODO: Implement pinned messages
              break;
            case "Inbox":
              navigate("/channels/@me");
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
  }

  const tooltips = (value, props) => (
    <Tooltip id="button-tooltip" {...props}>
      {value}
    </Tooltip>
  );
  return (
    <>
      <div className={topnav_chatcss.main_wrap}>
        <div id={topnav_chatcss.left}>
          <TagIcon></TagIcon>
          <div id={topnav_chatcss.channel_name}>{channel_name}</div>
        </div>
        <div id={topnav_chatcss.right}>
          {buttons("Notification Settings", NotificationsIcon)}
          {buttons("Pinned Messages", PushPinIcon)}
          {buttons("Hide Member List", PeopleAltIcon)}
          <input placeholder="Search" type="text" />
          {buttons("Inbox", InboxIcon)}
          {buttons("Logout", LogoutIcon)}
        </div>
      </div>
    </>
  );
}

export default TopnavChat;
