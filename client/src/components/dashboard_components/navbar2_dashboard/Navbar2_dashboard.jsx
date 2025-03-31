import React, { useState, useEffect } from "react";
import navbar_chat_css from "./navbar2_dashboardcss.module.css";
import person_icon from "../../../images/friends.svg";
import AddIcon from "@mui/icons-material/Add";
import OverlayTrigger from "react-bootstrap/OverlayTrigger";
import Tooltip from "react-bootstrap/Tooltip";
import offline_icon from "../../../images/offline_status.svg";
import { useSelector, useDispatch } from "react-redux";
import Modal from "react-bootstrap/Modal";
import CloseIcon from "@mui/icons-material/Close";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function Navbar_2_dashboard() {
  const profile_pic = useSelector((state) => state.user_info.profile_pic);
  const userId = useSelector((state) => state.user_info.id);
  const token = useSelector((state) => state.user_info.token);
  const userInfo = useSelector((state) => state.user_info);
  const navigate = useNavigate();

  const [show, setShow] = useState(false);
  const [friends, setFriends] = useState([]);
  const [loading, setLoading] = useState(false);

  // Debug log to see what's in the Redux store
  useEffect(() => {
    console.log("User Info from Redux:", userInfo);
    // Check if friends are directly in userInfo
    if (userInfo && userInfo.friends && userInfo.friends.length > 0) {
      console.log("Found friends directly in userInfo:", userInfo.friends);
    }
  }, [userInfo]);

  const handleClose = () => setShow(false);
  const handleShow = () => {
    setShow(true);
    fetchFriends();
  };

  const fetchFriends = async () => {
    setLoading(true);
    try {
      console.log("Fetching friends...");
      const url = process.env.REACT_APP_URL;

      // Fetch user relations from the API
      const response = await fetch(`${url}/users/relations`, {
        headers: {
          "x-auth-token": localStorage.getItem("token"),
        },
      });

      const data = await response.json();
      console.log("User relations response:", data);

      if (data && data.friends) {
        console.log("Setting friends from API:", data.friends);
        setFriends(data.friends);
      } else {
        console.log("No friends found in response");
        setFriends([]);
      }
    } catch (error) {
      console.error("Error fetching friends:", error);
      setFriends([]);
    } finally {
      setLoading(false);
    }
  };

  const renderTooltip = (props) => (
    <Tooltip id="button-tooltip" {...props}>
      Create DM
    </Tooltip>
  );

  const startDM = (friendId) => {
    handleClose();
    navigate(`/channels/@me/${friendId}`);
  };

  return (
    <div>
      <div className={navbar_chat_css.search_wrap}>
        <div className={navbar_chat_css.search}>
          Find or start a conversation
        </div>
      </div>
      <div className={navbar_chat_css.friends_wrap}>
        <div className={navbar_chat_css.friends}>
          <img
            className={navbar_chat_css.friends_icon}
            src={person_icon}
            alt=""
          />
          Friends
        </div>
      </div>
      <div className={navbar_chat_css.heading}>
        <div
          className={navbar_chat_css.heading_components}
          id={navbar_chat_css.text}
        >
          DIRECT MESSAGES
        </div>
        <div
          className={navbar_chat_css.heading_components}
          id={navbar_chat_css.plus}
        >
          <OverlayTrigger placement="top" overlay={renderTooltip}>
            <AddIcon
              fontSize="small"
              onClick={handleShow}
              style={{ cursor: "pointer" }}
            />
          </OverlayTrigger>
        </div>
      </div>

      <Modal show={show} onHide={handleClose} centered>
        <Modal.Body>
          <div className={navbar_chat_css.new_server}>
            <div className={navbar_chat_css.server_close_button}>
              <CloseIcon
                htmlColor="#A7ABB0"
                onClick={handleClose}
                fontSize="large"
              />
            </div>
            <div id={navbar_chat_css.server_heading}>Create DM</div>
            <div id={navbar_chat_css.server_sub_heading}>
              Select a friend to start a conversation
            </div>
            <div className={navbar_chat_css.friend_details_wrap}>
              {loading ? (
                <div
                  className={navbar_chat_css.name}
                  style={{ textAlign: "center", padding: "20px" }}
                >
                  Loading friends...
                </div>
              ) : friends && friends.length > 0 ? (
                friends.map((friend) => (
                  <div
                    key={friend.id}
                    className={navbar_chat_css.friend_details}
                    onClick={() => startDM(friend.id)}
                  >
                    <div
                      className={navbar_chat_css.friend_details_comps}
                      id={navbar_chat_css.profile_wrap}
                    >
                      <div className={navbar_chat_css.profile_pic}>
                        <img src={friend.profile_pic || profile_pic} alt="" />
                        <div className={navbar_chat_css.online_status}>
                          <img
                            src={offline_icon}
                            className={navbar_chat_css.offline_icon}
                            alt=""
                          />
                        </div>
                      </div>
                    </div>
                    <div className={navbar_chat_css.name}>
                      {friend.username}
                    </div>
                  </div>
                ))
              ) : (
                <div
                  className={navbar_chat_css.name}
                  style={{ textAlign: "center", padding: "20px" }}
                >
                  No friends found
                </div>
              )}
            </div>
          </div>
        </Modal.Body>
      </Modal>
    </div>
  );
}

export default Navbar_2_dashboard;
