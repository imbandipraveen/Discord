import React from 'react'
import { useSelector } from 'react-redux';

function Rightnav_chat() {
  const all_users = useSelector(state => state.current_page.members)

  return (
    <div className="mx-4 mt-4">
      <div className="h-full">
        <div className="text-[#B9B9B9] text-[0.8rem] font-semibold">
          ALL MEMBERS - {all_users.length}
        </div>
        <div className="h-full">
          {
            all_users.map((elem, key) => {
              return (
                <div key={key} className="h-12 mt-2 flex gap-2 items-center">
                  <img src={elem.user_profile_pic} alt="" className="h-[70%] rounded-full object-contain" />
                  {elem.user_name}
                </div>
              )
            })
          }
        </div>
      </div>
    </div>
  )
}

export default Rightnav_chat 