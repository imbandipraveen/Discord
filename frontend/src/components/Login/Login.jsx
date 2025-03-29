import React, { useState } from 'react';
import discord_logo from '../../assets/discord_logo.svg';
import { Link } from 'react-router-dom';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Collapse from '@mui/material/Collapse';
import CloseIcon from '@mui/icons-material/Close';
import Alert from '@mui/material/Alert';
import { useNavigate } from 'react-router-dom';

function Login() {
    const Navigate = useNavigate();
    const [user_values, setuser_values] = useState({ email: '', password: '' });
    const [alert_box, setalert_box] = React.useState(false);
    const [alert_message, setalert_message] = useState('');
    const url = import.meta.env.VITE_API_URL;

    const handle_user_values = (e) => {
        const name = e.target.name;
        const value = e.target.value;
        setuser_values({ ...user_values, [name]: value });
    };

    const login_req = async (e) => {
        e.preventDefault();
        const { email, password } = user_values;

        const res = await fetch(`${url}/api/auth/signin`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                email, password
            }),
        });

        const data = await res.json();

        if (data.status === 442) {
            setalert_message('Invalid username or password');
            setalert_box(true);
        } else if (data.status === 201) {
            localStorage.setItem('token', data.token);
            Navigate('/channels/@me');
        } else if (data.status === 422) {
            setalert_message('Not verified yet');
            setalert_box(true);
        }
    };

    return (
        <>
            {/* Alert Box */}
            <Box sx={{ width: '100%', height: '0px' }}>
                <Collapse in={alert_box}>
                    <Alert
                        action={
                            <IconButton
                                aria-label="close"
                                color="inherit"
                                size="small"
                                onClick={() => {
                                    setalert_box(false);
                                }}
                            >
                                <CloseIcon fontSize="inherit" />
                            </IconButton>
                        }
                        sx={{ mb: 2 }}
                    >
                        {alert_message}
                    </Alert>
                </Collapse>
            </Box>

            {/* Sign in form */}
            <form onSubmit={login_req} className="min-h-screen bg-[#2f3136] bg-[url('../../assets/login_background.png')] flex justify-center items-center">
                <div className="w-[30%] min-w-[500px] bg-[#2f3136] rounded-lg">
                    <div className="h-full m-8">
                        <div className="hidden justify-center mb-6 md:flex">
                            <img src={discord_logo} alt="Discord Logo" />
                        </div>

                        <h2 className="text-white text-center mb-0">Welcome Back!</h2>
                        <div className="text-[#B9BBBE] text-center mb-4">We're so excited to see you again</div>

                        <div className="text-[#B9BBBE] font-bold text-sm mb-2">EMAIL</div>
                        <div className="h-10 mb-4">
                            <input
                                onChange={handle_user_values}
                                name="email"
                                value={user_values.email}
                                type="email"
                                required
                                className="bg-[#191b20] border-none h-full text-white rounded w-full px-4 focus:outline-none"
                            />
                        </div>

                        <div className="text-[#B9BBBE] font-bold text-sm mb-2">PASSWORD</div>
                        <div className="h-10 mb-2">
                            <input
                                onChange={handle_user_values}
                                name="password"
                                value={user_values.password}
                                type="password"
                                required
                                className="bg-[#191b20] border-none h-full text-white rounded w-full px-4 focus:outline-none"
                            />
                        </div>

                        <div className="text-[#00AFFA] font-bold text-sm mb-4 cursor-pointer">
                            Forgot your password?
                        </div>

                        <div>
                            <button
                                type="submit"
                                className="bg-[#5865F2] font-semibold border-none text-white w-full h-10 rounded mb-2 cursor-pointer hover:bg-[#727ce8] transition-colors"
                            >
                                Log In
                            </button>
                        </div>

                        <div className="flex gap-1 font-semibold">
                            <div className="text-[#B9BBBE] cursor-default">Need an account?</div>
                            <Link to="/register" className="text-[#00AFFA] cursor-pointer no-underline hover:underline">
                                Register
                            </Link>
                        </div>
                    </div>
                </div>
            </form>
        </>
    );
}

export default Login; 