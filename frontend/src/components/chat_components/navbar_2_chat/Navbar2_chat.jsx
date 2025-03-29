import React from 'react';
import { useSelector } from 'react-redux';
import Invalid_navbar from '../navbar_2_chat_invalid/Navbar2_chat_invalid';
import Valid_navbar from '../navbar_2_chat_valid/Navbar2_chat_valid';
import Loading from '../../Loading_page/Loading';

function Navbar2_chat() {
  // redux value to check if user is in the particular server or not
  const server_exists = useSelector(state => state.current_page.server_exists);

  return (
    <div className="h-full">
      {server_exists === null ? (
        <Loading />
      ) : server_exists === false ? (
        <Invalid_navbar />
      ) : (
        <Valid_navbar />
      )}
    </div>
  );
}

export default Navbar2_chat; 