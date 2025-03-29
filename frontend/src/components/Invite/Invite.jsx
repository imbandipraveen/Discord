import React, { useEffect, useState } from 'react';
import logo from '../../assets/discord_logo_3.png';
import { useParams } from 'react-router-dom';
import CircularProgress from '@mui/material/CircularProgress';
import invalid_link_image from '../../assets/invalid_invite.svg';
import { useSelector } from 'react-redux';
import jwt from 'jwt-decode';
import { useNavigate } from 'react-router-dom';

function Invite() {
  let Navigate = useNavigate();
  let token1 = localStorage.getItem('token');
  let user_creds = jwt(token1);
  const { username, tag, profile_pic, id } = user_creds;

  const { invite_link } = useParams();
  const url = import.meta.env.VITE_API_URL;
  const [invite_details, setinvite_details] = useState(null);
  const [invalid_invite_link, setinvalid_invite_link] = useState(null);

  const accept_invite = async () => {
    const res = await fetch(`${url}/accept_invite`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-auth-token': localStorage.getItem('token'),
      },
      body: JSON.stringify({
        user_details: { username, tag, profile_pic, id },
        server_details: { invite_details }
      }),
    });
    const data = await res.json();
    if (data.status === 200 || data.status === 403) {
      console.log('going');
      Navigate('/channels/@me');
    } else {
      console.log('something went wrong');
    }
  };

  const invite_link_info = async () => {
    const res = await fetch(`${url}/invite_link_info`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-auth-token': localStorage.getItem('token'),
      },
      body: JSON.stringify({
        invite_link
      }),
    });
    const data = await res.json();
    if (data.status === 200) {
      setinvite_details(data);
      setinvalid_invite_link(false);
    } else {
      setinvalid_invite_link(true);
    }
  };

  useEffect(() => {
    invite_link_info();
  }, []);

  return (
    <div className="bg-[hsl(220,calc((1,1)*7.7%),22.9%)] bg-[url('../../assets/login_background.png')] h-screen box-border flex justify-center items-center text-[#B9BBBE]">
      <div className="w-[30rem] p-6 rounded-md bg-[#36393F]">
        {invalid_invite_link === null ? (
          <CircularProgress />
        ) : invalid_invite_link === false ? (
          invite_details === null ? (
            <CircularProgress />
          ) : (
            <>
              <div className="flex justify-center mb-0.5 h-24">
                <img src={logo} alt="" className="rounded-full h-4/5" />
              </div>
              <div className="flex justify-center mb-0.5">{invite_details.inviter_name} invited you to join</div>
              <div className="flex justify-center mb-0.5 gap-2 text-white text-lg font-semibold">
                <div className="flex items-center bg-[#2F3136] rounded-lg text-sm w-8 h-8 justify-center">
                  {invite_details.server_pic === '' ? (
                    invite_details.server_name[0]
                  ) : (
                    <img className="w-full h-full rounded-[15px]" src={invite_details.server_pic} alt="" />
                  )}
                </div>
                <div>{invite_details.server_name}</div>
              </div>
              <div className="flex justify-center mb-0.5">
                <div className="flex ml-4">
                  <div className="w-5.6 flex items-center justify-center">
                    <div className="h-1/2 w-1/2 rounded-full bg-[#3BA55D]" />
                  </div>
                  <div>1 Online</div>
                </div>

                <div className="flex ml-4">
                  <div className="w-5.6 flex items-center justify-center">
                    <div className="h-1/2 w-1/2 rounded-full bg-[#B9BBBE]" />
                  </div>
                  <div>1 Member</div>
                </div>
              </div>
              <div className="flex justify-center mb-0.5">
                <button
                  className="mt-8 border-none bg-[#5865F2] text-white w-full py-2 rounded-md hover:bg-[#707aed]"
                  onClick={() => {
                    if (invite_details.inviter_id === id) {
                      Navigate('/channels/@me');
                    } else {
                      accept_invite();
                    }
                  }}
                >
                  Accept Invite
                </button>
              </div>
            </>
          )
        ) : (
          <>
            <div className="flex justify-center mb-0.5">
              <img src={invalid_link_image} alt="" />
            </div>
            <div className="flex justify-center mb-0.5 text-white font-semibold text-xl mt-4">
              Invite Invalid
            </div>
            <div className="flex justify-center mb-0.5 text-center mb-6">
              This invite may be expired or you might not have permission to join.
            </div>
            <div className="flex justify-center mb-0.5">
              <button className="border-none py-2 px-4 rounded-sm w-full bg-[#5865F2] text-white hover:bg-[#707aed]">
                Continue to Discord Clone
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default Invite; 