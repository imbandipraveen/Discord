import React, { useState, useEffect } from "react";
import navbar_chat_css from "./navbar2_dashboardcss.module.css";
import person_icon from "../../../images/friends.svg";
import AddIcon from "@mui/icons-material/Add";
import OverlayTrigger from "react-bootstrap/OverlayTrigger";
import Tooltip from "react-bootstrap/Tooltip";
import offline_icon from "../../../images/offline_status.svg";
import { useSelector } from "react-redux";
import Modal from "react-bootstrap/Modal";
import CloseIcon from "@mui/icons-material/Close";
import { useNavigate, useParams } from "react-router-dom";
import SearchIcon from "@mui/icons-material/Search";
import config from "../../../config/config";

function NavbarDashboard() {
  const profile_pic = useSelector((state) => state.user_info.profile_pic);
  const userId = useSelector((state) => state.user_info.id);
  const userInfo = useSelector((state) => state.user_info);
  const navigate = useNavigate();
  const { friend_id } = useParams();

  const [show, setShow] = useState(false);
  const [friends, setFriends] = useState([]);
  const [recentFriends, setRecentFriends] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingConversations, setLoadingConversations] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  // Debug log to see what's in the Redux store
  useEffect(() => {
    // Check if friends are directly in userInfo
    if (userInfo && userInfo.friends && userInfo.friends.length > 0) {
    }
  }, [userInfo]);

  useEffect(() => {
    if (userId) {
      fetchFriends();
    }
  }, [userId]);

  const handleClose = () => setShow(false);
  const handleShow = () => {
    setShow(true);
    fetchFriends();
  };

  const fetchFriends = async () => {
    setLoading(true);
    setLoadingConversations(true);
    try {
      const url = config.API_BASE_URL;

      // Fetch user relations from the API
      const response = await fetch(`${url}/users/relations`, {
        headers: {
          "x-auth-token": localStorage.getItem("token"),
        },
      });

      const data = await response.json();

      if (data && data.friends) {
        setFriends(data.friends);
        // Use friends_with_messages for recent conversations (DM column)
        setRecentFriends(data.friends_with_messages || []);
      } else {
        setFriends([]);
        setRecentFriends([]);
      }
    } catch (error) {
      console.error("Error fetching friends:", error);
      setFriends([]);
      setRecentFriends([]);
    } finally {
      setLoading(false);
      setLoadingConversations(false);
    }
  };

  const renderTooltip = (props) => (
    <Tooltip id="button-tooltip" {...props}>
      Create DM
    </Tooltip>
  );

  const startDM = (friendId) => {
    handleClose();

    // Create the target URL - this is very important!
    const targetUrl = `/channels/@me/${friendId}`;

    // Navigate to the direct message route
    navigate(targetUrl);
  };

  // Format timestamp for display
  const formatTimestamp = (timestamp) => {
    if (!timestamp) return "";

    const date = new Date(timestamp);
    const now = new Date();
    const diffInDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));

    if (diffInDays === 0) {
      // Today - show time
      return date.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
    } else if (diffInDays === 1) {
      // Yesterday
      return "Yesterday";
    } else if (diffInDays < 7) {
      // Within a week - show day name
      return date.toLocaleDateString([], { weekday: "short" });
    } else {
      // Older - show date
      return date.toLocaleDateString([], { month: "short", day: "numeric" });
    }
  };

  const handleSearch = (e) => {
    const query = e.target.value.toLowerCase();
    setSearchQuery(query);
    setIsSearching(true);

    if (query.trim() === "") {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    // Filter friends based on username or tag
    const filteredFriends = friends.filter(
      (friend) =>
        friend.username.toLowerCase().includes(query) ||
        friend.tag.toLowerCase().includes(query)
    );

    setSearchResults(filteredFriends);
    setIsSearching(false);
  };

  const startDMWithUser = (userId) => {
    setSearchQuery("");
    setSearchResults([]);
    startDM(userId);
  };

  return (
    <div>
      <div className={navbar_chat_css.search_wrap}>
        <div className={navbar_chat_css.search}>
          <SearchIcon style={{ marginRight: "8px", color: "#72767d" }} />
          <input
            type="text"
            placeholder="Find or start a conversation"
            value={searchQuery}
            onChange={handleSearch}
            className={navbar_chat_css.search_input}
          />
        </div>
        {searchQuery && (
          <div className={navbar_chat_css.search_results}>
            {isSearching ? (
              <div className={navbar_chat_css.search_loading}>Searching...</div>
            ) : searchResults.length > 0 ? (
              searchResults.map((user) => (
                <div
                  key={user.id}
                  className={navbar_chat_css.search_result_item}
                  onClick={() => startDMWithUser(user.id)}
                >
                  <img
                    src={
                      user.profile_pic ||
                      "https://cdn.discordapp.com/embed/avatars/0.png"
                    }
                    alt={user.username}
                    className={navbar_chat_css.search_result_avatar}
                  />
                  <div className={navbar_chat_css.search_result_info}>
                    <div className={navbar_chat_css.search_result_name}>
                      {user.username}
                    </div>
                    <div className={navbar_chat_css.search_result_tag}>
                      #{user.tag}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className={navbar_chat_css.no_results}>No users found</div>
            )}
          </div>
        )}
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

      {/* Recent Conversations */}
      <div className={navbar_chat_css.recent_conversations}>
        {loadingConversations ? (
          <div className={navbar_chat_css.loading_indicator}>
            <span>Loading conversations...</span>
          </div>
        ) : recentFriends.length > 0 ? (
          recentFriends.map((friend) => (
            <div
              key={friend.id}
              className={`${navbar_chat_css.conversation_item} ${
                friend_id === friend.id ? navbar_chat_css.active : ""
              }`}
              onClick={() => startDM(friend.id)}
            >
              <div className={navbar_chat_css.conversation_avatar}>
                <img
                  src={
                    friend.profile_pic ||
                    "https://cdn.discordapp.com/embed/avatars/0.png"
                  }
                  alt={friend.username}
                />
                <div className={navbar_chat_css.online_status}>
                  <img
                    src={offline_icon}
                    className={navbar_chat_css.offline_icon}
                    alt=""
                  />
                </div>
              </div>
              <div className={navbar_chat_css.conversation_info}>
                <div className={navbar_chat_css.conversation_name}>
                  {friend.username}
                </div>
                {(friend.last_message || friend.last_message_timestamp) && (
                  <div className={navbar_chat_css.conversation_last_message}>
                    {friend.last_message
                      ? friend.last_message.length > 20
                        ? friend.last_message.substring(0, 20) + "..."
                        : friend.last_message
                      : ""}
                    {friend.last_message_timestamp && (
                      <span className={navbar_chat_css.timestamp}>
                        • {formatTimestamp(friend.last_message_timestamp)}
                      </span>
                    )}
                  </div>
                )}
              </div>
              {friend.unread_count > 0 && (
                <div className={navbar_chat_css.unread_badge}></div>
              )}
            </div>
          ))
        ) : (
          <div className={navbar_chat_css.no_conversations}>
            <span>No message history found</span>
            <div className={navbar_chat_css.no_chat_hint}>
              Start a conversation by clicking the + button
            </div>
          </div>
        )}
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

export default NavbarDashboard;
