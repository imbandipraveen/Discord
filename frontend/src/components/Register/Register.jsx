import * as React from 'react';
import Box from '@mui/material/Box';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import { useState, useEffect } from 'react';
import discord_logo from '../../assets/discord_logo.svg';
import plane from '../../assets/plane.png';
import { Link } from 'react-router-dom';
import Alert from '@mui/material/Alert';
import IconButton from '@mui/material/IconButton';
import Collapse from '@mui/material/Collapse';
import CloseIcon from '@mui/icons-material/Close';
import { useNavigate } from 'react-router-dom';
import Modal from '@mui/material/Modal';

function Register() {
    const Navigate = useNavigate();
    const [days, setdays] = useState([]);
    const [year, setyear] = useState([]);
    const [otp_value, setotp_value] = useState('');
    const [modalShow, setModalShow] = React.useState(false);
    const [alert_box, setalert_box] = React.useState(false);
    const [alert_message, setalert_message] = useState('');
    const [date_validation, setdate_validation] = useState({
        display: 'none'
    });
    const [user_values, setuser_values] = useState({
        date_value: '',
        year_value: '',
        month_value: '',
        username: '',
        password: '',
        email: ''
    });

    const months = ["January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];
    const url = import.meta.env.VITE_API_URL;

    const register_req = async (e) => {
        e.preventDefault();
        var dob = (`${user_values.month_value} ${user_values.date_value}, ${user_values.year_value}`);
        const d = new Date(dob);
        let day = d.getDate();

        if (user_values.date_value !== day) {
            setdate_validation({
                display: 'flex'
            });
        } else {
            setdate_validation({
                display: 'none'
            });

            const { email, password, username } = user_values;

            const res = await fetch(`${url}/api/auth/signup`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email, password, username, dob
                }),
            });

            const data = await res.json();

            if (data.status === 201) {
                setModalShow(true);
            } else if (data.status === 202) {
                setalert_message('User Already Exists');
                setalert_box(true);
            } else if (data.status === 204) {
                setalert_message('Field is empty');
                setalert_box(true);
            } else if (data.status === 400) {
                setalert_message('Password must be at least 7 characters long');
                setalert_box(true);
            }
        }
    };

    const handle_user_values = (e) => {
        const name = e.target.name;
        const value = e.target.value;
        setuser_values({ ...user_values, [name]: value });
    };

    const handle_otp = (e) => {
        setotp_value(e.target.value);
    };

    useEffect(() => {
        var min_date = `${(new Date().getFullYear())}`;

        if (year.length < 100) {
            for (let index = min_date - 18; index > (min_date - 118); index--) {
                setyear(year => [...year, index]);
            }
        }

        if (days.length < 32) {
            for (let index = 1; index < 32; index++) {
                setdays(days => [...days, index]);
            }
        }
    }, []);

    const verify_req = async (e) => {
        e.preventDefault();

        const res = await fetch(`${url}/api/auth/verify`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                otp_value,
                email: user_values.email
            }),
        });

        const data = await res.json();

        if (data.status === 201) {
            Navigate('/');
        } else if (data.status === 432) {
            setalert_message('Incorrect OTP try again');
            setalert_box(true);
        } else if (data.status === 442) {
            setalert_message('Your current OTP has been expired, New OTP is sent to your email');
            setalert_box(true);
        }
    };

    return (
        <div className="min-h-screen bg-[#2f3136] bg-[url('../../assets/login_background.png')] flex justify-center items-center">
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

            <form onSubmit={register_req} className="w-[30%] min-w-[500px] bg-[#2f3136] rounded-lg p-8">
                <div className="flex flex-col">
                    <div className="hidden justify-center mb-6">
                        <img src={discord_logo} alt="Discord Logo" />
                    </div>

                    <h2 className="text-white text-center mb-6 text-2xl font-semibold">Create an account</h2>

                    <label className="text-[#B9BBBE] font-bold text-sm mb-2">EMAIL</label>
                    <input
                        name="email"
                        type="email"
                        onChange={handle_user_values}
                        value={user_values.email}
                        required
                        className="bg-[#191b20] text-white h-10 rounded mb-4 px-4 focus:outline-none"
                    />

                    <label className="text-[#B9BBBE] font-bold text-sm mb-2">USERNAME</label>
                    <input
                        name="username"
                        onChange={handle_user_values}
                        value={user_values.username}
                        type="text"
                        required
                        className="bg-[#191b20] text-white h-10 rounded mb-4 px-4 focus:outline-none"
                    />

                    <label className="text-[#B9BBBE] font-bold text-sm mb-2">PASSWORD</label>
                    <input
                        name="password"
                        onChange={handle_user_values}
                        value={user_values.password}
                        type="password"
                        required
                        className="bg-[#191b20] text-white h-10 rounded mb-4 px-4 focus:outline-none"
                    />

                    <label className="text-[#B9BBBE] font-bold text-sm mb-2">DATE OF BIRTH</label>
                    <div className="grid grid-cols-3 gap-4 mb-6">
                        <Box className="rounded-lg bg-[#191b20]">
                            <FormControl fullWidth required>
                                <InputLabel id="date-label" className="text-[#B9BBBE]">Date</InputLabel>
                                <Select
                                    labelId="date-label"
                                    value={user_values.date_value}
                                    onChange={handle_user_values}
                                    label="Date"
                                    name="date_value"
                                    className="text-[#B9BBBE]"
                                >
                                    {days.map((elem, index) => (
                                        <MenuItem key={index} value={elem} className="text-[#B9BBBE]">{elem}</MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Box>

                        <Box className="rounded-lg bg-[#191b20]">
                            <FormControl fullWidth required>
                                <InputLabel id="month-label" className="text-[#B9BBBE]">Month</InputLabel>
                                <Select
                                    labelId="month-label"
                                    value={user_values.month_value}
                                    onChange={handle_user_values}
                                    label="Month"
                                    name="month_value"
                                    className="text-[#B9BBBE]"
                                >
                                    {months.map((elem, index) => (
                                        <MenuItem key={index} value={elem} className="text-[#B9BBBE]">{elem}</MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Box>

                        <Box className="rounded-lg bg-[#191b20]">
                            <FormControl fullWidth required>
                                <InputLabel id="year-label" className="text-[#B9BBBE]">Year</InputLabel>
                                <Select
                                    labelId="year-label"
                                    value={user_values.year_value}
                                    onChange={handle_user_values}
                                    label="Year"
                                    name="year_value"
                                    className="text-[#B9BBBE]"
                                >
                                    {year.map((elem, index) => (
                                        <MenuItem key={index} value={elem} className="text-[#B9BBBE]">{elem}</MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Box>
                    </div>

                    <div className={`text-red-500 text-sm ${date_validation.display}`}>
                        Please enter a valid date
                    </div>

                    <button
                        type="submit"
                        className="bg-[#5865F2] text-white font-semibold h-10 rounded mb-2 hover:bg-[#727ce8] transition-colors"
                    >
                        Continue
                    </button>

                    <div className="flex gap-1 font-semibold mt-4">
                        <span className="text-[#B9BBBE] cursor-default">Already have an account?</span>
                        <Link to="/" className="text-[#00AFFA] hover:underline">
                            Login
                        </Link>
                    </div>
                </div>
            </form>

            <Modal
                open={modalShow}
                onClose={() => setModalShow(false)}
                aria-labelledby="modal-modal-title"
                aria-describedby="modal-modal-description"
                className="flex items-center justify-center"
            >
                <div className="bg-[#35353F] text-white p-8 rounded-lg max-w-[400px]">
                    <div className="flex justify-center mb-4">
                        <img src={plane} alt="Plane" className="-mt-12" />
                    </div>
                    <h2 className="text-center font-bold text-lg mb-4">Check your email</h2>
                    <p className="text-center mb-4">
                        We've sent you an email with your verification code.
                    </p>
                    <input
                        type="text"
                        value={otp_value}
                        onChange={handle_otp}
                        className="w-full h-8 bg-[#191b20] text-white rounded px-4 mb-4 focus:outline-none"
                        placeholder="Enter verification code"
                    />
                    <div className="flex justify-center">
                        <button
                            onClick={verify_req}
                            className="bg-[#727ce8] text-white w-1/2 h-8 rounded hover:bg-[#5865F2] transition-colors"
                        >
                            Verify
                        </button>
                    </div>
                </div>
            </Modal>
        </div>
    );
}

export default Register; 