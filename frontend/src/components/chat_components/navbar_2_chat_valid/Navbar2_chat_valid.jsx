import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import Server_details from '../server_details/Server_details';
import { useDispatch, useSelector } from 'react-redux';
import { change_page_id, server_members, change_page_name } from '../../../Redux/current_page';
import CloseIcon from '@mui/icons-material/Close';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import CreateNewFolderIcon from '@mui/icons-material/CreateNewFolder';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import LogoutIcon from '@mui/icons-material/Logout';
import Modal from 'react-bootstrap/Modal';
import Typography from '@mui/material/Typography';
import Skeleton from '@mui/material/Skeleton';
import { update_options } from '../../../Redux/options_slice'

function Navbar2_chat_valid() {
  const url = import.meta.env.VITE_API_URL;
  const { server_id } = useParams();
  const Navigate = useNavigate();

  // user details from redux
  const username = useSelector(state => state.user_info.username)
  const id = useSelector(state => state.user_info.id)

  const front_end_url = import.meta.env.VITE_FRONTEND_URL;

  const page_id = useSelector(state => state.current_page.page_id)

  // add channel modal states
  const [show, setShow] = useState(false);
  const handleClose = () => {
    setShow(false)
    setcategory_creation_progress({ text: 'Create Category', disabled: false })
  };
  const handleShow = () => setShow(true);

  // invite people modal
  const [inviteshow, setinviteshow] = useState(false);
  const handle_inviteClose = () => setinviteshow(false);
  const handle_inviteShow = () => setinviteshow(true);

  const [show_options, setshow_options] = useState('none')
  const [server_details, setserver_details] = useState([])
  const server_role = useSelector(state => state.current_page.role)
  const dispatch = useDispatch()
  const [new_category_name, setnew_category_name] = useState('')
  const [category_creation_progress, setcategory_creation_progress] = useState({ text: 'Create Category', disabled: false })
  const [invite_link, setinvite_link] = useState('')

  useEffect(() => {
    setinvite_link('')
    setshow_options('none')
  }, [server_id])

  const [new_req, setnew_req] = useState(1)
  const new_req_recieved = (new_req_value) => {
    setnew_req(new_req + new_req_value)
  }

  const create_invite_link = async () => {
    console.log('run this')
    const res = await fetch(`${url}/create_invite_link`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-auth-token': localStorage.getItem('token'),
      },
      body: JSON.stringify({
        inviter_name: username, inviter_id: id, server_name: server_details.server_name, server_id: server_id, server_pic: server_details.server_pic
      }),
    })
    const data = await res.json();
    if (data.status == 200) {
      setinvite_link(`${front_end_url}/invite/${data.invite_code}`)
    }
  }

  const delete_server = async () => {
    console.log(server_id)
    const res = await fetch(`${url}/delete_server`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-auth-token': localStorage.getItem('token'),
      },
      body: JSON.stringify({
        server_id
      }),
    })
    const data = await res.json();
    if (data.status == 200) {
      dispatch(update_options())
      Navigate('/channels/@me')
      console.log('server deleted')
    }
  }

  const leave_server = async () => {
    console.log(server_id)
    const res = await fetch(`${url}/leave_server`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-auth-token': localStorage.getItem('token'),
      },
      body: JSON.stringify({
        server_id
      }),
    })
    const data = await res.json();
    if (data.status == 200) {
      dispatch(update_options())
      Navigate('/channels/@me')
    }
  }

  function change_options_visibility() {
    if (show_options == 'none') {
      setshow_options('block')
    }
    else {
      setshow_options('none')
    }
  }

  const server_info = async () => {
    const res = await fetch(`${url}/server_info`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-auth-token': localStorage.getItem('token'),
      },
      body: JSON.stringify({
        server_id
      }),
    })
    const data = await res.json();
    setserver_details(data[0])

    dispatch(change_page_name(data[0].categories[0].channels[0].channel_name))
    dispatch(change_page_id(data[0].categories[0].channels[0]._id))
    dispatch(server_members(data[0].users))
  };

  const create_category = async () => {
    const res = await fetch(`${url}/add_new_category`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-auth-token': localStorage.getItem('token'),
      },
      body: JSON.stringify({
        category_name: new_category_name, server_id: server_id
      }),
    })
    const data = await res.json();
    if (data.status == 200) {
      server_info()
      handleClose()
    }
  };

  useEffect(() => {
    server_info()
  }, [server_id, new_req])

  return (
    <>
      <div className={`absolute top-16 left-3 text-white bg-[#18191C] rounded-md p-2 w-[90%] ${show_options === 'none' ? 'hidden' : 'block'}`}>
        <div className="flex justify-between p-2 font-normal text-sm cursor-pointer rounded-md text-[#B9BBBE] hover:bg-violet-600 hover:text-white" onClick={() => { if (invite_link.length == 0) { create_invite_link(); } setinviteshow(true) }}>
          <div>Invite People</div>
          <div><PersonAddIcon fontSize='small'></PersonAddIcon></div>
        </div>
        <div className="flex justify-between p-2 font-normal text-sm cursor-pointer rounded-md text-[#B9BBBE] hover:bg-violet-600 hover:text-white" onClick={handleShow}>
          <div>Create Category</div>
          <div><CreateNewFolderIcon fontSize='small'></CreateNewFolderIcon></div>
        </div>
        {server_role == 'author' ?
          <div className="flex justify-between p-2 font-normal text-sm cursor-pointer rounded-md text-[#e7625f] hover:bg-[#e7625f] hover:text-white" onClick={delete_server}>
            <div>Delete Server</div>
            <div><DeleteForeverIcon fontSize='small'></DeleteForeverIcon></div>
          </div> :
          <div className="flex justify-between p-2 font-normal text-sm cursor-pointer rounded-md text-[#e7625f] hover:bg-[#e7625f] hover:text-white" onClick={leave_server}>
            <div>Leave Server</div>
            <div><LogoutIcon fontSize='small'></LogoutIcon></div>
          </div>
        }
      </div>
      <div className="relative border-b border-[#232427] h-[50px] flex items-center px-4 text-white justify-between cursor-pointer hover:bg-[#4F545C66]" onClick={change_options_visibility}>
        {server_details.server_name}
        {show_options == 'none' ?
          <KeyboardArrowDownIcon></KeyboardArrowDownIcon>
          :
          <CloseIcon fontSize='small'></CloseIcon>
        }
      </div>
      {server_details.length == 0 ?
        <></>
        :
        <div className="flex flex-col">
          {server_details.categories.map((elem, key) => {
            return (
              <Server_details key={key} new_req_recieved={new_req_recieved} elem={elem}></Server_details>
            )
          })}
        </div>
      }

      {/* Create new channel modal */}
      <Modal show={show} centered onHide={handleClose} className="max-w-[450px]">
        <div className="bg-[#36393F] p-4 text-white">
          {/* Header */}
          <div className="mb-4">
            <div className="text-white text-[1.5rem] font-[650]">Create Category</div>
          </div>

          {/* Enter channel Name */}
          <div className="text-white text-[0.8rem] font-semibold my-4">
            <div>CATEGORY NAME</div>
            <div className="flex items-center bg-[#202225] mt-2 rounded-[5px] p-2">
              <input
                type="text"
                className="bg-[#202225] border-none w-full text-indent-2 caret-white text-[1rem] text-[#A0A3A6] focus:outline-none placeholder:text-[1rem]"
                placeholder="new-category"
                value={new_category_name}
                onChange={(e) => setnew_category_name(e.target.value)}
              />
            </div>
          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-4 items-center">
            <div>
              <button
                className="bg-transparent border-none text-white cursor-pointer"
                disabled={category_creation_progress.disabled}
                onClick={handleClose}
              >
                Cancel
              </button>
            </div>
            <div>
              <button
                className="border-none text-white bg-blue-600 p-[0.3rem] rounded-[3px] hover:bg-blue-700 cursor-pointer"
                disabled={category_creation_progress.disabled}
                onClick={() => {
                  create_category();
                  setcategory_creation_progress({ ...category_creation_progress, text: 'Creating', disabled: true });
                }}
              >
                {category_creation_progress.text}
              </button>
            </div>
          </div>
        </div>
      </Modal>

      {/* Invite Modal */}
      <Modal show={inviteshow} centered onHide={handle_inviteClose} className="max-w-[400px] font-['Open_Sans']">
        <div className="bg-[#36393F] p-4 text-white relative">
          <div className="absolute right-2.5 text-[#777A7E] cursor-pointer hover:text-white" onClick={handle_inviteClose}>
            <CloseIcon />
          </div>
          <div className="font-semibold mb-4">
            <div className="text-[1.5rem] font-[650]">Invite Friends to {server_details.server_name}</div>
            <div className="text-[0.6rem] text-[#B4B6BA] font-bold mt-2">
              Share this link with others to grant them access to this server
            </div>
            <div className="flex justify-between items-center mt-2 p-2 bg-[#202225]">
              <div className="w-4/5 font-medium text-[0.8rem] text-[#B4B6BA]">{invite_link}</div>
              <button
                className="bg-[#4150f0] text-white border-none px-4 py-1 rounded-sm font-semibold text-[0.8rem] hover:bg-[#717cee]"
                onClick={() => { navigator.clipboard.writeText(invite_link) }}
              >
                Copy
              </button>
            </div>
          </div>
        </div>
      </Modal>
    </>
  )
}

export default Navbar2_chat_valid 