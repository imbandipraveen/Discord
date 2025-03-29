import React from 'react';
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import Tooltip from 'react-bootstrap/Tooltip';
import discord_logo from '../../assets/discord_logo_3.png';
import SettingsIcon from '@mui/icons-material/Settings';
import HeadsetIcon from '@mui/icons-material/Headset';
import MicOffIcon from '@mui/icons-material/MicOff';
import Navbar2_dashboard from '../dashboard_components/navbar2_dashboard/Navbar2_dashboard';
import Navbar2_chat from '../chat_components/navbar_2_chat/Navbar2_chat';
import { useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';

function Navbar_2({ user_cred }) {
  const { server_id } = useParams();

  const username = useSelector(state => state.user_info.username);
  const tag = useSelector(state => state.user_info.tag);
  const profile_pic = useSelector(state => state.user_info.profile_pic);

  function buttons(message, Icon) {
    return (
      <div className="cursor-pointer p-[3px] text-[#B9BBBE] hover:bg-[hsla(217,calc((1,1)*7.6%),33.5%,0.6)] hover:rounded-[5px]">
        <OverlayTrigger
          placement="top"
          overlay={tooltips(message)}>
          {<Icon fontSize='small' />}
        </OverlayTrigger>
      </div>
    );
  }

  const tooltips = (value, props) => (
    <Tooltip id="button-tooltip" {...props}>
      {value}
    </Tooltip>
  );

  return (
    <div className="bg-[#2F3136] h-screen font-['Open_Sans'] font-semibold relative">
      <div>
        {server_id === '@me' || server_id === undefined ? (
          <Navbar2_dashboard />
        ) : (
          <Navbar2_chat />
        )}
      </div>

      <div className="h-14 bg-[#292B2F] flex items-center justify-between px-2">
        <div className="flex items-center gap-3">
          <div className="relative">
            <img
              src={profile_pic}
              alt={username}
              className="w-8 h-8 rounded-full"
            />
            <div className="absolute bottom-0 right-0 w-3 h-3 bg-[#43B581] rounded-full border-2 border-[#292B2F]" />
          </div>
          <div className="flex flex-col">
            <div className="text-white text-sm font-medium">{username}</div>
            <div className="text-[#B9BBBE] text-xs">#{tag}</div>
          </div>
        </div>
        <div className="flex items-center gap-1">
          {buttons('Unmute', MicOffIcon)}
          {buttons('Deafen', HeadsetIcon)}
          {buttons('User Settings', SettingsIcon)}
        </div>
      </div>
    </div>
  );
}

export default Navbar_2; 