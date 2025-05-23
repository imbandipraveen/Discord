import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import MainDashboard from "../dashboard/MainDashboard";
import MainChat from "../chatComponents/mainChat/MainChat";
import DirectMessage from "../chatComponents/directMessage/DirectMessage";
import socket from "../socket/Socket";
import { update_options } from "../../redux/optionsSlice";
import { useDispatch, useSelector } from "react-redux";
import maincss from "./main.module.css";
// import main from "./main.module.css"
import CloseIcon from "@mui/icons-material/Close";
import discord_logo from "../../images/discord_logo_3.png";

function Main() {
  const dispatch = useDispatch();
  const userInfo = useSelector((state) => state.user_info);
  const id = userInfo.id;
  const [req_popup, setreq_popup] = useState({ state: "none", value: false });
  const [req_popup_data, setreq_popup_data] = useState({
    profile_pic: "",
    name: "",
    notif_message: "",
    id: null,
  });

  const { server_id, friend_id } = useParams();
  const isDM = server_id === "@me" && friend_id;
  useEffect(() => {
    if (id !== 0) {
      socket.emit("get_userid", id);
    }
  }, [id]);

  useEffect(() => {
    if (req_popup_data.id != null) {
      dispatch(update_options());
      setreq_popup({ ...req_popup, value: false });
    }
  }, [req_popup_data.id, dispatch]);

  useEffect(() => {
    const receiveReqHandler = (message) => {
      const { sender_name, sender_profile_pic, sender_id } = message;
      setreq_popup_data({
        name: sender_name,
        profile_pic: sender_profile_pic,
        id: sender_id,
        notif_message: "Sent you a friend Request",
      });
      setreq_popup({ state: "flex", value: true });
    };

    const reqAcceptedHandler = (message) => {
      const { sender_id, friend_profile_pic, friend_name } = message;
      setreq_popup_data({
        name: friend_name,
        profile_pic: friend_profile_pic,
        id: sender_id,
        notif_message: "Accepted your friend Request",
      });
      setreq_popup({ state: "flex", value: true });
    };

    socket.on("recieve_req", receiveReqHandler);
    socket.on("req_accepted_notif", reqAcceptedHandler);

    return () => {
      socket.off("recieve_req", receiveReqHandler);
      socket.off("req_accepted_notif", reqAcceptedHandler);
    };
  }, []);

  // Directly check if the URL contains @me/ to determine if we're in a DM
  const pathContainsDM =
    window.location.pathname.includes("/@me/") && friend_id;

  return (
    <div className={maincss.main}>
      {/* Force render the DirectMessage component when in a DM route */}
      {pathContainsDM ? (
        <div style={{ width: "100%", height: "100%" }}>
          <DirectMessage friendId={friend_id} />
        </div>
      ) : isDM ? (
        <div style={{ width: "100%", height: "100%" }}>
          <DirectMessage friendId={friend_id} />
        </div>
      ) : server_id === "@me" || server_id === undefined ? (
        <MainDashboard />
      ) : (
        <MainChat />
      )}

      <div
        className={maincss.notification}
        style={{ display: req_popup.state }}
      >
        <div className={maincss.notif_top}>
          <div className={maincss.notif_top_left}>
            <img src={discord_logo} alt="" /> Discord
          </div>
          <div className={maincss.notif_top_right}>
            <CloseIcon
              onClick={() => {
                setreq_popup({ ...req_popup, state: "none" });
              }}
              fontSize="small"
            />
          </div>
        </div>
        <div className={maincss.notif_bottom}>
          <div className={maincss.bottom_left}>
            <img src={req_popup_data.profile_pic} alt="" />
          </div>
          <div className={maincss.bottom_right}>
            <div className={maincss.bottom_right_comps}>
              {req_popup_data.name}
            </div>
            <div className={maincss.bottom_right_comps}>
              {req_popup_data.notif_message}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Main;
