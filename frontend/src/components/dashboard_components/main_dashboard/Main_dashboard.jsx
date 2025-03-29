import React, { useEffect, useState } from 'react';
import SearchIcon from '@mui/icons-material/Search';
import ChatBubbleIcon from '@mui/icons-material/ChatBubble';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { Tooltip } from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import online_wumpus from '../../../assets/online.svg';
import friends_wumpus from '../../../assets/friends_2.svg';
import pending_wumpus from '../../../assets/pending.svg';
import blocked_wumpus from '../../../assets/blocked.svg';
import add_friend_wumpus from '../../../assets/friends_2.svg';
import DoneIcon from '@mui/icons-material/Done';
import CloseIcon from '@mui/icons-material/Close';
import PersonRemoveIcon from '@mui/icons-material/PersonRemove';
import { update_options } from '../../../store/slices/optionsSlice';
import socket from '../../Socket/Socket';

function Main_dashboard({ user_relations }) {
    const dispatch = useDispatch();
    const option_check = useSelector(state => state.selected_option.value);
    const option_name_check = useSelector(state => state.selected_option.option_name);
    const option_status = useSelector(state => state.selected_option.status);
    const option_text = useSelector(state => state.selected_option.text);

    const username = useSelector(state => state.user_info.username);
    const profile_pic = useSelector(state => state.user_info.profile_pic);
    const id = useSelector(state => state.user_info.id);

    const [button_state, setbutton_state] = useState(true);
    const [option_data, setoption_data] = useState([{ username: '', tag: '', profile_pic: '', status: '' }]);
    const [input, setinput] = useState('');
    let images_arr = [online_wumpus, friends_wumpus, pending_wumpus, blocked_wumpus, add_friend_wumpus];
    const [image, setimage] = useState(images_arr[0]);
    const [alert, setalert] = useState({ style: 'none', message: 'none' });

    const { incoming_reqs, outgoing_reqs, friends } = user_relations;
    let pending_reqs = [...incoming_reqs, ...outgoing_reqs];
    const url = import.meta.env.VITE_API_URL;

    useEffect(() => {
        if (option_check == 2) {
            setoption_data(pending_reqs);
        } else if (option_check == 1) {
            setoption_data(friends);
        }
    }, [user_relations, option_check]);

    const button_clicked = async (message, friend_data) => {
        const res = await fetch(`${url}/process_req`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-auth-token': localStorage.getItem('token'),
            },
            body: JSON.stringify({
                friend_data: friend_data,
                message: message
            }),
        });
        const data = await res.json();

        if (data.status == 200 || data.status == 404) {
            dispatch(update_options());
            if (data.status == 200) {
                socket.emit('req_accepted', id, friend_data.id, username, profile_pic);
            }
        }
    };

    function buttons(message, Icon, friend_data) {
        return (
            <div 
                className="flex items-center justify-center w-8 h-8 rounded-full hover:bg-[#4F545C] cursor-pointer"
                onClick={() => { button_clicked(message, friend_data); }}
            >
                <Tooltip title={message} placement="top">
                    <Icon className="text-[#B9BBBE] hover:text-white" />
                </Tooltip>
            </div>
        );
    }

    const add_friend = async (e) => {
        e.preventDefault();
        const res = await fetch(`${url}/add_friend`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-auth-token': localStorage.getItem('token'),
            },
            body: JSON.stringify({
                friend_tag: input,
                user_details: { username, tag: '', profile_pic, id }
            }),
        });
        const data = await res.json();
        if (data.status === 200) {
            setalert({ style: 'block', message: 'Friend request sent!' });
            setinput('');
            setTimeout(() => {
                setalert({ style: 'none', message: 'none' });
            }, 3000);
        } else {
            setalert({ style: 'block', message: data.message });
            setTimeout(() => {
                setalert({ style: 'none', message: 'none' });
            }, 3000);
        }
    };

    useEffect(() => {
        if (input.length >= 1) {
            setbutton_state(false);
        } else {
            setbutton_state(true);
        }
    }, [input]);

    function handle_input(e) {
        setinput(e.target.value);
        setalert({ ...alert, style: 'none' });
        let current_key = e.nativeEvent.data;
        let input_size = input.length;

        if (input[input_size - 1] == '#' && /[0-9]/.test(current_key) == false && current_key != null) {
            setinput(input);
        } else if ((input[input_size - 5] == '#' && /[a-zA-z0-9]/.test(current_key) == true && current_key != null) || (input[input_size - 5] == '#' && /[^a-zA-z0-9]/.test(current_key) == true && current_key != null)) {
            setinput(input);
        }
    }

    useEffect(() => {
        setimage(images_arr[option_check]);
    }, [option_check]);

    return (
        <div className="h-full bg-[#36393F] border-r border-[#565757] relative">
            <div className="p-6 border-b border-[#565757]">
                <div className="mb-3">
                    <div className="text-white font-bold text-lg">Add Friend</div>
                    <div className="text-[#B9BBBE] text-sm">
                        You can add a friend with their Discord Tag.
                    </div>
                </div>
                <form onSubmit={add_friend} className="flex justify-between bg-[#202225] h-12 rounded-lg">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setinput(e.target.value)}
                        placeholder="Enter a Username#0000"
                        className="ml-4 bg-transparent border-none w-1/2 text-[#B9BBBE] font-bold focus:outline-none placeholder-[#72767D]"
                    />
                    <button
                        type="submit"
                        disabled={button_state}
                        className="bg-[#5865F2] text-white w-40 m-1 rounded hover:bg-[#4752C4] transition-colors disabled:bg-[#3C438B] disabled:text-[#8E8F92] disabled:cursor-not-allowed"
                    >
                        Send Friend Request
                    </button>
                </form>
                <div className={`mt-2 text-green-500 ${alert.style}`}>
                    {alert.message}
                </div>
            </div>

            <div className="flex flex-col h-[calc(100%-8rem)]">
                <div className="flex items-center justify-between p-4 border-b border-[#565757]">
                    <div className="text-white font-semibold">All Friends</div>
                    <div className="flex gap-2">
                        <SearchIcon className="text-[#B9BBBE] hover:text-white cursor-pointer" />
                        <ChatBubbleIcon className="text-[#B9BBBE] hover:text-white cursor-pointer" />
                        <MoreVertIcon className="text-[#B9BBBE] hover:text-white cursor-pointer" />
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto">
                    {option_data.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full">
                            <img src={image} alt="No Friends" className="w-48 h-48 mb-4" />
                            <div className="text-white text-xl font-semibold mb-2">
                                {option_name_check}
                            </div>
                            <div className="text-[#B9BBBE] text-center w-3/4">
                                {option_text}
                            </div>
                        </div>
                    ) : (
                        option_data.map((friend, index) => (
                            <div key={index} className="flex items-center justify-between p-3 hover:bg-[#32353B]">
                                <div className="flex items-center gap-3">
                                    <div className="relative">
                                        <img
                                            src={friend.profile_pic}
                                            alt={friend.username}
                                            className="w-10 h-10 rounded-full"
                                        />
                                        <div className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-[#36393F] ${
                                            friend.status === 'online' ? 'bg-[#43B581]' : 'bg-[#72767D]'
                                        }`} />
                                    </div>
                                    <div>
                                        <div className="text-white font-medium">{friend.username}</div>
                                        <div className="text-[#B9BBBE] text-sm">{friend.status}</div>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    {option_check === 2 && friend.status === 'pending' && (
                                        <>
                                            {buttons('Accept', DoneIcon, friend)}
                                            {buttons('Decline', CloseIcon, friend)}
                                        </>
                                    )}
                                    {option_check === 1 && (
                                        buttons('Remove Friend', PersonRemoveIcon, friend)
                                    )}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}

export default Main_dashboard; 