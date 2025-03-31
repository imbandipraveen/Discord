import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import login_css from "./login.module.css";

function Login() {
  const navigate = useNavigate();
  const [user_values, setUserValues] = useState({ email: "", password: "" });
  const [alertMessage, setAlertMessage] = useState("");
  const url = process.env.REACT_APP_URL;

  const handle_user_values = (e) => {
    const { name, value } = e.target;
    setUserValues({ ...user_values, [name]: value });
  };

  const login_req = async (e) => {
    e.preventDefault();
    const { email, password } = user_values;

    try {
      const res = await fetch(`${url}/auth/signin`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (data.status === 442) {
        setAlertMessage("Invalid username or password");
      } else if (data.status === 201) {
        localStorage.setItem("token", data.token);
        navigate("/channels/@me");
      } else if (data.status === 422) {
        setAlertMessage("Account not verified yet");
      } else {
        setAlertMessage("Something went wrong.");
      }
    } catch (err) {
      setAlertMessage("Server error. Please try again.");
      console.error(err);
    }
  };

  return (
    <div className={login_css.page}>
      {/* Header */}
      <div className={login_css.header}>
        <img src="/logo1.png" alt="Riscol Logo" className={login_css.logo} />
        <h1 className={login_css.title}>Riscol</h1>
      </div>

      {/* Form Container */}
      <div className={login_css.form_wrapper}>
        <div className={login_css.login_box}>
          <h2 className={login_css.heading}>Welcome back!</h2>
          <p className={login_css.subheading}>
            We're so excited to see you again!
          </p>

          <form className={login_css.form} onSubmit={login_req}>
            {/* Email */}
            <div className={login_css.input_block}>
              <label className={login_css.label}>
                Email <span className={login_css.required}>*</span>
              </label>
              <input
                type="email"
                name="email"
                value={user_values.email}
                onChange={handle_user_values}
                className={login_css.input}
                required
              />
            </div>

            {/* Password */}
            <div className={login_css.input_block}>
              <label className={login_css.label}>
                Password <span className={login_css.required}>*</span>
              </label>
              <input
                type="password"
                name="password"
                value={user_values.password}
                onChange={handle_user_values}
                className={login_css.input}
                required
              />
            </div>

            {/* Alert */}
            {alertMessage && (
              <div className={login_css.alert}>{alertMessage}</div>
            )}

            {/* Submit */}
            <button type="submit" className={login_css.button}>
              Log In
            </button>

            {/* Register Link */}
            <p className={login_css.register}>
              Need an account?
              <span
                className={login_css.register_link}
                onClick={() => navigate("/register")}
              >
                Register
              </span>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Login;
