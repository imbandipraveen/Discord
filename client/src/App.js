import Login from "./components/auth/Login";
import Register from "./components/auth/Register";
import Dashboard from "./components/dashboard/Dashboard";
import Auth from "./components/auth/Auth";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Invite from "./components/Invite/Invite";

function App() {
  return (
    <div>
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
    </div>
  );
}

export default App;
