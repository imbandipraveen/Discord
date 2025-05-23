import React, { useEffect, useRef, useState } from "react";
import rightnav_chatcss from "./rightnavChat.module.css";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import { server_members } from "../../../redux/currentPage";
import config from "../../../config/config";

function RightnavChat() {
  const allUsers = useSelector((state) => state.current_page.members);
  const currentUserId = useSelector((state) => state.user_info.id);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [showRoles, setShowRoles] = useState("");
  const serverId = useParams().server_id;
  const positionRef = useRef(null);
  const dispatch = useDispatch();
  useEffect(() => {
    allUsers.forEach((user) => {
      if (user.user_id === currentUserId) {
        if (user.user_role === "author" || user.user_role === "admin") {
          setIsAuthorized(true);
        }
      }
    });
  }, [allUsers, currentUserId]);
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (positionRef.current && !positionRef.current.contains(event.target)) {
        setShowRoles("");
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);
  // /api/servers/changeRole
  const handleEdit = async (userId, operation) => {
    try {
      let server = await fetch(`${config.API_BASE_URL}/servers/remove`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user_id: userId,
          server_id: serverId,
        }),
      });
      if (server.status === 200) {
        let updatedData = allUsers.filter((user) => {
          if (user.user_id !== userId) {
            return user;
          }
          return "";
        });
        dispatch(server_members(updatedData));
      }
    } catch (err) {
      console.log(err);
    }
  };
  const handleChangeRole = async (userId) => {
    try {
      let server = await fetch(`${config.API_BASE_URL}/servers/changeRole`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user_id: userId,
          server_id: serverId,
        }),
      });
      if (server.status === 200) {
        let updatedData = allUsers.map((user) => {
          if (user.user_id === userId) {
            return {
              ...user,
              user_role: user.user_role === "admin" ? "member" : "admin",
            };
          }
          return user;
        });

        console.log(updatedData);
        dispatch(server_members(updatedData));
      }
    } catch (err) {
      console.log(err);
    }
  };
  return (
    <div className={rightnav_chatcss.main_wrap}>
      <div className={rightnav_chatcss.main}>
        <div className={rightnav_chatcss.members_length}>
          ALL MEMBERS - {allUsers.length}
        </div>
        <div className={rightnav_chatcss.members}>
          {allUsers.map((elem, key) => {
            return (
              <div
                key={key}
                className={rightnav_chatcss.individual_member}
                onClick={() => {
                  setShowRoles(elem.user_id);
                }}
              >
                {console.log(elem)}
                {showRoles === elem.user_id &&
                  isAuthorized &&
                  elem.user_id !== currentUserId &&
                  elem.user_role !== "author" && (
                    <div
                      style={{
                        position: "absolute",
                        right: "310px",
                        border: "1px solid gray",
                        padding: "10px",
                        boxShadow: "3px 3px 10px rgba(55, 57, 62, 0.5)",
                        borderRadius: "10px",
                        background: "#2f3136",
                        color: "#fff",
                        maxWidth: "250px",
                      }}
                      ref={positionRef}
                    >
                      <div
                        style={{
                          padding: "8px",
                          cursor: "pointer",
                          transition: "background 0.3s ease",
                        }}
                        onMouseEnter={(e) =>
                          (e.target.style.background = "#444")
                        }
                        onMouseLeave={(e) =>
                          (e.target.style.background = "transparent")
                        }
                        onClick={() => {
                          handleEdit(elem.user_id, "remove");
                        }}
                      >
                        Remove {elem.user_name}
                      </div>
                      <div
                        style={{
                          padding: "8px",
                          cursor: "pointer",
                          transition: "background 0.3s ease",
                        }}
                        onMouseEnter={(e) =>
                          (e.target.style.background = "#444")
                        }
                        onMouseLeave={(e) =>
                          (e.target.style.background = "transparent")
                        }
                        onClick={() => {
                          handleChangeRole(elem.user_id);
                        }}
                      >
                        {elem.user_role === "admin"
                          ? "Remove admin role"
                          : "Make admin"}
                      </div>
                    </div>
                  )}

                <img src={elem.user_profile_pic} alt="" />
                <div
                  style={{
                    color: `${elem.user_role === "admin" ? "red" : "white"}`,
                  }}
                >
                  {elem.user_name} {elem.user_role === "author" ? "👑" : ""}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default RightnavChat;
