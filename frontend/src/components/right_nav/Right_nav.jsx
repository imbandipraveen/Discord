import React from 'react';
import { useParams } from 'react-router-dom';
import Rightnav_chat from '../chat_components/rightnav_chat/Rightnav_chat';
import Rightnav_dashboard from '../dashboard_components/rightnav_dashboard/Rightnav_dashboard';

function Right_nav() {
  const { server_id } = useParams();
  
  return (
    <div className="bg-[#36393F] h-full flex justify-center border-l border-[#565757]">
      <div className="w-[95%] text-white">
        <>
          {server_id === '@me' || server_id === undefined ? (
            <Rightnav_dashboard />
          ) : (
            <Rightnav_chat />
          )}
        </>
      </div>
    </div>
  );
}

export default Right_nav; 