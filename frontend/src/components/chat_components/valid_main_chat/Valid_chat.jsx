import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import TagIcon from '@mui/icons-material/Tag';
import socket from '../../Socket/Socket';
import logo from '../../../assets/discord_logo_3.png';
import { useParams } from 'react-router-dom';

function Valid_chat() {
    const url = import.meta.env.VITE_API_URL;
    const { server_id } = useParams();

    // channel creds from redux
    const channel_id = useSelector(state => state.current_page.page_id);
    const channel_name = useSelector(state => state.current_page.page_name);

    // user creds from redux
    const username = useSelector(state => state.user_info.username);
    const tag = useSelector(state => state.user_info.tag);
    const profile_pic = useSelector(state => state.user_info.profile_pic);
    const id = useSelector(state => state.user_info.id);

    // message
    const [chat_message, setchat_message] = useState('');
    const [all_messages, setall_messages] = useState(null);
    const [latest_message, setlatest_message] = useState(null);

    useEffect(() => {
        socket.emit('join_chat', channel_id);
    }, [channel_id]);

    function send_message(e) {
        if (e.code === 'Enter') {
            let message_to_send = chat_message;
            let timestamp = Date.now();
            setchat_message('');
            if (all_messages != null) {
                setall_messages([...all_messages, {
                    content: message_to_send,
                    sender_id: id,
                    sender_name: username,
                    sender_pic: profile_pic,
                    timestamp: timestamp
                }]);
            } else {
                setall_messages([{
                    content: message_to_send,
                    sender_id: id,
                    sender_name: username,
                    sender_pic: profile_pic,
                    timestamp: timestamp
                }]);
            }
            socket.emit('send_message', channel_id, message_to_send, timestamp, username, tag, profile_pic);
            store_message(message_to_send, timestamp);
        }
    }

    const store_message = async (chat_message, timestamp) => {
        const res = await fetch(`${url}/store_message`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-auth-token': localStorage.getItem('token'),
            },
            body: JSON.stringify({
                message: chat_message,
                server_id,
                channel_id,
                channel_name,
                timestamp,
                username,
                tag,
                id,
                profile_pic
            }),
        });
        const data = await res.json();
        if (data.status === 200) {
            console.log('message stored');
        }
    };

    useEffect(() => {
        if (channel_id !== '') {
            setall_messages(null);
            get_messages();
        }
    }, [channel_id]);

    const get_messages = async () => {
        const res = await fetch(`${url}/get_messages`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-auth-token': localStorage.getItem('token'),
            },
            body: JSON.stringify({
                channel_id,
                server_id
            }),
        });
        const data = await res.json();
        if (data.chats.length !== 0) {
            setall_messages(data.chats);
        }
    };

    useEffect(() => {
        if (latest_message != null) {
            let { message, timestamp, sender_name, sender_tag, sender_pic } = latest_message.message_data;
            setall_messages([...all_messages, {
                content: message,
                sender_id: sender_pic,
                sender_name: sender_name,
                sender_pic: sender_pic,
                timestamp: timestamp
            }]);
        }
    }, [latest_message]);

    socket.on('recieve_message', message_data => {
        console.log(message_data, 'this is message');
        setlatest_message(message_data);
    });

    return (
        <div className="bg-[#36393F] h-full relative grid grid-rows-[90%_10%]">
            <div className="flex flex-col justify-end">
                <div className="min-h-fit ml-4 pt-4 overflow-y-scroll">
                    <div className="w-fit p-4 rounded-full bg-[#4F545C] text-white">
                        <TagIcon fontSize='large'></TagIcon>
                    </div>
                    <div className="text-white text-[2.5rem] font-semibold">Welcome to #{channel_name}</div>
                    <div className="text-[#B9BBBE] text-[0.9rem] font-semibold">This is the start of the #{channel_name} channel</div>

                    {
                        all_messages != null ?
                            all_messages.map((elem, index) => {
                                let timestamp_init = parseInt(elem.timestamp, 10);
                                const date = new Date(timestamp_init);
                                var timestamp = date.toDateString() + ", " + date.getHours() + ":" + date.getMinutes();
                                return (
                                    <div className="grid grid-cols-[5rem_auto] min-h-[55px] text-white mt-4">
                                        <div className="h-full w-full flex justify-center">
                                            <div className="h-full w-4/5 relative flex justify-center items-center">
                                                <img className="h-4/5 w-auto rounded-full absolute" src={elem.sender_pic} alt="" />
                                            </div>
                                        </div>
                                        <div className="flex flex-col justify-center">
                                            <div className="flex items-center gap-4">
                                                <div className="font-semibold">{elem.sender_name}</div>
                                                <div className="text-[#B9BBBE] text-[0.8rem] font-semibold">{timestamp}</div>
                                            </div>
                                            <div className="text-[#B9BBBE]">{elem.content}</div>
                                        </div>
                                    </div>
                                );
                            })
                            :
                            <></>
                    }
                </div>
            </div>

            <div className="absolute bottom-2.5 p-4 w-[98%] h-10 ml-2 flex items-center bg-[#40444B] rounded-[5px]">
                <AddCircleIcon htmlColor='#B9BBBE'></AddCircleIcon>
                <input type="text" onKeyDown={(e) => { send_message(e) }} value={chat_message} onChange={(e) => { setchat_message(e.target.value) }} placeholder={`Message #${channel_name}`} className="bg-[#40444B] w-full border-none text-indent-4 caret-white text-[#C9CACC] placeholder:text-[#70747B] focus:outline-none" />
            </div>
        </div>
    );
}

export default Valid_chat; 