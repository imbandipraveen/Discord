import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import valid_css from "./validNavbar.module.css";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import ServerDetails from "../server_details/ServerDetails";
import { useDispatch, useSelector } from "react-redux";
import {
  change_page_id,
  server_members,
  change_page_name,
} from "../../../Redux/current_page";
import CloseIcon from "@mui/icons-material/Close";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import CreateNewFolderIcon from "@mui/icons-material/CreateNewFolder";
import DeleteForeverIcon from "@mui/icons-material/DeleteForever";
import LogoutIcon from "@mui/icons-material/Logout";
import Modal from "react-bootstrap/Modal";
import Typography from "@mui/material/Typography";
import Skeleton from "@mui/material/Skeleton";
import { update_options } from "../../../Redux/options_slice";
import config from "../../../config/config";

function NavbarChatValid() {
  const url = config.API_BASE_URL;
  const { server_id } = useParams();
  const Navigate = useNavigate();

  // user details from redux
  const username = useSelector((state) => state.user_info.username);
  const id = useSelector((state) => state.user_info.id);

  const front_end_url = config.FRONTEND_URL;

  // add channel modal states
  const [show, setShow] = useState(false);
  const handleClose = () => {
    setShow(false);
    setCategoryCreationProgress({ text: "Create Category", disabled: false });
  };
  const handleShow = () => setShow(true);

  // invite people modal
  const [inviteShow, setInviteShow] = useState(false);
  const handleInviteClose = () => setInviteShow(false);

  // this use state is triggered when we delete a server and we set it to false so that user goes back to dashboard and it value is updated by socket for other members in the server and with the fetch request to update it for the author
  // const [server_exists, setserver_exists] = useState(true)

  const [showOptions, setShowOptions] = useState("none");
  const [serverDetails, setServerDetails] = useState([]);
  const server_role = useSelector((state) => state.current_page.role);
  const dispatch = useDispatch();
  const [newCategoryName, setNewCategoryName] = useState("");
  const [categoryCreationProgress, setCategoryCreationProgress] = useState({
    text: "Create Category",
    disabled: false,
  });
  const [inviteLink, setInviteLink] = useState("");

  useEffect(() => {
    setInviteLink("");
    setShowOptions("none");
  }, [server_id]);

  const [newRequest, setNewRequest] = useState(1);
  const newRequestReceived = (newRequest_value) => {
    setNewRequest(newRequest + newRequest_value);
  };

  const createInviteLink = async () => {
    const res = await fetch(`${url}/invites/create`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-auth-token": localStorage.getItem("token"),
      },
      body: JSON.stringify({
        inviter_name: username,
        inviter_id: id,
        server_name: serverDetails.server_name,
        server_id: server_id,
        server_pic: serverDetails.server_pic,
      }),
    });
    const data = await res.json();
    if (data.status === 200) {
      setInviteLink(`${front_end_url}/invite/${data.invite_code}`);
    }
  };

  const deleteServer = async () => {
    const res = await fetch(`${url}/servers/delete`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-auth-token": localStorage.getItem("token"),
      },
      body: JSON.stringify({
        server_id,
      }),
    });
    const data = await res.json();
    if (data.status === 200) {
      dispatch(update_options());
      Navigate("/channels/@me");
    }
  };

  const leaveServer = async () => {
    const res = await fetch(`${url}/servers/leave`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-auth-token": localStorage.getItem("token"),
      },
      body: JSON.stringify({
        server_id,
      }),
    });
    const data = await res.json();
    if (data.status === 200) {
      dispatch(update_options());
      Navigate("/channels/@me");
    }
  };

  function changeOptionsVisibility() {
    if (showOptions === "none") {
      setShowOptions("block");
    } else {
      setShowOptions("none");
    }
  }

  const serverInfo = async () => {
    try {
      const res = await fetch(`${url}/servers/info`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-auth-token": localStorage.getItem("token"),
        },
        body: JSON.stringify({
          server_id,
        }),
      });
      const data = await res.json();
      setServerDetails(data);

      dispatch(change_page_name(data.categories[0]?.channels[0]?.channel_name));
      dispatch(change_page_id(data.categories[0]?.channels[0]._id));
      dispatch(server_members(data.users));
    } catch (error) {
      Navigate("/");
      console.log(error);
    }
  };

  const createCategory = async () => {
    const res = await fetch(`${url}/servers/category/new`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-auth-token": localStorage.getItem("token"),
      },
      body: JSON.stringify({
        category_name: newCategoryName,
        server_id: server_id,
      }),
    });
    const data = await res.json();
    if (data.status === 200) {
      serverInfo();
      handleClose();
    }
  };

  useEffect(() => {
    serverInfo();
  }, [server_id, newRequest]);

  return (
    <>
      <div className={valid_css.options_wrap} style={{ display: showOptions }}>
        <div
          className={valid_css.options}
          onClick={() => {
            if (inviteLink.length === 0) {
              createInviteLink();
            }
            setInviteShow(true);
          }}
        >
          <div className={valid_css.options_comps}>Invite People</div>
          <div className={valid_css.options_comps}>
            <PersonAddIcon fontSize="small"></PersonAddIcon>
          </div>
        </div>
        <div className={valid_css.options} onClick={handleShow}>
          <div className={valid_css.options_comps}>Create Category</div>
          <div className={valid_css.options_comps}>
            <CreateNewFolderIcon fontSize="small"></CreateNewFolderIcon>
          </div>
        </div>

        {server_role === "author" ? (
          <div
            className={valid_css.options}
            onClick={deleteServer}
            style={{ color: "#e7625f" }}
          >
            <div className={valid_css.options_comps}>Delete Server</div>
            <div className={valid_css.options_comps}>
              <DeleteForeverIcon fontSize="small"></DeleteForeverIcon>
            </div>
          </div>
        ) : (
          <div
            className={valid_css.options}
            onClick={leaveServer}
            style={{ color: "#e7625f" }}
          >
            <div className={valid_css.options_comps}>Leave Server</div>
            <div className={valid_css.options_comps}>
              <LogoutIcon fontSize="small"></LogoutIcon>
            </div>
          </div>
        )}
      </div>
      <div
        className={`${valid_css.server_name} ${valid_css.nav_2_parts}`}
        onClick={changeOptionsVisibility}
      >
        {serverDetails.server_name}
        {showOptions === "none" ? (
          <KeyboardArrowDownIcon></KeyboardArrowDownIcon>
        ) : (
          <CloseIcon fontSize="small"></CloseIcon>
        )}
      </div>
      {serverDetails.length === 0 ? (
        <></>
      ) : (
        <div className={`${valid_css.category_info} ${valid_css.nav_2_parts}`}>
          {serverDetails.categories.map((elem, key) => {
            return (
              <div key={key}>
                <ServerDetails
                  newRequestReceived={newRequestReceived}
                  elem={elem}
                ></ServerDetails>
              </div>
            );
          })}
        </div>
      )}

      {/* Create new channel modal */}
      <Modal
        show={show}
        centered
        onHide={handleClose}
        id={valid_css.modal_main_wrap}
      >
        <div className={valid_css.modal_main}>
          {/* Header */}
          <div className={valid_css.modal_comps} id={valid_css.modal_header}>
            <div
              id={valid_css.primary_heading}
              className={valid_css.header_comps}
            >
              Create Category
            </div>
          </div>

          {/* Enter channel Name */}
          <div className={valid_css.modal_comps} id={valid_css.channel_name}>
            <div>CATEGORY NAME</div>
            <div className={valid_css.input_div}>
              <input
                type="text"
                value={newCategoryName}
                onChange={(e) => {
                  setNewCategoryName(e.target.value);
                }}
                placeholder="new-channel"
              />
            </div>
          </div>

          {/* Buttons */}
          <div className={valid_css.modal_comps} id={valid_css.modal_buttons}>
            <div>
              <button
                className={valid_css.buttons}
                id={valid_css.cancel_button}
                disabled={categoryCreationProgress.disabled}
                onClick={handleClose}
              >
                Cancel
              </button>
            </div>
            <div>
              <button
                className={valid_css.buttons}
                disabled={categoryCreationProgress.disabled}
                onClick={() => {
                  createCategory();
                  setCategoryCreationProgress({
                    ...categoryCreationProgress,
                    text: "Creating",
                    disabled: true,
                  });
                }}
                id={valid_css.create_button}
              >
                {categoryCreationProgress.text}
              </button>
            </div>
          </div>
        </div>
      </Modal>

      {/* invite people modal */}
      <Modal
        show={inviteShow}
        onHide={handleInviteClose}
        backdrop="static"
        keyboard={false}
        centered
        id={valid_css.invite_modal}
      >
        <div
          className={`${valid_css.invite_modal_main} ${valid_css.modal_main} `}
        >
          <CloseIcon
            id={valid_css.close_button}
            onClick={handleInviteClose}
          ></CloseIcon>
          <div
            className={valid_css.invite_modal_comps}
            id={valid_css.invite_top_part}
          >
            Invite friends to {serverDetails.server_name}
          </div>
          <div
            className={valid_css.invite_modal_comps}
            id={valid_css.invite_bottom_part}
          >
            SEND A SERVER INVITE LINK TO A FRIEND
            <div id={valid_css.inviteLink_wrap}>
              <div id={valid_css.inviteLink_value}>
                {inviteLink.length === 0 ? (
                  <Typography
                    component="div"
                    key={"caption"}
                    variant={"caption"}
                  >
                    <Skeleton />
                  </Typography>
                ) : (
                  inviteLink
                )}
              </div>
              <div id={valid_css.copy_button_wrap}>
                <button
                  id={valid_css.copy_button}
                  onClick={() => {
                    navigator.clipboard.writeText(inviteLink);
                  }}
                >
                  Copy
                </button>
              </div>
            </div>
          </div>
        </div>
      </Modal>
    </>
  );
}

export default NavbarChatValid;
