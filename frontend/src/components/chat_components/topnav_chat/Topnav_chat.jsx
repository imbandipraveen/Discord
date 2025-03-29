import React from 'react';
import TagIcon from '@mui/icons-material/Tag';
import NotificationsIcon from '@mui/icons-material/Notifications';
import PushPinIcon from '@mui/icons-material/PushPin';
import PeopleAltIcon from '@mui/icons-material/PeopleAlt';
import InboxIcon from '@mui/icons-material/Inbox';
import HelpIcon from '@mui/icons-material/Help';
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import Tooltip from 'react-bootstrap/Tooltip';
import { useSelector } from 'react-redux';
import LogoutIcon from '@mui/icons-material/Logout';

function Topnav_chat() {
  const channel_name = useSelector(state => state.current_page.page_name);

  function buttons(message, Icon) {
    return (
      <div className="text-[#B9BBBE] hover:text-white cursor-pointer" onClick={() => {
        if (message == 'Logout') {
          localStorage.clear();
          window.location.reload();
        }
      }}>
        <OverlayTrigger
          placement="bottom"
          overlay={tooltips(message)}>
          {<Icon />}
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
    <>
      <div className="flex w-full justify-between items-center mx-4 text-[#B9BBBE]">
        <div className="flex gap-2 cursor-default">
          <TagIcon></TagIcon>
          <div className="text-white font-semibold">
            {channel_name}
          </div>
        </div>
        <div className="flex gap-4 cursor-pointer">
          {buttons('Notification Settings', NotificationsIcon)}
          {buttons('Pinned Messages', PushPinIcon)}
          {buttons('Hide Member List', PeopleAltIcon)}
          <input placeholder='Search' type="text" className="bg-[#202225] border-none rounded-[5px] text-indent-2" />
          {buttons('Inbox', InboxIcon)}
          {buttons('Logout', LogoutIcon)}
        </div>
      </div>
    </>
  );
}

export default Topnav_chat; 