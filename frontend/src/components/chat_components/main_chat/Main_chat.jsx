import React from 'react';
import Invalid_chat from '../invalid_main_chat/Invalid_chat';
import Valid_chat from '../valid_main_chat/Valid_chat';
import { useSelector } from 'react-redux';
import Loading from '../../Loading_page/Loading';

function Main_chat() {
    const server_exists = useSelector(state => state.current_page.server_exists);

    return (
        <div className="h-full">
            {server_exists === null ? (
                <Loading />
            ) : server_exists === false ? (
                <Invalid_chat />
            ) : (
                <Valid_chat />
            )}
        </div>
    );
}

export default Main_chat; 