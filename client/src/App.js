import Login from "./components/auth/Login";
import Register from "./components/auth/Register";
import Dashboard from "./components/dashboard/Dashboard";
import Auth from "./components/auth/Auth";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Invite from "./components/pages/Invite";
import { useDispatch, useSelector } from "react-redux";
import { useEffect } from "react";
import socket from "./components/socket/Socket";
import { setIncomingRequests } from "./redux/userCredsSlice";

function App() {
  const dispatch = useDispatch();
  const { id, username, profile_pic } = useSelector((state) => state.user_info);
  console.log(id, username, profile_pic);

  // Join personal room after login
  useEffect(() => {
    if (socket && id) {
      console.log("joined");
      socket.emit("get_userid", id);
    }
  }, [id]);

  // Listen for incoming friend requests
  const incomingRequests = useSelector(
    (state) => state.user_info.incomingRequests
  );

  useEffect(() => {
    if (!socket) return;

    socket.on("recieve_req", (data) => {
      const newRequest = {
        id: data.sender_id,
        username: data.sender_name,
        profile_pic: data.sender_profile_pic,
        status: "incoming",
      };

      dispatch(setIncomingRequests([...incomingRequests, newRequest]));
    });

    return () => {
      socket.off("recieve_req");
    };
  }, [dispatch, incomingRequests]);

  return (
    <Router>
      <Routes>
        <Route element={<Auth />}>
          <Route path="/" element={<Login />} />
          <Route exact path="/channels/:server_id" element={<Dashboard />} />
          <Route
            exact
            path="/channels/@me/:friend_id"
            element={<Dashboard />}
          />
          <Route exact path="/invite/:invite_link" element={<Invite />} />
        </Route>
        <Route exact path="/register" element={<Register />} />
      </Routes>
    </Router>
  );
}

export default App;
