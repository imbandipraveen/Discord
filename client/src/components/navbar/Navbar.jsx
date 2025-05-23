import React from "react";
import navbarcss from "./css/navbar.module.css";
import AddIcon from "@mui/icons-material/Add";
import Modal from "react-bootstrap/Modal";
import CloseIcon from "@mui/icons-material/Close";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import { useState, useEffect } from "react";
import { Button } from "@mui/material";
import CircularProgress from "@mui/material/CircularProgress";
import { Link, useLocation } from "react-router-dom";
import { useDispatch } from "react-redux";
import OverlayTrigger from "react-bootstrap/OverlayTrigger";
import Tooltip from "react-bootstrap/Tooltip";
import { server_role } from "../../redux/currentPage";
import config from "../../config/config";
import { uploadFileToS3 } from "../storage/aws-s3-storage-blob";
import {
  server_img_1,
  server_img_2,
  server_img_3,
  server_img_4,
  server_img_5,
  server_img_6,
  server_img_7,
  server_input,
  discord_logo_3,
} from "../../images";

function Navbar({ user_cred, newRequestReceived }) {
  const dispatch = useDispatch();
  const location = useLocation();
  const currentPath = location.pathname.split("/")[2]; // Get the current server ID from URL

  const { username, user_servers } = user_cred;
  const [servers, setservers] = useState([
    { server_pic: "", server_name: "", server_id: "" },
  ]);

  useEffect(() => {
    setservers(user_servers);
  }, [user_servers]);

  const [show, setShow] = useState(false);
  const handleClose = () => {
    setShow(false);
    setcurrent_modal(1);
    setsubmit_button({ create_button_state: false, back_button_state: false });
    setnew_server_image_preview(server_input);
  };
  const handleShow = () => setShow(true);
  const template = [
    { text: "Create My Own", image: server_img_1 },
    { text: "Gaming", image: server_img_2 },
    { text: "School Club", image: server_img_3 },
    { text: "Study Group", image: server_img_4 },
    { text: "Friends", image: server_img_5 },
    { text: "Artists & Creators", image: server_img_6 },
    { text: "Local Community", image: server_img_7 },
  ];
  const [server_details, setserver_details] = useState({
    name: `${username}'s server`,
    type: "",
    key: 0,
    role: "author",
  });
  const [current_modal, setcurrent_modal] = useState(1);
  const [submit_button, setsubmit_button] = useState({
    create_button_state: false,
    back_button_state: false,
  });
  const [new_server_image_preview, setnew_server_image_preview] =
    useState(server_input);
  const [new_server_image, setnew_server_image] = useState("");

  const url = config.API_BASE_URL;

  function update_server_pic(e) {
    let file = e.target.files[0];
    setnew_server_image_preview(URL.createObjectURL(file));
    setnew_server_image(file);
  }

  const create_server = async () => {
    let image_url = "";
    if (new_server_image !== "") {
      const file_url = await uploadFileToS3(new_server_image);
      image_url = file_url;
    }

    const res = await fetch(`${url}/servers/create`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-auth-token": localStorage.getItem("token"),
      },
      body: JSON.stringify({
        server_details,
        server_image: image_url,
      }),
    });
    const data = await res.json();
    if (data.status === 200) {
      handleClose();
      newRequestReceived(1);
    }
  };

  function first_modal() {
    return (
      <>
        <div className={navbarcss.server_close_button}>
          <CloseIcon
            htmlColor="#A7ABB0"
            onClick={handleClose}
            fontSize="large"
          ></CloseIcon>
        </div>
        <div id={navbarcss.new_server}>
          <div id={navbarcss.server_heading} className={navbarcss.components}>
            {" "}
            Create a server
          </div>
          <div
            id={navbarcss.server_sub_heading}
            className={navbarcss.components}
          >
            Your server is where you and your friends hang out. Make yours and
            start talking.
          </div>

          <div id={navbarcss.server_template_wrap}>
            {template.map((elem, index) => {
              return (
                <div key={index}>
                  <div
                    className={navbarcss.server_template}
                    onClick={() => {
                      setserver_details({
                        ...server_details,
                        type: elem.text,
                        key: index + 1,
                      });
                      setcurrent_modal(2);
                    }}
                  >
                    <div id={navbarcss.server_template_item_1}>
                      <img src={elem.image} alt="" />
                      {elem.text}
                    </div>
                    <div id={navbarcss.server_template_item_2}>
                      <ChevronRightIcon fontSize="large"></ChevronRightIcon>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </>
    );
  }

  function second_modal() {
    return (
      <>
        <div className={navbarcss.server_close_button}>
          <CloseIcon
            htmlColor="#A7ABB0"
            onClick={() => {
              handleClose();
              setcurrent_modal(1);
            }}
            fontSize="large"
          ></CloseIcon>
        </div>
        <div id={navbarcss.new_server}>
          <div id={navbarcss.server_heading} className={navbarcss.components}>
            Tell us more about your server
          </div>
          <div
            id={navbarcss.server_sub_heading}
            className={navbarcss.components}
          >
            In order to help you with your setup, is your new server for just a
            few friends or a larger community?
          </div>

          <div id={navbarcss.server_template_wrap}>
            {template
              .slice(template.length - 2, template.length)
              .map((elem, index) => {
                return (
                  <div key={index}>
                    <div
                      className={navbarcss.server_template}
                      onClick={() => {
                        setcurrent_modal(3);
                      }}
                    >
                      <div id={navbarcss.server_template_item_1}>
                        <img src={elem.image} alt="" />
                        {elem.text}
                      </div>
                      <div id={navbarcss.server_template_item_2}>
                        <ChevronRightIcon fontSize="large"></ChevronRightIcon>
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>
          <div className={navbarcss.question}>
            Not sure? You can
            <div
              className={navbarcss.question_link}
              onClick={() => {
                setcurrent_modal(3);
              }}
            >
              skip this question
            </div>
            for now
          </div>
          <div className={navbarcss.back_button_wrap}>
            <div
              className={navbarcss.back_button}
              onClick={() => {
                setcurrent_modal(1);
              }}
            >
              Back
            </div>
          </div>
        </div>
      </>
    );
  }

  function third_modal() {
    return (
      <>
        <div className={navbarcss.server_close_button}>
          <CloseIcon
            htmlColor="#A7ABB0"
            onClick={() => {
              handleClose();
              setcurrent_modal(1);
            }}
            fontSize="large"
          ></CloseIcon>
        </div>
        <div id={navbarcss.new_server}>
          <div id={navbarcss.server_heading} className={navbarcss.components}>
            Customize your server
          </div>
          <div
            id={navbarcss.server_sub_heading}
            className={navbarcss.components}
          >
            Give your new server a personality with a name and an icon. You can
            always change it later.
          </div>
          <div className={navbarcss.input_field_wrap}>
            <label className={navbarcss.input_field} htmlFor="update_cover_pic">
              <img src={new_server_image_preview} alt="" />
            </label>
            <input
              onChange={update_server_pic}
              type="file"
              id="update_cover_pic"
              name="image"
              hidden
            />
          </div>

          <div className={navbarcss.server_details}>
            <div id={navbarcss.server_name_heading}>SERVER NAME</div>
            <div id={navbarcss.server_details}>
              {" "}
              <input
                onChange={(e) => {
                  setserver_details({
                    ...server_details,
                    name: e.target.value,
                  });
                }}
                value={server_details.name}
                id={navbarcss.server_name_input}
                type="text"
              />{" "}
            </div>
          </div>

          <div className={navbarcss.buttons_wrap}>
            <button
              className={navbarcss.back_button}
              disabled={submit_button.back_button_state}
              onClick={() => {
                setcurrent_modal(2);
              }}
            >
              Back
            </button>
            <Button
              className={navbarcss.create_button}
              variant="contained"
              onClick={() => {
                create_server();
                setsubmit_button({
                  create_button_state: true,
                  back_button_state: true,
                });
              }}
            >
              {submit_button.create_button_state === false ? (
                <>Create</>
              ) : (
                <>
                  <CircularProgress size="1.5rem" color="inherit" />
                </>
              )}
            </Button>
          </div>
        </div>
      </>
    );
  }

  return (
    <div className={navbarcss.main}>
      <div className={navbarcss.main_wrap}>
        <div>
          {/* for going to the dashboard */}
          <OverlayTrigger
            placement="right"
            overlay={
              <Tooltip id={navbarcss.button_tooltip_2}>Direct Messages</Tooltip>
            }
          >
            <Link
              to={"/channels/@me"}
              className={`${navbarcss.list_items} ${navbarcss.dms} ${
                currentPath === "@me" ? navbarcss.active : ""
              }`}
            >
              <div className={`${navbarcss.left}`}>
                <div className={navbarcss.selected}></div>
              </div>
              <div
                className={`${navbarcss.middle}`}
                id={navbarcss.direct_message}
              >
                <img src={discord_logo_3} alt="" />
              </div>
              <div className={`${navbarcss.right}`}></div>
            </Link>
          </OverlayTrigger>
        </div>

        {/* servers from here */}
        <div className={navbarcss.servers_wrap}>
          {servers?.length > 0 ? (
            servers.map((elem, key) => {
              return (
                <OverlayTrigger
                  key={key}
                  placement="right"
                  overlay={
                    <Tooltip id={navbarcss.button_tooltip_2}>
                      {elem.server_name}
                    </Tooltip>
                  }
                >
                  <Link
                    to={`/channels/${elem.server_id}`}
                    onClick={() => {
                      dispatch(server_role(elem.server_role));
                    }}
                    className={`${navbarcss.list_items} ${navbarcss.servers} ${
                      currentPath === elem.server_id ? navbarcss.active : ""
                    }`}
                  >
                    <div className={`${navbarcss.left}`}>
                      <div className={navbarcss.selected}></div>
                    </div>
                    <div
                      className={`${navbarcss.middle}  ${navbarcss.server_middle}`}
                    >
                      {elem.server_pic === "" ? (
                        <>{elem.server_name[0]}</>
                      ) : (
                        <img src={elem.server_pic} alt="" />
                      )}
                    </div>
                    <div className={`${navbarcss.right}`}></div>
                  </Link>
                </OverlayTrigger>
              );
            })
          ) : (
            <></>
          )}
        </div>

        {/* Add new server */}
        <div className={`${navbarcss.list_items}`}>
          <div className={`${navbarcss.left}`}></div>
          <div
            className={`${navbarcss.middle}  ${navbarcss.server_middle}`}
            onClick={handleShow}
            id={navbarcss.plus}
          >
            <AddIcon fontSize="large" />
          </div>
          <div className={`${navbarcss.right}`}></div>
        </div>

        <Modal
          id={navbarcss.new_server_wrap}
          show={show}
          onHide={handleClose}
          centered
        >
          {current_modal === 1 ? (
            <>{first_modal()}</>
          ) : (
            <>
              {current_modal === 2 ? (
                <>{second_modal()}</>
              ) : (
                <>{third_modal()}</>
              )}
            </>
          )}
        </Modal>
      </div>
    </div>
  );
}

export default Navbar;
