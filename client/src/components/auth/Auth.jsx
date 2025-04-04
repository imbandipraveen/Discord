import { useEffect } from "react";
import { useNavigate, Outlet } from "react-router-dom";
import Login from "../Login/Login";
import { useState } from "react";
import Loading from "../Loading_page/Loading";

const Auth = (props) => {
  const Navigate = useNavigate();
  // reading data from redux store
  const [auth_check, setAuth_check] = useState(null);

  const url = process.env.REACT_APP_URL;

  const private_routes = async () => {
    const res = await fetch(`${url}/auth/verify-route`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-auth-token": localStorage.getItem("token"),
      },
    });
    const data = await res.json();

    if (data.status === 201) {
      setAuth_check(true);
    } else {
      setAuth_check(false);
    }
  };

  // made a use effect here so that whenever this file is invoked through app.js then this function must runs otherwise it will have the default values in it

  useEffect(() => {
    if (localStorage.getItem("token") === "") {
      setAuth_check(false);
    } else {
      private_routes();
    }
  }, []);

  return (
    <>
      {auth_check === true ? (
        window.location.pathname === "/" ? (
          Navigate("/channels/@me")
        ) : (
          <Outlet />
        )
      ) : auth_check === false ? (
        <Login />
      ) : (
        <Loading />
      )}
    </>
  );
};

export default Auth;
