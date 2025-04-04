import React, { useRef, useState } from "react";
import nav2css from "./css/navbar2.module.css";
import OverlayTrigger from "react-bootstrap/OverlayTrigger";
import Tooltip from "react-bootstrap/Tooltip";
import SettingsIcon from "@mui/icons-material/Settings";
import HeadsetIcon from "@mui/icons-material/Headset";
import MicOffIcon from "@mui/icons-material/MicOff";
import EditIcon from "@mui/icons-material/Edit";
import NavbarDashboard from "../dashboard/NavbarDashboard";
import NavbarChat from "../chatComponents/navbarChat/NavbarChat";
import { useSelector, useDispatch } from "react-redux";
import { useParams } from "react-router-dom";
import { uploadFileToS3 } from "../storage/aws-s3-storage-blob";
import { option_profile_pic } from "../../Redux/user_creds_slice";
import config from "../../config/config";

function Navbar2() {
  const { server_id } = useParams();
  const fileInputRef = useRef(null);
  const dispatch = useDispatch();
  const [uploading, setUploading] = useState(false);

  // user details from redux
  const username = useSelector((state) => state.user_info.username);
  const tag = useSelector((state) => state.user_info.tag);
  const profile_pic = useSelector((state) => state.user_info.profile_pic);

  function buttons(message, Icon) {
    return (
      <div className={nav2css.icons}>
        {/* headset tooltip and icon */}
        <OverlayTrigger placement="top" overlay={tooltips(message)}>
          {<Icon fontSize="small" />}
        </OverlayTrigger>
      </div>
    );
  }

  const tooltips = (value, props) => (
    <Tooltip id="button-tooltip" {...props}>
      {value}
    </Tooltip>
  );

  const handleProfileClick = () => {
    fileInputRef.current.click();
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      setUploading(true);
      // Upload to S3
      const imageUrl = await uploadFileToS3(file);

      if (imageUrl) {
        // Update in database
        const url = config.FRONTEND_URL;
        const response = await fetch(`${url}/users/update-profile-pic`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-auth-token": localStorage.getItem("token"),
          },
          body: JSON.stringify({ profilePicUrl: imageUrl }),
        });

        const data = await response.json();

        if (data.status === 200) {
          // Update Redux store
          dispatch(option_profile_pic(imageUrl));

          // Refresh token
          if (data.token) {
            localStorage.setItem("token", data.token);
          } else {
            // If the server doesn't return a token, we need to fetch a new one
            const refreshResponse = await fetch(`${url}/refresh-token`, {
              method: "GET",
              headers: {
                "x-auth-token": localStorage.getItem("token"),
              },
            });

            const refreshData = await refreshResponse.json();
            if (refreshData.token) {
              localStorage.setItem("token", refreshData.token);
            }
          }
        }
      }
    } catch (error) {
      console.error("Error updating profile picture:", error);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className={nav2css.main}>
      <div>
        {server_id === "@me" || server_id === undefined ? (
          <NavbarDashboard></NavbarDashboard>
        ) : (
          <NavbarChat></NavbarChat>
        )}
      </div>
      {/* this div above is here just to seprate above part with the lower part using a grid */}
      <div id={nav2css.footer}>
        <div id={nav2css.profile} className={nav2css.footer_comps}>
          <img src={profile_pic} alt="" />
          {uploading ? (
            <div className={nav2css.profile_uploading}>
              <div className={nav2css.profile_uploading_text}>Uploading...</div>
            </div>
          ) : (
            <div
              className={nav2css.profile_overlay}
              onClick={handleProfileClick}
            >
              <EditIcon
                className={nav2css.profile_overlay_icon}
                fontSize="small"
              />
            </div>
          )}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            style={{ display: "none" }}
            accept="image/*"
          />
        </div>
        <div id={nav2css.profile_name_wrap} className={nav2css.footer_comps}>
          <div id={nav2css.profile_name} className={nav2css.profile_name_comps}>
            {username}
          </div>
          <div id={nav2css.tag} className={nav2css.profile_name_comps}>
            #{tag}
          </div>
        </div>
        <div id={nav2css.profile_options} className={nav2css.footer_comps}>
          {buttons("Unmute", MicOffIcon)}
          {buttons("Deafen", HeadsetIcon)}
          {buttons("User Settings", SettingsIcon)}
        </div>
      </div>
    </div>
  );
}

export default Navbar2;
