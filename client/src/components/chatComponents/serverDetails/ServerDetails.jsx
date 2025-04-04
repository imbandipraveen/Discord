import React, { useState } from "react";
import servercss from "./serverDetails.module.css";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import AddIcon from "@mui/icons-material/Add";
import VolumeUpIcon from "@mui/icons-material/VolumeUp";
import TagIcon from "@mui/icons-material/Tag";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import { useDispatch } from "react-redux";
import { change_page_id, change_page_name } from "../../../Redux/current_page";
import Modal from "react-bootstrap/Modal";
import Radio from "@mui/material/Radio";
import { useParams } from "react-router-dom";
import config from "../../../config/config";

function ServerDetails({ newRequestReceived, elem }) {
  const dispatch = useDispatch();
  const { server_id } = useParams();
  const url = config.API_BASE_URL;

  const [show, setShow] = useState(false);
  const [selectedValue, setSelectedValue] = useState("");
  const [categoryName, setCategoryName] = useState("");
  const [newChannelName, setNewChannelName] = useState("");
  const [showChannels, setShowChannels] = useState(true);
  const [channelCreationProgress, setChannelCreationProgress] = useState({
    text: "Create Channel",
    disabled: false,
  });

  const handleChange = (event) => setSelectedValue(event.target.value);
  const handleClose = () => {
    setShow(false);
    setChannelCreationProgress({ text: "Create Channel", disabled: false });
  };
  const handleShow = () => setShow(true);

  const toggleChannelsVisibility = () => setShowChannels((prev) => !prev);

  const createChannel = async () => {
    try {
      const res = await fetch(`${url}/servers/channel/new`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-auth-token": localStorage.getItem("token"),
        },
        body: JSON.stringify({
          channel_name: newChannelName,
          category_id: elem._id,
          channel_type: selectedValue,
          server_id,
        }),
      });

      const data = await res.json();
      if (data.status === 200) {
        newRequestReceived(1);
        handleClose();
      }
    } catch (error) {
      console.error("Error creating channel:", error);
    }
  };

  const changeChannel = (channelType, channelName, channelId) => {
    if (channelType === "text") {
      dispatch(change_page_name(channelName));
      dispatch(change_page_id(channelId));
    }
  };

  return (
    <>
      <div className={servercss.categories}>
        <div
          className={servercss.categories_left}
          onClick={toggleChannelsVisibility}
        >
          {showChannels ? (
            <KeyboardArrowUpIcon fontSize="small" />
          ) : (
            <KeyboardArrowDownIcon fontSize="small" />
          )}
          {elem.category_name}
        </div>
        <div className={servercss.categories_left}>
          <AddIcon
            onClick={() => {
              handleShow();
              setCategoryName(elem.category_name);
            }}
            fontSize="small"
          />
        </div>
      </div>

      {showChannels &&
        elem.channels.map((channel) => (
          <div key={channel._id} className={servercss.channels_wrap}>
            <div
              className={servercss.channels}
              onClick={() =>
                changeChannel(
                  channel.channel_type,
                  channel.channel_name,
                  channel._id
                )
              }
            >
              {channel.channel_type === "text" ? (
                <TagIcon fontSize="small" />
              ) : (
                <VolumeUpIcon fontSize="small" />
              )}
              <div className={servercss.channel_name}>
                {channel.channel_name}
              </div>
            </div>
          </div>
        ))}

      <Modal
        show={show}
        centered
        onHide={handleClose}
        id={servercss.modal_main_wrap}
      >
        <div className={servercss.modal_main}>
          {/* Header */}
          <div className={servercss.modal_comps} id={servercss.modal_header}>
            <div
              id={servercss.primary_heading}
              className={servercss.header_comps}
            >
              Create Channel
            </div>
            <div
              id={servercss.secondary_heading}
              className={servercss.header_comps}
            >
              in {categoryName}
            </div>
          </div>

          {/* Select Channel Type */}
          <div className={servercss.modal_comps} id={servercss.channel_type}>
            <div>CHANNEL TYPE</div>
            {["text", "voice"].map((type) => (
              <div key={type} className={servercss.channel_type_comps}>
                <div className={servercss.channel_type_wrap}>
                  <div className={servercss.channel_type_comps}>
                    {type === "text" ? <TagIcon /> : <VolumeUpIcon />}
                  </div>
                  <div className={servercss.channel_type_comps}>
                    <div className={servercss.channel_type_text}>
                      {type === "text" ? "Text" : "Voice"}
                    </div>
                    <div className={servercss.channel_type_disc_text}>
                      {type === "text"
                        ? "Send messages, images, GIFs, emoji"
                        : "Hang out together with voice and screen share"}
                    </div>
                  </div>
                  <div className={servercss.select_button}>
                    <Radio
                      checked={selectedValue === type}
                      onChange={handleChange}
                      value={type}
                      className={servercss.radio_button}
                      name="radio-buttons"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Enter Channel Name */}
          <div className={servercss.modal_comps} id={servercss.channel_name}>
            <div>CHANNEL NAME</div>
            <div className={servercss.input_div}>
              {selectedValue === "text" ? <TagIcon /> : <VolumeUpIcon />}
              <input
                type="text"
                value={newChannelName}
                onChange={(e) => setNewChannelName(e.target.value)}
                placeholder="new-channel"
              />
            </div>
          </div>

          {/* Buttons */}
          <div className={servercss.modal_comps} id={servercss.modal_buttons}>
            <button
              className={servercss.buttons}
              id={servercss.cancel_button}
              disabled={channelCreationProgress.disabled}
              onClick={handleClose}
            >
              Cancel
            </button>
            <button
              className={servercss.buttons}
              disabled={channelCreationProgress.disabled}
              onClick={() => {
                setChannelCreationProgress({
                  text: "Creating...",
                  disabled: true,
                });
                createChannel();
              }}
              id={servercss.create_button}
            >
              {channelCreationProgress.text}
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
}

export default ServerDetails;
