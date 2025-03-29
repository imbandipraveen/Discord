import React, { useState, useEffect } from 'react';
import discord_logo from '../../assets/discord_logo_2.svg';
import discord_logo_2 from '../../assets/discord_logo_3.png';
import AddIcon from '@mui/icons-material/Add';
import Modal from 'react-bootstrap/Modal';
import CloseIcon from '@mui/icons-material/Close';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import server_img_1 from '../../assets/new_server.svg';
import server_img_2 from '../../assets/server_image_2.svg';
import server_img_3 from '../../assets/server_image_3.svg';
import server_img_4 from '../../assets/server_image_4.svg';
import server_img_5 from '../../assets/server_image_5.svg';
import server_img_6 from '../../assets/server_image_6.svg';
import server_img_7 from '../../assets/server_image_7.svg';
import server_input from '../../assets/server_image_input.svg';
import { Button } from '@mui/material';
import CircularProgress from '@mui/material/CircularProgress';
import { Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import Tooltip from 'react-bootstrap/Tooltip';
import { setServerRole } from '../../store/slices/currentPageSlice';
import uploadFileToBlob from '../azure-storage-blob';

function Navbar({ new_req_recieved, user_cred }) {
    const dispatch = useDispatch();
    const { username, user_servers } = user_cred;
    const [servers, setservers] = useState([{ server_pic: '', server_name: '', server_id: '' }]);

    useEffect(() => {
        setservers(user_servers);
    }, [user_servers]);

    const [show, setShow] = useState(false);
    const handleClose = () => {
        setShow(false);
        setcurrent_modal(1);
        setsubmit_button({ create_button_state: false, back_button_state: false });
        setnew_server_image_preview(server_input);
    };
    const handleShow = () => setShow(true);

    const template = [
        { text: 'Create My Own', image: server_img_1 },
        { text: 'Gaming', image: server_img_2 },
        { text: 'School Club', image: server_img_3 },
        { text: 'Study Group', image: server_img_4 },
        { text: 'Friends', image: server_img_5 },
        { text: 'Artists & Creators', image: server_img_6 },
        { text: 'Local Community', image: server_img_7 }
    ];

    const [server_details, setserver_details] = useState({
        name: `${username}'s server`,
        type: '',
        key: 0,
        role: 'author'
    });
    const [current_modal, setcurrent_modal] = useState(1);
    const [submit_button, setsubmit_button] = useState({
        create_button_state: false,
        back_button_state: false
    });
    const [new_server_image_preview, setnew_server_image_preview] = useState(server_input);
    const [new_server_image, setnew_server_image] = useState('');

    const url = import.meta.env.VITE_API_URL;

    function update_server_pic(e) {
        let file = e.target.files[0];
        setnew_server_image_preview(URL.createObjectURL(file));
        setnew_server_image(file);
    }

    const create_server = async () => {
        let image_url = '';
        if (new_server_image != '') {
            const file_url = await uploadFileToBlob(new_server_image);
            image_url = file_url;
        }

        const res = await fetch(`${url}/create_server`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-auth-token': localStorage.getItem('token'),
            },
            body: JSON.stringify({
                server_details,
                server_image: image_url
            }),
        });
        const data = await res.json();
        if (data.status == 200) {
            handleClose();
            new_req_recieved(1);
        }
    };

    function first_modal() {
        return (
            <>
                <div className="absolute right-0 mt-2 mr-4 cursor-pointer">
                    <CloseIcon htmlColor='#A7ABB0' onClick={handleClose} fontSize='large'></CloseIcon>
                </div>
                <div className="max-h-[550px] flex flex-col items-center transition-[scaleX(1)_1s_ease-in]">
                    <div className="text-2xl font-bold mt-6">Create a server</div>
                    <div className="w-[85%] text-center text-[#909396] mb-6">
                        Your server is where you and your friends hang out.
                        Make yours and start talking.
                    </div>

                    <div className="w-[95%] overflow-y-scroll">
                        {template.map((elem, index) => {
                            return (
                                <div key={index}>
                                    <div className="w-full flex rounded-lg justify-between items-center font-bold border border-[#d1d4d8] p-1.5 mb-4 hover:bg-[#e5eaec] cursor-pointer" onClick={() => {
                                        setserver_details({ ...server_details, type: elem.text, key: index + 1 });
                                        setcurrent_modal(2);
                                    }}>
                                        <div className="flex items-center gap-4">
                                            <img src={elem.image} alt="" />
                                            {elem.text}
                                        </div>
                                        <div>
                                            <ChevronRightIcon fontSize='large'></ChevronRightIcon>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </>
        );
    }

    function second_modal() {
        return (
            <>
                <div className="absolute right-0 mt-2 mr-4 cursor-pointer">
                    <CloseIcon htmlColor='#A7ABB0' onClick={() => {
                        handleClose();
                        setcurrent_modal(1);
                    }} fontSize='large'>
                    </CloseIcon>
                </div>
                <div className="max-h-[550px] flex flex-col items-center transition-[scaleX(1)_1s_ease-in]">
                    <div className="text-2xl font-bold mt-6">Tell us more about your server</div>
                    <div className="w-[85%] text-center text-[#909396] mb-6">
                        In order to help you with your setup, is your new server for just a few friends or a larger community?
                    </div>

                    <div className="w-[95%] overflow-y-scroll">
                        {template.slice(template.length - 2, template.length).map((elem, index) => {
                            return (
                                <div key={index}>
                                    <div className="w-full flex rounded-lg justify-between items-center font-bold border border-[#d1d4d8] p-1.5 mb-4 hover:bg-[#e5eaec] cursor-pointer" onClick={() => { setcurrent_modal(3); }}>
                                        <div className="flex items-center gap-4">
                                            <img src={elem.image} alt="" />
                                            {elem.text}
                                        </div>
                                        <div>
                                            <ChevronRightIcon fontSize='large'></ChevronRightIcon>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                    <div className="flex gap-0.5 text-sm">
                        Not sure? You can
                        <div className="text-blue-500 cursor-pointer" onClick={() => { setcurrent_modal(3); }}>
                            skip this question
                        </div>
                        for now
                    </div>
                    <div className="w-full flex justify-start mt-8 mb-4 ml-8">
                        <div className="cursor-pointer border-none bg-white" onClick={() => { setcurrent_modal(1); }}>
                            Back
                        </div>
                    </div>
                </div>
            </>
        );
    }

    function third_modal() {
        return (
            <>
                <div className="absolute right-0 mt-2 mr-4 cursor-pointer">
                    <CloseIcon htmlColor='#A7ABB0' onClick={() => {
                        handleClose();
                        setcurrent_modal(1);
                    }} fontSize='large'>
                    </CloseIcon>
                </div>
                <div className="max-h-[550px] flex flex-col items-center transition-[scaleX(1)_1s_ease-in]">
                    <div className="text-2xl font-bold mt-6">Customize your server</div>
                    <div className="w-[85%] text-center text-[#909396] mb-6">
                        Give your new server a personality with a name and an icon. You can always change it later.
                    </div>
                    <div>
                        <label className="cursor-pointer mb-8" htmlFor='update_cover_pic'>
                            <img src={new_server_image_preview} alt="" className="w-40 rounded-full object-cover h-full" />
                        </label>
                        <input onChange={update_server_pic} type="file" id='update_cover_pic' name="image" hidden />
                    </div>

                    <div className="w-[90%] mb-4">
                        <div className="text-sm font-semibold text-[#4F5660] mb-2">SERVER NAME</div>
                        <div>
                            <input onChange={(e) => { setserver_details({ ...server_details, name: e.target.value }); }} value={server_details.name} type="text" className="w-full bg-[#202225] border-none text-white p-2 rounded focus:outline-none" />
                        </div>
                    </div>

                    <div className="w-full flex justify-between mt-8 mb-4 px-8">
                        <button className="cursor-pointer border-none bg-white" disabled={submit_button.back_button_state} onClick={() => { setcurrent_modal(2); }}>
                            Back
                        </button>
                        <Button variant="contained" onClick={() => { create_server(); setsubmit_button({ create_button_state: true, back_button_state: true }); }}>
                            {submit_button.create_button_state == false ?
                                <>Create</>
                                :
                                <>
                                    <CircularProgress size='1.5rem' color='inherit' />
                                </>
                            }
                        </Button>
                    </div>
                </div>
            </>
        );
    }

    return (
        <div className="bg-[hsl(216,calc((1,1)*7.2%),13.5%)] h-full text-[#DCDDDE] overflow-y-scroll [&::-webkit-scrollbar]:w-0">
            <div className="pt-2.5">
                <div>
                    <Link to={'/channels/@me'} className="grid grid-cols-[0.3fr_2fr_0.5fr] h-12 mb-4 relative text-white no-underline">
                        <div className="flex">
                            <div className="h-[80%] w-1/2 flex self-center bg-white rounded-l-none rounded-r-md"></div>
                        </div>
                        <div className="bg-[#5865F2] rounded-full ml-0.5 flex justify-center items-center cursor-pointer transition-[border-radius_0.2s] text-2xl hover:rounded-[15px]">
                            <img src={discord_logo} alt="" className="h-[60%] w-[60%] rounded-none object-fill" />
                        </div>
                    </Link>

                    <div className="h-auto overflow-y-scroll [&::-webkit-scrollbar]:hidden">
                        {servers.map((elem, index) => {
                            return (
                                <Link key={index} to={`/channels/${elem.server_id}`} className="grid grid-cols-[0.3fr_2fr_0.5fr] h-12 mb-4 relative text-white no-underline">
                                    <div className="flex">
                                        <div className="h-[80%] w-1/2 flex self-center bg-white rounded-l-none rounded-r-md"></div>
                                    </div>
                                    <div className="bg-[#36393F] rounded-full ml-0.5 flex justify-center items-center cursor-pointer transition-[border-radius_0.2s] text-2xl hover:rounded-[15px] hover:text-white">
                                        <img src={elem.server_pic} alt="" className="h-full w-full rounded-full transition-[border-radius_0.2s] object-cover hover:rounded-[15px]" />
                                    </div>
                                </Link>
                            );
                        })}
                    </div>

                    <div className="grid grid-cols-[0.3fr_2fr_0.5fr] h-12 mb-4 relative text-white no-underline">
                        <div className="flex">
                            <div className="h-[80%] w-1/2 flex self-center bg-white rounded-l-none rounded-r-md"></div>
                        </div>
                        <div className="bg-[#36393F] rounded-full ml-0.5 flex justify-center items-center cursor-pointer transition-[border-radius_0.2s] text-2xl hover:rounded-[15px] hover:text-white text-[#3BA55D] hover:bg-[#3BA55D] hover:text-white" onClick={handleShow}>
                            <AddIcon fontSize='large'></AddIcon>
                        </div>
                    </div>
                </div>
            </div>

            <Modal show={show} centered onHide={handleClose} className="max-w-[450px]">
                <div className="relative">
                    {current_modal === 1 && first_modal()}
                    {current_modal === 2 && second_modal()}
                    {current_modal === 3 && third_modal()}
                </div>
            </Modal>
        </div>
    );
}

export default Navbar; 