/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from "react";
import SearchIcon from "@mui/icons-material/Search";
import main_dashboardcss from "./mainDashboard.module.css";
import ChatBubbleIcon from "@mui/icons-material/ChatBubble";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import OverlayTrigger from "react-bootstrap/OverlayTrigger";
import Tooltip from "react-bootstrap/Tooltip";
import { useDispatch, useSelector } from "react-redux";
import DoneIcon from "@mui/icons-material/Done";
import CloseIcon from "@mui/icons-material/Close";
import PersonRemoveIcon from "@mui/icons-material/PersonRemove";
import { update_options } from "../../../../Redux/options_slice";
import socket from "../../../Socket/Socket";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import BlockIcon from "@mui/icons-material/Block";
import { useNavigate } from "react-router-dom";
import config from "../../../../config/config";
import { online, friends_2, pending, blocked } from "../../../../images/index";

function MainDashboard({ userRelations }) {
  const dispatch = useDispatch();
  const option_check = useSelector((state) => state.selected_option.value);
  const option_name_check = useSelector(
    (state) => state.selected_option.option_name
  );
  const option_status = useSelector((state) => state.selected_option.status);
  const option_text = useSelector((state) => state.selected_option.text);

  // User details from redux
  const username = useSelector((state) => state.user_info.username);
  const profile_pic = useSelector((state) => state.user_info.profile_pic);
  const id = useSelector((state) => state.user_info.id);

  const [button_state, setbutton_state] = useState(true);
  const [option_data, setoption_data] = useState([]);
  const [input, setinput] = useState("");
  const images_arr = [online, pending, blocked, friends_2];
  const [image, setImage] = useState(images_arr[0]);
  const [Alert, setAlert] = useState({ style: "none", message: "none" });
  const [isLoading, setIsLoading] = useState(false); // Loading state for the button

  // Menu state
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const open = Boolean(anchorEl);

  // Destructure userRelations properly
  const incoming_reqs = userRelations?.incoming_reqs || [];
  const outgoing_reqs = userRelations?.outgoing_reqs || [];
  const friends = userRelations?.friends || [];
  const blocked_users = userRelations?.blocked_users || [];
  const pending_reqs = [...incoming_reqs, ...outgoing_reqs];
  const url = config.API_BASE_URL;

  const navigate = useNavigate();

  // Function to start a direct message with a friend
  const startDM = (friendId) => {
    // Create the target URL for the direct message route
    const targetUrl = `/channels/@me/${friendId}`;

    // Navigate to the direct message route
    navigate(targetUrl);
  };

  useEffect(() => {
    if (option_check === 2) {
      setoption_data(pending_reqs);
    } else if (option_check === 1) {
      setoption_data(friends);
    } else if (option_check === 3) {
      setoption_data(blocked_users);
    } else if (option_check === 4) {
      setoption_data([]); // For add friend section
    } else {
      setoption_data([]); // For online section
    }
  }, [userRelations, option_check]);

  useEffect(() => {
    setImage(images_arr[option_check]);
  }, [option_check]);

  const buttonClicked = async (message, friend_data) => {
    // Handle Message button click
    if (message === "Message") {
      startDM(friend_data.id);
      return;
    }

    // Don't make API call for More button
    if (message === "More") {
      return;
    }

    const res = await fetch(`${url}/users/add-friend`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-auth-token": localStorage.getItem("token"),
      },
      body: JSON.stringify({
        friend_data: friend_data,
        message: message,
      }),
    });
    const data = await res.json();

    if (data.status === 200 || data.status === 404) {
      dispatch(update_options());
      if (data.status === 200) {
        socket.emit("req_accepted", id, friend_data.id, username, profile_pic);
      }
    }
  };

  // Menu handlers
  const handleMoreClick = (event, user) => {
    setAnchorEl(event.currentTarget);
    setSelectedUser(user);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedUser(null);
  };

  const handleMenuAction = async (action) => {
    if (!selectedUser) return;

    try {
      const res = await fetch(`${url}/users/${action}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-auth-token": localStorage.getItem("token"),
        },
        body: JSON.stringify({
          friend_id: selectedUser.id,
        }),
      });
      const data = await res.json();

      if (data.status === 200) {
        dispatch(update_options());
        handleMenuClose();
      }
    } catch (error) {
      console.error(`Error performing ${action}:`, error);
    }
  };

  function buttons(message, Icon, friend_data) {
    if (message === "More") {
      return (
        <div
          className={main_dashboardcss.item_3_comps_wrap}
          onClick={(e) => handleMoreClick(e, friend_data)}
        >
          <div className={main_dashboardcss.item_3_comps}>
            <OverlayTrigger placement="top" overlay={tooltips(message)}>
              <Icon />
            </OverlayTrigger>
          </div>
        </div>
      );
    }

    if (message === "Unblock") {
      return (
        <div
          className={main_dashboardcss.item_3_comps_wrap}
          onClick={() => {
            setSelectedUser(friend_data);
            handleMenuAction("unblock-user");
          }}
        >
          <div className={main_dashboardcss.item_3_comps}>
            <OverlayTrigger placement="top" overlay={tooltips(message)}>
              <Icon />
            </OverlayTrigger>
          </div>
        </div>
      );
    }

    return (
      <div
        className={main_dashboardcss.item_3_comps_wrap}
        onClick={() => {
          buttonClicked(message, friend_data);
        }}
      >
        <div className={main_dashboardcss.item_3_comps}>
          <OverlayTrigger placement="top" overlay={tooltips(message)}>
            <Icon />
          </OverlayTrigger>
        </div>
      </div>
    );
  }

  const addFriend = async (e) => {
    e.preventDefault();

    // Show Alert immediately after clicking the button
    setAlert({ style: "flex", message: "Sending friend request..." });
    setIsLoading(true); // Disable button until the request completes
    const res = await fetch(`${url}/users/add-friend`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-auth-token": localStorage.getItem("token"),
      },
      body: JSON.stringify({
        friend: input,
      }),
    });

    const data = await res.json();
    setAlert({ style: "flex", message: "Friend Request Sent" });
    setIsLoading(false); // Re-enable button after operation

    // Provide feedback based on response status
    if (
      data.status === 404 ||
      data.status === 201 ||
      data.status === 202 ||
      data.status === 200
    ) {
      setAlert({ style: "flex", message: data.message });

      if (data.status === 201 || data.status === 200) {
        dispatch(update_options());
        socket.emit("send_req", data.receiver_id, id, profile_pic, username);
      }
    } else if (data.status === 400) {
      setAlert({ style: "flex", message: data.message });
    }
  };

  useEffect(() => {
    if (input.length >= 1) {
      setbutton_state(false);
    } else {
      setbutton_state(true);
    }
  }, [input]);

  function handleInput(e) {
    setinput(e.target.value);
    setAlert({ ...Alert, style: "none" });
    let current_key = e.nativeEvent.data;
    let input_size = input.length;

    if (
      input[input_size - 1] === "#" &&
      /[0-9]/.test(current_key) === false &&
      current_key != null
    ) {
      setinput(input);
    } else if (
      (input[input_size - 5] === "#" &&
        /[a-zA-z0-9]/.test(current_key) === true &&
        current_key != null) ||
      (input[input_size - 5] === "#" &&
        /[^a-zA-z0-9]/.test(current_key) === true &&
        current_key != null)
    ) {
      setinput(input);
    }
  }

  const tooltips = (value, props) => (
    <Tooltip id="button-tooltip" {...props}>
      {value}
    </Tooltip>
  );

  return (
    <>
      {option_status === false ? (
        <>
          {option_check === 4 ? (
            <>
              <div className={main_dashboardcss.add_friend_wrap}>
                <div className={main_dashboardcss.add_friend}>
                  <div
                    id={main_dashboardcss.add_friend_1}
                    className={main_dashboardcss.add_friend_comps}
                  >
                    ADD FRIEND
                  </div>
                  <div
                    id={main_dashboardcss.add_friend_2}
                    className={main_dashboardcss.add_friend_comps}
                  >
                    You can add a friend with their Discord Tag. It's
                    cAsE-sEnSitIvE!
                  </div>
                  <div
                    id={main_dashboardcss.add_friend_3}
                    className={main_dashboardcss.add_friend_comps}
                  >
                    <input
                      onChange={handleInput}
                      value={input}
                      type="text"
                      placeholder="Enter a Username#0000"
                    />
                    <button
                      onClick={addFriend}
                      disabled={button_state || isLoading} // Disable when loading
                      id={main_dashboardcss.add_friend_3_button}
                    >
                      {isLoading ? "Sending..." : "Send Friend Request"}{" "}
                      {/* Button Text */}
                    </button>
                  </div>
                  <div
                    id={main_dashboardcss.friend_req_response}
                    style={{ display: Alert.style }}
                  >
                    {Alert.message}
                  </div>
                </div>
                <div className={main_dashboardcss.add_friend_image}>
                  <div className={main_dashboardcss.offline_image}>
                    <img src={image} alt="" />
                    {option_text}
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className={main_dashboardcss.main} style={{ display: "flex" }}>
              <div className={main_dashboardcss.offline_image}>
                <img src={image} alt="" />
                {option_text}
              </div>
            </div>
          )}
        </>
      ) : (
        <>
          <div id={main_dashboardcss.search_wrap}>
            <div id={main_dashboardcss.search}>
              <input type="text" placeholder="Search" />
              <div id={main_dashboardcss.search_icon}>
                <SearchIcon fontSize="medium"></SearchIcon>
              </div>
            </div>
          </div>

          <div id={main_dashboardcss.online_users_count_wrap}>
            <div id={main_dashboardcss.online_users_count}>
              {option_name_check}-{option_data.length}
            </div>
          </div>
          {option_data && option_data.length > 0 ? (
            option_data.map((elem) => {
              return (
                <div key={elem.id} id={main_dashboardcss.online_users_wrap}>
                  <div className={main_dashboardcss.online_users}>
                    <div
                      className={main_dashboardcss.online_comps}
                      id={main_dashboardcss.item_1_wrap}
                    >
                      <div id={main_dashboardcss.item_1}>
                        <img src={elem.profile_pic || profile_pic} alt="" />
                      </div>
                    </div>
                    <div className={main_dashboardcss.item_2_main}>
                      <div
                        className={main_dashboardcss.online_comps}
                        id={main_dashboardcss.item_2}
                      >
                        <div className={main_dashboardcss.item_2_comps}>
                          {elem.username}
                        </div>
                        <div
                          className={main_dashboardcss.item_2_comps}
                          id={main_dashboardcss.item_2_2}
                        >
                          {option_check === 3 ? "Blocked" : "Online"}
                        </div>
                      </div>
                      <div
                        className={main_dashboardcss.online_comps}
                        id={main_dashboardcss.item_2_3}
                      >
                        <div
                          className={main_dashboardcss.item_2_comps}
                          id={main_dashboardcss.item_2_3_1}
                        >
                          #{elem.tag}
                        </div>
                      </div>
                    </div>
                    <div
                      className={main_dashboardcss.online_comps}
                      id={main_dashboardcss.item_3}
                    >
                      {option_check === 2 ? (
                        <>
                          {elem.status === "incoming" ? (
                            <>
                              {buttons("Accept", DoneIcon, elem)}
                              {buttons("Ignore", CloseIcon, elem)}
                            </>
                          ) : (
                            <>{buttons("Cancel", CloseIcon, elem)}</>
                          )}
                        </>
                      ) : (
                        <>
                          {option_check === 3 ? (
                            <>{buttons("Unblock", PersonRemoveIcon, elem)}</>
                          ) : (
                            <>
                              {buttons("Message", ChatBubbleIcon, elem)}
                              {buttons("More", MoreVertIcon, elem)}
                            </>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className={main_dashboardcss.main} style={{ display: "flex" }}>
              <div className={main_dashboardcss.offline_image}>
                <img src={image} alt="" />
                {option_text}
              </div>
            </div>
          )}

          {/* More Menu */}
          <Menu
            anchorEl={anchorEl}
            open={open}
            onClose={handleMenuClose}
            PaperProps={{
              sx: {
                backgroundColor: "#36393f",
                color: "#fff",
                "& .MuiMenuItem-root:hover": {
                  backgroundColor: "#202225",
                },
              },
            }}
          >
            <MenuItem onClick={() => handleMenuAction("remove-friend")}>
              <ListItemIcon>
                <PersonRemoveIcon sx={{ color: "#fff" }} />
              </ListItemIcon>
              <ListItemText>Remove Friend</ListItemText>
            </MenuItem>
            <MenuItem onClick={() => handleMenuAction("block-user")}>
              <ListItemIcon>
                <BlockIcon sx={{ color: "#fff" }} />
              </ListItemIcon>
              <ListItemText>Block User</ListItemText>
            </MenuItem>
          </Menu>
        </>
      )}
    </>
  );
}

export default MainDashboard;
