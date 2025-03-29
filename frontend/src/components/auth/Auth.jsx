import { useEffect } from 'react';
import { useNavigate, Outlet } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux'
import { decrement, increment } from '../../Redux/counterSlice'
import Login from '../Login/Login';
import Dashboard from '../dashboard/Dashboard'
import { useState } from 'react';
import Loading from '../Loading_page/Loading'

const Auth = (props) => {
  const Navigate = useNavigate();
  const [auth_check, setauth_check] = useState(null)
  const dispatch = useDispatch();

  const url = import.meta.env.VITE_API_URL

  const private_routes = async () => {
    const res = await fetch(`${url}/verify_route`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-auth-token': localStorage.getItem('token')
      }
    })
    const data = await res.json();

    if (data.status == 201) {
      setauth_check(true)
    }
    else {
      setauth_check(false)
    }
  }

  useEffect(() => {
    if (localStorage.getItem('token') == '') {
      setauth_check(false)
    }
    else {
      private_routes()
    }
  })

  return (
    <>
      {
        auth_check == true ?
          window.location.pathname == '/' ?
            Navigate('/channels/@me')
            :
            <Outlet />
          :
          auth_check == false
            ?
            <Login />
            :
            <Loading />
      }
    </>
  )
}

export default Auth 