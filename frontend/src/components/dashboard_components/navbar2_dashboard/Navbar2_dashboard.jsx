import React from 'react'
import person_icon from '../../../assets/friends.svg'
import AddIcon from '@mui/icons-material/Add';
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import Tooltip from 'react-bootstrap/Tooltip';
import offline_icon from '../../../assets/offline_status.svg'
import { useSelector } from 'react-redux';

function Navbar_2_dashboard() {
  const profile_pic = useSelector(state => state.user_info.profile_pic)

  const renderTooltip = (props) => (
    <Tooltip id="button-tooltip" {...props}>
      Create DM
    </Tooltip>
  );

  return (
    <div>
      <div className="h-12 flex justify-center items-center border-b-2 border-[#202225] box-content">
        <div className="flex justify-start text-indent-2.5 items-center w-[90%] h-[65%] bg-[#202225] text-[#A3A6AA] rounded-[5px] text-[0.9rem] cursor-pointer">
          Find or start a conversation
        </div>
      </div>

      <div className="h-[70px] flex justify-center items-center">
        <div className="flex items-center gap-2 text-base w-[95%] h-[45px] rounded-[5px] bg-[#4b4d50] text-white">
          <img className="ml-4 h-1/2 w-fit" src={person_icon} alt="" />
          Friends
        </div>
      </div>

      <div className="grid grid-cols-[85%_15%] text-[#B9BBBE] text-[0.8rem] mb-4">
        <div className="flex items-center ml-6 cursor-pointer hover:text-white">
          DIRECT MESSAGES
        </div>
        <div className="flex text-white cursor-pointer">
          <OverlayTrigger
            placement="top"
            overlay={renderTooltip}>
            <AddIcon fontSize='small' />
          </OverlayTrigger>
        </div>
      </div>

      {/* this area shows any dm which you have done to anyone in past time whether friend or not */}
      <div className="mb-0.5">
        <div className="h-12 flex cursor-pointer mx-4 hover:bg-[#4b4d50] hover:rounded-[5px]">
          <div className="w-[20%] ml-[3%] flex items-center">
            <div className="h-[35px] w-[35px] relative">
              <img src={profile_pic} alt="" className="h-full w-full rounded-full" />
              <div className="bg-[#2F3136] h-[15px] w-[15px] rounded-full ml-[60%] relative z-[1] p-[0.1rem] bottom-[30%] group-hover:bg-[#4b4d50]">
                <img src={offline_icon} className="h-full w-full flex text-[#747F8D] font-black" alt="" />
              </div>
            </div>
          </div>
          <div className="flex items-center w-[80%] text-[#DCDDD9] font-medium text-[0.9rem]">
            spidy
          </div>
        </div>
      </div>
    </div>
  )
}

export default Navbar_2_dashboard 