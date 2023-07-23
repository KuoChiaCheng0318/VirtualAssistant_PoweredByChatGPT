import React from 'react'
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useHistory } from "react-router-dom";
import { auth, provider } from "./firebaseConfig";
import {
  selectUserName,
  selectUserPhoto,
  setUserLoginDetails,
  setSignOutState,
} from "./userSlice";
import './Login.css'
import LogoutIcon from '@mui/icons-material/Logout';

const Login = (props) => {
  const dispatch = useDispatch();
  const history = useHistory();
  const userName = useSelector(selectUserName);
  const userPhoto = useSelector(selectUserPhoto);

  useEffect(() => {
    auth.onAuthStateChanged(async (user) => {
      if (user) {
        setUser(user);
        history.push("/home");
      }
    });
  }, [userName]);

  const handleAuth = () => {
    if (!userName) {
      auth
        .signInWithPopup(provider)
        .then((result) => {
            setUser(result.user);
        })
        .catch((error) => {
          alert(error.message);
        });
    } else if (userName) {
      auth
        .signOut()
        .then(() => {
          dispatch(setSignOutState());
          history.push("/");
        })
        .catch((err) => alert(err.message));
    }
  };

  const setUser = (user) => {
    dispatch(
      setUserLoginDetails({
        name: user.displayName,
        email: user.email,
        photo: user.photoURL,
      })
    );
  };

  return (
    <div>
      {!userName ? (
        <div className='login'>
          <h1>Virtual Assistant Powered by OpenAI gpt-3.5-turbo</h1>
          <img className="virtual_assistantImg" src="OL_IMG_Q.png" />
          <div className='buttons_login'>
              <button onClick={handleAuth} className='login_button'>
                <img className='googleicon' src="5847f9cbcef1014c0b5e48c8.png" />
                Log In with Google
              </button>
          </div>
        </div>
      ):(
        <div className='logout'>
          <div className='buttons_logout'>
              <button onClick={handleAuth} className='logout_button'><LogoutIcon /> Log out</button>
          </div>
        </div>
      )}
    </div>
  )
}

export default Login