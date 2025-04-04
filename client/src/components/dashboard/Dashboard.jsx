import React, { useEffect, useState } from "react";
import dashboardcss from "./css/dashboard.module.css";
import Navbar from "../navbar/Navbar";
import Navbar2 from "../navbar/Navbar2";
import Topnav from "../navbar/Topnav";
import Main from "../main/Main";
import Rightnav from "../navbar/Rightnav";
import jwt from "jwt-decode";
import { useParams, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  change_username,
  change_tag,
  option_profile_pic,
  option_user_id,
} from "../../Redux/user_creds_slice";
import { server_existence } from "../../Redux/current_page";
import DirectMessage from "../chatComponents/directMessage/DirectMessage";
import config from "../../config/config";

function Dashboard() {
  const [hideMembers, setHideMembers] = useState(false);
  const dispatch = useDispatch();
  const { server_id, friend_id } = useParams();
  const location = useLocation();

  // Check if this is a DM route
  const isDM = server_id === "@me" && friend_id;
  const isDMPath = location.pathname.includes("/@me/");

  const option_state = useSelector(
    (state) => state.selected_option.updated_options
  );
  const url = config.API_BASE_URL;
  const server_exists = useSelector(
    (state) => state.current_page.server_exists
  );

  let token1 = localStorage.getItem("token");
  let user_creds = jwt(token1);
  const { username, tag, profile_pic, id } = user_creds;
  const [userData, setUserData] = useState({
    incoming_reqs: "",
    outgoing_reqs: "",
    friends: "",
    servers: "",
    blocked_users: "",
    friends_with_messages: [],
  });
  const [status, setStatus] = useState({
    pending_status: false,
    online_status: false,
    all_friends_status: false,
    blocked_staus: false,
  });
  const [newRequest, setNewRequest] = useState(1);

  const newRequestReceived = (newRequest_value) => {
    setNewRequest(newRequest + newRequest_value);
  };

  // Always set a default grid layout
  const [gridLayout, setGridLayout] = useState("70px 250px auto auto 370px");

  useEffect(() => {
    userRelations();
  }, [newRequest, option_state]);

  useEffect(() => {
    // For DMs, always set server exists to true
    dispatch(server_existence(true));

    if (isDM || isDMPath) {
      // For DMs, use this layout
      setGridLayout("70px 250px auto auto 370px");
    } else if (server_id === "@me") {
      // For friends page
      setGridLayout("70px 250px auto auto 370px");
    } else if (server_exists === false) {
      // For invalid servers
      setGridLayout("70px 250px auto");
    } else {
      // For valid servers
      setGridLayout("70px 250px auto auto 300px");
    }
  }, [server_id, friend_id, server_exists, dispatch, isDM, isDMPath]);

  useEffect(() => {
    dispatch(change_username(username));
    dispatch(change_tag(tag));
    dispatch(option_profile_pic(profile_pic));
    dispatch(option_user_id(id));
  }, [username, tag, profile_pic, id, dispatch]);

  // this use effect will run once and after that it will run whenever there is some change in requests like accept or denied or something

  const userRelations = async () => {
    try {
      const res = await fetch(`${url}/users/relations`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "x-auth-token": localStorage.getItem("token"),
        },
      });

      const data = await res.json();
      const {
        incoming_reqs,
        outgoing_reqs,
        friends,
        servers,
        blocked_users,
        friends_with_messages,
      } = data;
      let pending = incoming_reqs.length + outgoing_reqs.length;
      let status_2 = {
        pending_status: false,
        online_status: false,
        all_friends_status: false,
        blocked_staus: false,
      };

      if (pending !== 0) {
        status_2 = { ...status_2, pending_status: true };
      } else {
        status_2 = { ...status_2, pending_status: false };
      }

      if (friends.length !== 0) {
        status_2 = { ...status_2, all_friends_status: true };
      } else {
        status_2 = { ...status_2, all_friends_status: false };
      }

      setStatus(status_2);
      setUserData({
        incoming_reqs: incoming_reqs,
        outgoing_reqs: outgoing_reqs,
        friends: friends,
        servers: servers,
        blocked_users: blocked_users,
        friends_with_messages: friends_with_messages || [],
      });
    } catch (error) {
      console.error("Error fetching user relations:", error);
    }
  };

  // For direct message route, override the main content
  if (isDM || isDMPath) {
    return (
      <div
        className={dashboardcss.main}
        style={{
          display: "grid",
          gridTemplateColumns: "70px 250px 1fr",
          height: "100vh",
          width: "100%",
          overflow: "hidden",
        }}
      >
        <div className={dashboardcss.components} id={dashboardcss.component_1}>
          <Navbar
            user_cred={{ username: username, user_servers: userData.servers }}
            newRequestReceived={newRequestReceived}
          />
        </div>
        <div className={dashboardcss.components} id={dashboardcss.component_2}>
          <Navbar2 />
        </div>
        <div
          className={dashboardcss.components}
          style={{
            position: "relative",
            backgroundColor: "#36393f",
            height: "100vh",
            overflow: "hidden",
          }}
        >
          <DirectMessage friendId={friend_id} />
        </div>
      </div>
    );
  }

  // Standard render for non-DM routes
  return (
    <div
      className={dashboardcss.main}
      style={{ gridTemplateColumns: gridLayout }}
    >
      <div className={dashboardcss.components} id={dashboardcss.component_1}>
        <Navbar
          user_cred={{ username: username, user_servers: userData.servers }}
          newRequestReceived={newRequestReceived}
        />
      </div>
      <div className={dashboardcss.components} id={dashboardcss.component_2}>
        <Navbar2 />
      </div>
      {server_exists === false && server_id !== "@me" && !isDM ? (
        <div
          style={{ gridArea: "1 / 3 / 6 / 6" }}
          className={dashboardcss.components}
          id={dashboardcss.component_4}
        >
          <Main
            userRelations={{
              incoming_reqs: userData.incoming_reqs,
              outgoing_reqs: userData.outgoing_reqs,
              friends: userData.friends,
              blocked_users: userData.blocked_users,
            }}
          />
        </div>
      ) : (
        <>
          <div
            className={dashboardcss.components}
            id={dashboardcss.component_3}
          >
            <Topnav
              buttonStatus={{
                pending: status.pending_status,
                all_friends: status.all_friends_status,
              }}
              setHideMembers={() => setHideMembers(!hideMembers)}
            />
          </div>
          <div
            className={dashboardcss.components}
            id={dashboardcss.component_4}
          >
            <Main
              userRelations={{
                incoming_reqs: userData.incoming_reqs,
                outgoing_reqs: userData.outgoing_reqs,
                friends: userData.friends,
                blocked_users: userData.blocked_users,
              }}
            />
          </div>
          <div
            className={dashboardcss.components}
            id={dashboardcss.component_5}
          >
            {!hideMembers ? (
              <Rightnav />
            ) : (
              <div style={{ backgroundColor: "#36393f", height: "100%" }}></div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

export default Dashboard;
