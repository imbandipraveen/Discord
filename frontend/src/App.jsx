import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './components/Login/Login';
import Register from './components/Register/Register';
import Dashboard from './components/dashboard/Dashboard';
import Auth from './components/auth/Auth';
import Invite from './components/Invite/Invite';
import './App.css';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-discord-dark">
        <Routes>
          <Route element={<Auth />}>
            <Route path="/" element={<Login />} />
            <Route path="/channels/:server_id" element={<Dashboard />} />
            <Route path="/invite/:invite_link" element={<Invite />} />
          </Route>
          <Route path="/register" element={<Register />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
