import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import Main_dashboard from '../dashboard_components/main_dashboard/Main_dashboard';
import Main_chat from '../chat_components/main_chat/Main_chat';
import socket from '../Socket/Socket';
import { update_options } from '../../Redux/options_slice';
import { useDispatch, useSelector } from 'react-redux';
import CloseIcon from '@mui/icons-material/Close';
import discord_logo from '../../assets/discord_logo_3.png';

function Main({ user_relations }) {
    const dispatch = useDispatch();
    const id = useSelector(state => state.user_info.id);

    const [req_popup, setreq_popup] = useState({ state: 'none', value: false });
    const [req_popup_data, setreq_popup_data] = useState({
        profile_pic: '',
        name: '',
        notif_message: '',
        id: null
    });

    const url = import.meta.env.VITE_API_URL;
    const { server_id } = useParams();

    useEffect(() => {
        if (id !== 0) {
            socket.emit('get_userid', id);
        }
    }, [id]);

    useEffect(() => {
        if (req_popup_data.id !== null) {
            dispatch(update_options());
            setreq_popup({ ...req_popup, value: false });
        }
    }, [req_popup_data.id]);

    socket.on('recieve_req', message => {
        const { sender_name, sender_profile_pic, sender_id } = message;
        setreq_popup_data({
            name: sender_name,
            profile_pic: sender_profile_pic,
            id: sender_id,
            notif_message: 'Sent you a friend Request'
        });
        setreq_popup({ state: 'flex', value: true });
    });

    socket.on('req_accepted_notif', message => {
        const { sender_id, friend_id, friend_profile_pic, friend_name } = message;
        setreq_popup_data({
            name: friend_name,
            profile_pic: friend_profile_pic,
            id: sender_id,
            notif_message: 'Accepted your friend Request'
        });
        setreq_popup({ state: 'flex', value: true });
    });

    return (
        <div className="h-full bg-[#36393F] border-r border-[hsla(217,calc((1,1)*7.6%),33.5%,0.48)] block justify-center items-center">
            <>
                {server_id === '@me' || server_id === undefined ? (
                    <Main_dashboard user_relations={user_relations} />
                ) : (
                    <Main_chat />
                )}
            </>
            <div className={`absolute bottom-4 right-4 bg-[#222326] w-80 h-28 rounded text-white p-2 text-sm animate-[show_notif_0.3s_1] flex flex-col ${req_popup.state === 'none' ? 'hidden' : 'flex'}`}>
                <div className="flex justify-between h-8">
                    <div className="flex items-center gap-2">
                        <img src={discord_logo} alt="" className="h-1/2 rounded-full" />
                        Discord
                    </div>
                    <div className="flex items-center cursor-pointer">
                        <CloseIcon onClick={() => { setreq_popup({ ...req_popup, state: 'none' }) }} fontSize='small'></CloseIcon>
                    </div>
                </div>
                <div className="flex gap-2 mt-2">
                    <div className="h-12">
                        <img src={req_popup_data.profile_pic} alt="" className="h-full w-full" />
                    </div>
                    <div>
                        <div>{req_popup_data.name}</div>
                        <div>{req_popup_data.notif_message}</div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Main; 