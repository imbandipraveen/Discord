import React from 'react';
import invalid_chat_image from '../../../assets/invalid_server.svg';

function Invalid_chat() {
    return (
        <div className="h-full bg-[#202225] flex justify-center items-center">
            <div className="w-1/2 h-1/2 flex flex-col justify-center items-center text-[#B9BBBE]">
                <div>
                    <img src={invalid_chat_image} alt="" />
                </div>
                <div className="mt-12 text-center flex flex-col items-center">
                    <div className="text-[1.1rem] font-semibold">NO TEXT CHANNELS</div>
                    <div className="w-4/5">You find yourself in a strange place. You don't have access to any text channels or there are none in this server.</div>
                </div>
            </div>
        </div>
    );
}

export default Invalid_chat; 