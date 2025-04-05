import React, { useState } from "react";
import topNavDashboardCss from "./css/topNavDashboard.module.css";
import friends_icon from "../../images/friends.svg";
import InboxIcon from "@mui/icons-material/Inbox";
import ChatBubbleIcon from "@mui/icons-material/ChatBubble";
import OverlayTrigger from "react-bootstrap/OverlayTrigger";
import Tooltip from "react-bootstrap/Tooltip";
import { useDispatch } from "react-redux";
import {
  change_option,
  change_option_name,
  option_status,
  option_text,
} from "../../redux/optionsSlice";
import LogoutIcon from "@mui/icons-material/Logout";

function TopnavDashboard({ buttonStatus }) {
  const { pending, all_friends } = buttonStatus;
  const dispatch = useDispatch();
  const [selectedOption, setSelectedOption] = useState("");

  function changeOptionValue(option_number, option_name, status, text) {
    dispatch(change_option(option_number));
    dispatch(change_option_name(option_name));
    dispatch(option_status(status));
    dispatch(option_text(text));
  }

  function buttons(message, Icon) {
    return (
      <div
        className={topNavDashboardCss.right_part_icons}
        onClick={() => {
          if (message === "Logout") {
            localStorage.clear();
            window.location.reload();
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
      <div
        className={topNavDashboardCss.top_nav_comps}
        id={topNavDashboardCss.left_part_wrap}
      >
        <div id={topNavDashboardCss.left_part}>
          <img
            className={topNavDashboardCss.top_nav_images}
            src={friends_icon}
            alt=""
          />
          Friends
        </div>
      </div>
      <div
        className={topNavDashboardCss.right_nav_comps}
        id={topNavDashboardCss.middle_part}
      >
        <div
          className={topNavDashboardCss.middle_part_comps}
          id={topNavDashboardCss.middle_part_item_1}
          style={{
            backgroundColor: `${selectedOption === "online" ? "#4b4d52" : ""}`,
          }}
          onClick={() => {
            changeOptionValue(
              0,
              "ONLINE",
              false,
              "No one's around to play with Wumpus."
            );
            setSelectedOption("online");
          }}
        >
          Online
        </div>
        <div
          className={topNavDashboardCss.middle_part_comps}
          id={topNavDashboardCss.middle_part_item_2}
          style={{
            backgroundColor: `${selectedOption === "all" ? "#4b4d52" : ""}`,
          }}
          onClick={() => {
            changeOptionValue(
              1,
              "ALL FRIENDS",
              all_friends,
              "Wumpus is waiting on friends. You don't have to, though!"
            );
            setSelectedOption("all");
          }}
        >
          All
        </div>
        <div
          className={topNavDashboardCss.middle_part_comps}
          id={topNavDashboardCss.middle_part_item_3}
          style={{
            backgroundColor: `${selectedOption === "pending" ? "#4b4d52" : ""}`,
          }}
          onClick={() => {
            changeOptionValue(
              2,
              "PENDING",
              true,
              "There are no pending friend requests. Here's Wumpus for now."
            );
            setSelectedOption("pending");
          }}
        >
          Pending
        </div>
        <div
          className={topNavDashboardCss.middle_part_comps}
          id={topNavDashboardCss.middle_part_item_4}
          style={{
            backgroundColor: `${selectedOption === "blocked" ? "#4b4d52" : ""}`,
          }}
          onClick={() => {
            changeOptionValue(
              3,
              "BLOCKED",
              true,
              "You can't unblock the Wumpus."
            );
            setSelectedOption("blocked");
          }}
        >
          Blocked
        </div>
        <div
          className={topNavDashboardCss.middle_part_comps}
          id={topNavDashboardCss.middle_part_item_5}
          onClick={() => {
            changeOptionValue(
              4,
              "ADD FRIENDS",
              false,
              "Wumpus is waiting on friends. You don't have to, though!"
            );
          }}
        >
          Add Friend
        </div>
      </div>
      <div
        className={topNavDashboardCss.top_nav_comps}
        id={topNavDashboardCss.right_part}
      >
        {buttons("New Group DM", ChatBubbleIcon)}
        {buttons("Inbox", InboxIcon)}
        {buttons("Logout", LogoutIcon)}
      </div>
    </>
  );
}

export default TopnavDashboard;
