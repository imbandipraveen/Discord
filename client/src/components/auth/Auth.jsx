import { useEffect } from "react";
import { useNavigate, Outlet } from "react-router-dom";
import Login from "./Login";
import { useState } from "react";
import Loading from "../pages/Loading";
import config from "../../config/config";

const Auth = (props) => {
  const Navigate = useNavigate();
  // reading data from redux store
  const [authCheck, setAuthCheck] = useState(null);

  const url = config.API_BASE_URL;

  const privateRoutes = async () => {
    const res = await fetch(`${url}/auth/verify-route`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-auth-token": localStorage.getItem("token"),
      },
    });
    const data = await res.json();

    if (data.status === 201) {
      setAuthCheck(true);
    } else {
      setAuthCheck(false);
    }
  };

  useEffect(() => {
    if (localStorage.getItem("token") === "") {
      setAuthCheck(false);
    } else {
      privateRoutes();
    }
  });

  return (
    <>
      {authCheck === true ? (
        window.location.pathname === "/" ? (
          Navigate("/channels/@me")
        ) : (
          <Outlet />
        )
      ) : authCheck === false ? (
        <Login />
      ) : (
        <Loading />
      )}
    </>
  );
};

export default Auth;
