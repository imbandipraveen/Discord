import React, { useState } from 'react';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import AddIcon from '@mui/icons-material/Add';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import TagIcon from '@mui/icons-material/Tag';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import { useDispatch, useSelector } from 'react-redux';
import { change_page_id, change_page_name } from '../../../Redux/current_page';
import Modal from 'react-bootstrap/Modal';
import Radio from '@mui/material/Radio';
import { useParams } from 'react-router-dom';
import socket from '../../Socket/Socket';
import { update_options } from '../../../Redux/options_slice';

function Server_details({ new_req_recieved, elem }) {
  const dispatch = useDispatch();
  const [show, setShow] = useState(false);
  const [selectedValue, setSelectedValue] = useState('');
  const [category_name, setcategory_name] = useState('');
  const [new_channel_name, setnew_channel_name] = useState('');
  const url = import.meta.env.VITE_API_URL;
  const [channel_creation_progess, setchannel_creation_progess] = useState({
    text: 'Create Channel',
    disabled: false
  });
  const { server_id } = useParams();

  const handleChange = (event) => {
    setSelectedValue(event.target.value);
  };

  const handleClose = () => {
    setShow(false);
    setchannel_creation_progess({ text: 'Create Channel', disabled: false });
  };

  const handleShow = () => setShow(true);

  const [show_channels, setshow_channels] = useState('true');

  function make_channels_visible() {
    if (show_channels === 'none') {
      setshow_channels('flex');
    } else {
      setshow_channels('none');
    }
  }

  const create_channel = async () => {
    const res = await fetch(`${url}/add_new_channel`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-auth-token': localStorage.getItem('token'),
      },
      body: JSON.stringify({
        channel_name: new_channel_name,
        category_id: elem._id,
        channel_type: selectedValue,
        server_id: server_id
      }),
    });
    const data = await res.json();
    if (data.status === 200) {
      new_req_recieved(1);
      handleClose();
    }
  };

  function change_channel(channel_type, channel_name, channel_id) {
    if (channel_type === 'text') {
      dispatch(change_page_name(channel_name));
      dispatch(change_page_id(channel_id));
    }
  }

  return (
    <>
      <div className="flex justify-between items-center p-[0.3rem] text-[#939698] text-[0.8rem] mt-4 mr-[0.9rem] cursor-pointer">
        <div className="hover:text-white" onClick={make_channels_visible}>
          {show_channels === 'none' ? (
            <KeyboardArrowDownIcon fontSize="small" />
          ) : (
            <KeyboardArrowUpIcon fontSize="small" />
          )}
          {elem.category_name}
        </div>
        <div className="hover:text-white">
          <AddIcon
            onClick={() => {
              handleShow();
              setcategory_name(elem.category_name);
            }}
            fontSize="small"
          />
        </div>
      </div>

      <div className="space-y-1" style={{ display: show_channels }}>
        {elem.channels.map((channel_elem, indexes) => (
          <div
            key={indexes}
            className="w-[90%] mx-auto flex h-10 items-center rounded-[5px] hover:bg-[#4F545C66]"
          >
            <div
              className="text-[#939698] font-medium text-[0.9rem] w-full flex items-center h-full cursor-pointer ml-4 gap-[0.2rem] hover:text-white"
              onClick={() => {
                change_channel(channel_elem.channel_type, channel_elem.channel_name, channel_elem._id);
              }}
            >
              {channel_elem.channel_type === 'text' ? (
                <TagIcon fontSize="small" />
              ) : (
                <VolumeUpIcon fontSize="small" />
              )}
              <div>{channel_elem.channel_name}</div>
            </div>
          </div>
        ))}
      </div>

      <Modal show={show} centered onHide={handleClose} className="max-w-[450px]">
        <div className="bg-[#36393F] p-4">
          <div className="mb-4">
            <div className="text-white text-[1.5rem] font-[650]">Create Channel</div>
            <div className="text-[#A0A3A6] text-[0.8rem]">in {category_name}</div>
          </div>

          <div className="text-[#bcbfc3] font-semibold text-[0.9rem] mb-2">
            CHANNEL TYPE
            <div className="mt-2">
              <div className="grid grid-cols-[10%_80%_20%] items-center mt-2 p-[0.3rem] rounded-[5px] bg-[#2F3136] cursor-pointer hover:bg-[#555558]">
                <div className="flex items-center">
                  <TagIcon />
                </div>
                <div>
                  <div className="text-white">Text</div>
                  <div className="text-[0.9rem]">Send messages,images,GIFs,emoji</div>
                </div>
                <div className="flex justify-center">
                  <Radio
                    checked={selectedValue === 'text'}
                    onChange={handleChange}
                    value="text"
                    className="text-white"
                    name="radio-buttons"
                  />
                </div>
              </div>
            </div>
            <div className="mt-2">
              <div className="grid grid-cols-[10%_80%_20%] items-center mt-2 p-[0.3rem] rounded-[5px] bg-[#2F3136] cursor-pointer hover:bg-[#555558]">
                <div className="flex items-center">
                  <VolumeUpIcon />
                </div>
                <div>
                  <div className="text-white">Voice</div>
                  <div className="text-[0.9rem]">Hang out together with voice and screen share</div>
                </div>
                <div className="flex justify-center">
                  <Radio
                    checked={selectedValue === 'voice'}
                    onChange={handleChange}
                    value="voice"
                    className="text-white"
                    name="radio-buttons"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="text-white text-[0.8rem] font-semibold my-4">
            <div>CHANNEL NAME</div>
            <div className="flex items-center bg-[#202225] mt-2 rounded-[5px] p-2">
              {selectedValue === 'text' ? (
                <TagIcon />
              ) : (
                <VolumeUpIcon />
              )}
              <input
                type="text"
                value={new_channel_name}
                onChange={(e) => setnew_channel_name(e.target.value)}
                placeholder="new-channel"
                className="bg-[#202225] border-none w-full text-indent-2 caret-white text-[1rem] text-[#A0A3A6] focus:outline-none placeholder:text-[1rem]"
              />
            </div>
          </div>

          <div className="flex justify-end gap-4 items-center">
            <div>
              <button
                className="bg-transparent border-none text-white cursor-pointer"
                disabled={channel_creation_progess.disabled}
                onClick={handleClose}
              >
                Cancel
              </button>
            </div>
            <div>
              <button
                className="border-none text-white bg-blue-600 p-[0.3rem] rounded-[3px] hover:bg-blue-700 cursor-pointer"
                disabled={channel_creation_progess.disabled}
                onClick={() => {
                  create_channel();
                  setchannel_creation_progess({
                    ...channel_creation_progess,
                    text: 'Creating',
                    disabled: true
                  });
                }}
              >
                {channel_creation_progess.text}
              </button>
            </div>
          </div>
        </div>
      </Modal>
    </>
  );
}

export default Server_details; 