import React from 'react';
import friends_icon from '../../../assets/friends.svg';
import InboxIcon from '@mui/icons-material/Inbox';
import HelpIcon from '@mui/icons-material/Help';
import ChatBubbleIcon from '@mui/icons-material/ChatBubble';
import { Tooltip } from '@mui/material';
import { useDispatch } from 'react-redux';
import { setSelectedOption } from '../../../store/slices/selectedOptionSlice';
import LogoutIcon from '@mui/icons-material/Logout';

function Topnav_dashboard({ button_status }) {
  const { pending, all_friends } = button_status;
  const dispatch = useDispatch();

  function change_option_value(option_number, option_name, status, text) {
    dispatch(setSelectedOption({
      value: option_number,
      option_name,
      status,
      text
    }));
  }

  function buttons(message, Icon) {
    return (
      <div 
        className="text-[#B9BBBE] hover:text-white cursor-pointer"
        onClick={() => {
          if (message === 'Logout') {
            localStorage.clear();
            window.location.reload();
          }
        }}
      >
        <Tooltip title={message} placement="bottom">
          <Icon />
        </Tooltip>
      </div>
    );
  }

  return (
    <div className="flex w-full h-full">
      <div className="flex items-center justify-center border-r border-[#4B4D52]">
        <div className="w-[120px] flex items-center justify-center gap-2 text-white cursor-default">
          <img src={friends_icon} alt="Friends" className="h-5 w-5" />
          Friends
        </div>
      </div>

      <div className="flex-1 flex items-center ml-4 gap-4 text-[#B9BBBE] min-w-0 overflow-hidden">
        <div 
          className="px-2 py-1 rounded cursor-pointer hover:bg-[#4B4D52]"
          onClick={() => change_option_value(0, 'ONLINE', false, "No one's around to play with Wumpus.")}
        >
          Online
        </div>
        <div 
          className="px-2 py-1 rounded cursor-pointer hover:bg-[#4B4D52]"
          onClick={() => change_option_value(1, 'ALL FRIENDS', all_friends, "Wumpus is waiting on friends. You don't have to, though!")}
        >
          All
        </div>
        <div 
          className="px-2 py-1 rounded cursor-pointer hover:bg-[#4B4D52]"
          onClick={() => change_option_value(2, 'PENDING', pending, "There are no pending friend requests. Here's Wumpus for now.")}
        >
          Pending
        </div>
        <div 
          className="px-2 py-1 rounded cursor-pointer hover:bg-[#4B4D52]"
          onClick={() => change_option_value(3, 'BLOCKED', false, "You can't unblock the Wumpus.")}
        >
          Blocked
        </div>
        <div 
          className="px-2 py-1 rounded cursor-pointer bg-[#2D7D46] text-white hover:bg-[#479660] min-w-fit"
          onClick={() => change_option_value(4, 'ADD FRIENDS', false, "Wumpus is waiting on friends. You don't have to, though!")}
        >
          Add Friend
        </div>
      </div>

      <div className="flex items-center justify-center gap-4 text-[#B9BBBE] sticky right-0 mr-4">
        {buttons('New Group DM', ChatBubbleIcon)}
        {buttons('Inbox', InboxIcon)}
        {buttons('Logout', LogoutIcon)}
      </div>
    </div>
  );
}

export default Topnav_dashboard; 