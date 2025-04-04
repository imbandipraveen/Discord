import React, { useState, useEffect } from "react";
import registercss from "./register.module.css";
import {
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Alert,
} from "@mui/material";
import { Link, useNavigate } from "react-router-dom";
import Modal from "react-bootstrap/Modal";
import IconButton from "@mui/material/IconButton";
import Collapse from "@mui/material/Collapse";
import CloseIcon from "@mui/icons-material/Close";
import plane from "../../images/plane.png";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import config from "../../config/config";

function Register() {
  const navigate = useNavigate();
  const [days, setDays] = useState([]);
  const [years, setYears] = useState([]);
  const [modalShow, setModalShow] = useState(false);
  const [otpValue, setOtpValue] = useState("");
  const [alertBox, setAlertBox] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [dateValidation, setDateValidation] = useState({ display: "none" });
  const [userValues, setUserValues] = useState({
    date_value: "",
    year_value: "",
    month_value: "",
    username: "",
    password: "",
    email: "",
    showPassword: false,
  });
  const [passwordError, setPasswordError] = useState("");
  const [usernameError, setUsernameError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);

  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const url = config.API_BASE_URL;

  useEffect(() => {
    const currentYear = new Date().getFullYear();
    if (years.length < 100) {
      for (let y = currentYear - 18; y > currentYear - 118; y--) {
        setYears((prev) => [...prev, y]);
      }
    }

    if (days.length < 31) {
      for (let d = 1; d <= 31; d++) {
        setDays((prev) => [...prev, d]);
      }
    }
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUserValues({ ...userValues, [name]: value });
  };

  const registerReq = async (e) => {
    e.preventDefault();
    setPasswordError("");
    setUsernameError("");
    setEmailError("");
    setIsLoading(true);
    setOtpSent(false);

    const dob = `${userValues.month_value} ${userValues.date_value}, ${userValues.year_value}`;
    const date = new Date(dob);
    if (date.getDate() !== parseInt(userValues.date_value)) {
      setDateValidation({ display: "flex" });
      setIsLoading(false);
      return;
    }

    setDateValidation({ display: "none" });

    const { email, password, username } = userValues;

    // Client-side validation
    if (password.length < 7) {
      setPasswordError("Password must be at least 7 characters long");
      setIsLoading(false);
      return;
    }
    if (!password.match(/[A-Z]/)) {
      setPasswordError("Password must contain at least one uppercase letter");
      setIsLoading(false);
      return;
    }
    if (!password.match(/\d/)) {
      setPasswordError("Password must contain at least one number");
      setIsLoading(false);
      return;
    }

    try {
      const res = await fetch(`${url}/auth/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, username, dob }),
      });

      const data = await res.json();

      if (data.status === 201) {
        setOtpSent(true);
        setModalShow(true);
      } else if (data.status === 400) {
        if (data.message.includes("email")) {
          setEmailError(data.message);
        } else if (data.message.includes("username")) {
          setUsernameError(data.message);
        } else if (data.message.includes("password")) {
          setPasswordError(data.message);
        } else {
          setError(data.message);
        }
      } else {
        setError(data.message || "Something went wrong");
      }
    } catch (error) {
      setError("Server error. Please try again.");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const verifyReq = async (e) => {
    e.preventDefault();

    const res = await fetch(`${url}/auth/verify`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ otp_value: otpValue, email: userValues.email }),
    });

    const data = await res.json();

    if (data.status === 201) navigate("/");
    else if (data.status === 432) setError("Incorrect OTP. Try again.");
    else if (data.status === 442)
      setError("OTP expired. A new OTP has been sent.");
  };

  const setError = (message) => {
    setAlertMessage(message);
    setAlertBox(true);
  };
  const handleCloseBtn = async () => {
    await fetch(`${url}/users/delete`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: userValues.email }),
    });
    setModalShow(false);
  };

  return (
    <>
      <div className={registercss.page}>
        {/* Header */}
        <div className={registercss.header}>
          <img
            src="/logo1.png"
            alt="Riscol Logo"
            className={registercss.logo}
          />
          <h1 className={registercss.title}>Riscol</h1>
        </div>

        {/* Alert */}
        <Collapse in={alertBox}>
          <Alert
            action={
              <IconButton
                aria-label="close"
                size="small"
                onClick={() => setAlertBox(false)}
                style={{ color: "white" }}
              >
                <CloseIcon fontSize="inherit" />
              </IconButton>
            }
            sx={{ mb: 2 }}
          >
            {alertMessage}
          </Alert>
        </Collapse>

        {/* Form */}
        <div className={registercss.form_wrapper}>
          <div className={registercss.form_container}>
            <h2 className={registercss.heading}>Create an account</h2>

            <form className={registercss.form} onSubmit={registerReq}>
              {/* Email */}
              <div className={registercss.input_block}>
                <label className={registercss.label}>
                  Email <span className={registercss.required}>*</span>
                </label>
                <input
                  name="email"
                  type="email"
                  value={userValues.email}
                  onChange={handleChange}
                  className={registercss.input}
                  required
                />
                {emailError && (
                  <div className={registercss.error_message}>{emailError}</div>
                )}
              </div>

              {/* Username */}
              <div className={registercss.input_block}>
                <label className={registercss.label}>
                  Username <span className={registercss.required}>*</span>
                </label>
                <input
                  name="username"
                  type="text"
                  value={userValues.username}
                  onChange={handleChange}
                  className={registercss.input}
                  required
                />
                {usernameError && (
                  <div className={registercss.error_message}>
                    {usernameError}
                  </div>
                )}
              </div>

              {/* Password */}
              <div className={registercss.input_block}>
                <label className={registercss.label}>
                  Password <span className={registercss.required}>*</span>
                </label>
                <div className={registercss.password_wrapper}>
                  <input
                    name="password"
                    type={userValues.showPassword ? "text" : "password"}
                    value={userValues.password}
                    onChange={handleChange}
                    className={registercss.input}
                    required
                  />
                  <span
                    className={registercss.toggle_icon}
                    onClick={() =>
                      setUserValues((prev) => ({
                        ...prev,
                        showPassword: !prev.showPassword,
                      }))
                    }
                  >
                    {userValues.showPassword ? (
                      <VisibilityOff fontSize="small" />
                    ) : (
                      <Visibility fontSize="small" />
                    )}
                  </span>
                </div>
                {passwordError && (
                  <div className={registercss.error_message}>
                    {passwordError}
                  </div>
                )}
              </div>

              {/* Date of Birth */}
              <div className={registercss.input_block}>
                <label className={registercss.label}>
                  Date of Birth <span className={registercss.required}>*</span>
                </label>
                <div className={registercss.dob_grid}>
                  {/* Day Dropdown */}
                  <FormControl
                    fullWidth
                    sx={{
                      bgcolor: "#1e1f22",
                      borderRadius: 1,
                      "& .MuiInputBase-root": {
                        color: "#b5bac1",
                        fontSize: "18px",
                      },
                    }}
                  >
                    <InputLabel sx={{ color: "#b5bac1" }}>Date</InputLabel>
                    <Select
                      value={userValues.date_value}
                      name="date_value"
                      onChange={handleChange}
                      required
                      MenuProps={{
                        PaperProps: {
                          sx: {
                            maxHeight: 220,
                            bgcolor: "#1e1f22",
                            color: "#b5bac1",
                          },
                        },
                      }}
                    >
                      {days.map((d, i) => (
                        <MenuItem key={i} value={d}>
                          {d}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>

                  {/* Month Dropdown */}
                  <FormControl
                    fullWidth
                    sx={{
                      bgcolor: "#1e1f22",
                      borderRadius: 1,
                      "& .MuiInputBase-root": {
                        color: "#b5bac1",
                        fontSize: "18px",
                      },
                    }}
                  >
                    <InputLabel sx={{ color: "#b5bac1" }}>Month</InputLabel>
                    <Select
                      value={userValues.month_value}
                      name="month_value"
                      onChange={handleChange}
                      required
                      MenuProps={{
                        PaperProps: {
                          sx: {
                            maxHeight: 220,
                            bgcolor: "#1e1f22",
                            color: "#b5bac1",
                          },
                        },
                      }}
                    >
                      {months.map((m, i) => (
                        <MenuItem key={i} value={m}>
                          {m}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>

                  {/* Year Dropdown */}
                  <FormControl
                    fullWidth
                    sx={{
                      bgcolor: "#1e1f22",
                      borderRadius: 1,
                      "& .MuiInputBase-root": {
                        color: "#b5bac1",
                        fontSize: "18px",
                      },
                    }}
                  >
                    <InputLabel sx={{ color: "#b5bac1" }}>Year</InputLabel>
                    <Select
                      value={userValues.year_value}
                      name="year_value"
                      onChange={handleChange}
                      required
                      MenuProps={{
                        PaperProps: {
                          sx: {
                            maxHeight: 220,
                            bgcolor: "#1e1f22",
                            color: "#b5bac1",
                          },
                        },
                      }}
                    >
                      {years.map((y, i) => (
                        <MenuItem key={i} value={y}>
                          {y}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </div>

                <div className={registercss.date_error} style={dateValidation}>
                  Please enter a valid date of birth.
                </div>
              </div>

              <button
                type="submit"
                className={registercss.button}
                disabled={isLoading}
              >
                {isLoading ? "Sending..." : "Continue"}
              </button>

              {otpSent && (
                <div className={registercss.otp_sent}>
                  OTP has been sent to your email
                </div>
              )}

              <p className={registercss.link}>
                Already have an account?{" "}
                <Link to="/" className={registercss.link_action}>
                  Log in
                </Link>
              </p>
            </form>
          </div>
        </div>
      </div>

      {/* OTP Modal */}
      <Modal
        show={modalShow}
        size="lg"
        aria-labelledby="contained-modal-title-vcenter"
        centered
      >
        <div className={registercss.modal}>
          <div className={registercss.plane_div}>
            <img src={plane} alt="plane" className={registercss.plane_img} />
          </div>
          <div className={registercss.modal_content}>
            <div className={registercss.modal_title}>
              Verification for Email
            </div>
            <p className={registercss.modal_message}>
              We've sent a verification code to your email.
            </p>
            <input
              type="text"
              placeholder="Enter OTP here"
              value={otpValue}
              onChange={(e) => setOtpValue(e.target.value)}
              className={registercss.input}
            />
            <div className={registercss.verify_button}>
              <button onClick={verifyReq} className={registercss.verify_btn}>
                Verify
              </button>
              <button
                onClick={() => {
                  handleCloseBtn();
                }}
                className={registercss.close_btn}
                style={{ marginLeft: "1rem" }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </Modal>
    </>
  );
}

export default Register;
