import React from 'react';

function Loading() {
    return (
        <div className="h-screen bg-black relative">
            <div className="relative h-full w-full flex justify-center items-center">
                <div className="absolute top-[60%] text-white">Loading...</div>
                <div className="w-12 h-12 m-auto absolute">
                    <div className="w-12 h-5 bg-black opacity-25 absolute top-[60px] left-0 rounded-full animate-[shadow_0.5s_linear_infinite]"></div>
                    <div className="w-full h-full bg-white absolute top-0 left-0 rounded animate-[bxSpin_0.5s_linear_infinite]"></div>
                </div>
            </div>
        </div>
    );
}

export default Loading; 