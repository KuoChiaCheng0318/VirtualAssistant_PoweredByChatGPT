import React from 'react'
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useHistory } from "react-router-dom";
import { auth, provider } from "./firebaseConfig";
import {
  selectUserName,
  selectUserPhoto,
  setUserLoginDetails,
  selectUserEmail,
  setSignOutState,
} from "./userSlice";
import './Login.css'
import LogoutIcon from '@mui/icons-material/Logout';
import Modal from '@mui/material/Modal';
import { makeStyles } from '@material-ui/core/styles';
import { Button, Input } from '@material-ui/core';

function getModalStyle() {
  const top = 50 ;
  const left = 50 ;

  return {
    top: `${top}%`,
    left: `${left}%`,
    transform: `translate(-${top}%, -${left}%)`,
  };
}

// work on modal
const useStyles = makeStyles((theme) => ({
  paper:{
    position: 'absolute',
    width: 350 ,
    backgroundColor: theme.palette.background.paper,
    border: '2px solid #000',
    boxShadow: theme.shadows[5],
    padding: theme.spacing(2,4,3),
  },
}));

const Login = (props) => {
  const dispatch = useDispatch();
  const history = useHistory();
  const userName = useSelector(selectUserName);
  const userPhoto = useSelector(selectUserPhoto);
  const userEmail = useSelector(selectUserEmail);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');

  const classes = useStyles();
  const [modalStyle] = React.useState(getModalStyle);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    auth.onAuthStateChanged(async (user) => {
      if (user) {
        setUser(user);
        history.push("/home");
      }
    });
  }, [userName]);

  const handleAuth = () => {
    if (!userEmail) {
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

  const handleEmailLogin = () => {
    // const email = prompt("Enter your email:");
    // const password = prompt("Enter your password:");
    
    if (email && password) {
      auth
        .signInWithEmailAndPassword(email, password)
        .then((userCredential) => {
          const user = userCredential.user;
          setUser(user);
        })
        .catch((error) => {
          alert(error.message);
        });
    }
  };

  const handleSignUp = () => {
    // const email = prompt('Enter your email:');
    // const password = prompt('Enter your password:');
    // const displayName = prompt('Enter your display name:'); 

    if (email && password && displayName) {
      auth
        .createUserWithEmailAndPassword(email, password)
        .then((userCredential) => {
          const user = userCredential.user;
          user.updateProfile({
            displayName: displayName,
          }).then(() => {
            setUser(user);
          }).catch((error) => {
            alert(error.message);
          });
        })
        .catch((error) => {
          alert(error.message);
        });
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
          <div className='Login_left'>
            <h1 className='Login_title'>Amy</h1>
            <p className='Login_desc'>Virtual Assistant Powered by ChatGPT</p>
            {/* <img className="virtual_assistantImg" src="OL_IMG_Q6.gif" /> */}
            <div className='buttons_login'>
                
                <div className='Login_Input'>
                  <input className='Login_Inputtext'
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  />
                  <input className='Login_Inputtext'
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
                <button onClick={handleEmailLogin} className='login_button'>
                  Log In
                </button>
                <hr/>
                {/* <button onClick={handleSignUp} className='login_button' > */}
                <button onClick={() => setOpen(true)} className='login_button' >
                    Create new account
                </button>
                <Modal open={open}
                  onClose={() => setOpen(false)}>
                  <div style={modalStyle} className={classes.paper}>
                    <div className='app__signup'>
                      <center>
                        <h2>Sign Up</h2>
                      </center>
                      <Input
                        type="text"
                        placeholder="Username"
                        value={displayName}
                        onChange={(e) => setDisplayName(e.target.value)}
                      />
                      <Input
                        type="email"
                        placeholder="Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                      />
                      <Input
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                      />
                      <Button type="submit" onClick={handleSignUp}>Sign Up</Button>
                    </div>
                  </div>
                </Modal>
                
                <button onClick={handleAuth} className='login_button'>
                  <img className='googleicon' src="5847f9cbcef1014c0b5e48c8.png" />
                  Log In with Google
                </button>
            </div>
          </div>
          <div className='Login_right'>
            <div className='Login_demo'>
              <iframe className='Login_Video1'
              src="https://www.youtube.com/embed/4ib6-GSMP80" 
              title="YouTube video player" 
              frameborder="0" 
              allow="fullscreen">
              </iframe>
              <iframe className='Login_Video2'
              src="https://www.youtube.com/embed/sIhRKKxfD0Y" 
              title="YouTube video player" 
              frameborder="0" 
              allow="fullscreen">
              </iframe>
            </div>
          </div>
        </div>
      ):(
        // <div className='logout'>
        //   <div className='buttons_logout'>
        //       <button onClick={handleAuth} className='logout_button'><LogoutIcon /> Log out</button>
        //   </div>
        // </div>
        <></>
      )}
    </div>
  )
}

export default Login