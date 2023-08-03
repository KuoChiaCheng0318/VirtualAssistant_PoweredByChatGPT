import React, { useRef, useState, useEffect } from "react";
import SpeechRecognition, { useSpeechRecognition } from "react-speech-recognition";
import db from './firebaseConfig';
import firebase from 'firebase/compat/app';
import { auth, provider } from "./firebaseConfig";
import {
  selectUserName,
  selectUserPhoto,
  setUserLoginDetails,
  setSignOutState,
  selectUserEmail,
} from "./userSlice";
import { setSpeaking } from "./speakingSlice";
import { useDispatch, useSelector } from "react-redux";
import { useHistory } from "react-router-dom";
import MicIcon from '@mui/icons-material/Mic';
import MicOffIcon from '@mui/icons-material/MicOff';
import RadioButtonCheckedIcon from '@mui/icons-material/RadioButtonChecked';
import LogoutIcon from '@mui/icons-material/Logout';
import './Microphone2.css'

import UserInput from "./UserInput";
import MessageList from "./MessageList";

const Microphone = () => {
  const { transcript, resetTranscript } = useSpeechRecognition();
  const [isListening, setIsListening] = useState(false); 
  const [transcriptList, setTranscriptList] = useState([]);
  const microphoneRef = useRef(null); 
  const timeoutRef = useRef(null); 
  const userName = useSelector(selectUserName); 
  const userPhoto = useSelector(selectUserPhoto); 
  const userEmail = useSelector(selectUserEmail); 
  const dispatch = useDispatch(); 
  const speaking = useSelector((state) => state.speaking);
  const history = useHistory(); 

  
  useEffect(() => {
    if (speaking) {
      console.log("system speaking");
      stopListening(); 
    } else {
      console.log("system not speaking");
      startListening(); 
    }
  }, [speaking]);

  
  useEffect(() => {
    if (transcript) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => {
        saveTranscript({ role: "user", content: transcript });
        resetTranscript();
      }, 2000); 
    }
  }, [transcript, resetTranscript]);

 
  const handleListening = () => {
    setIsListening(true);
    microphoneRef.current.classList.add("listening");
    SpeechRecognition.startListening({
      continuous: true, 
    });
  };

 
  const stopListening = () => {
    setIsListening(false);
    microphoneRef.current.classList.remove("listening");
    SpeechRecognition.stopListening();
    clearTimeout(timeoutRef.current); 
  };

  
  const startListening = () => {
    setIsListening(true);
    microphoneRef.current.classList.add("listening");
    SpeechRecognition.startListening({
      continuous: true,
    });
  };

  
  const saveTranscript = async (transcriptData) => {
    try {
      const timestamp = firebase.firestore.Timestamp.now();
      await db.collection("chat").add({
        ...transcriptData,
        timestamp,
        userName,
        userEmail,
      });
    } catch (error) {
      console.error("Error saving transcript: ", error);
    }
  };

  
  const deleteTranscript = async (transcriptId) => {
    try {
      await db.collection("chat").doc(transcriptId).delete();
    } catch (error) {
      console.error("Error deleting transcript: ", error);
    }
  };

  
  const handleClearAll = async () => {
    const confirmClear = window.confirm("Are you sure you want to clear all your messages in the database?");
    if (confirmClear) {
      try {
        const snapshot = await db.collection('chat').where("userEmail", "==", userEmail).get();
        snapshot.forEach((doc) => {
          db.collection('chat').doc(doc.id).delete();
        });
      } catch (error) {
        console.error(error);
      }
    }
  };

 
  useEffect(() => {
    const unsubscribe = db.collection("chat").orderBy('timestamp').onSnapshot((snapshot) => {
      const transcripts = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setTranscriptList(transcripts);
    });
    
    dispatch(setSpeaking(speaking));

    return () => unsubscribe(); 
  }, [speaking]);

  
  if (!SpeechRecognition.browserSupportsSpeechRecognition()) {
    return (
      <div className="microphone-container">
        Browser does not support Speech Recognition.
      </div>
    );
  }

  
  const handleAuth = () => {
    if (userName) {
      auth
        .signOut()
        .then(() => {
          dispatch(setSignOutState());
          history.push("/");
        })
        .catch((err) => alert(err.message));
    }
  };

  
  return (
    <div className="microphone-wrapper">
      <div className="user_InfoInput">
        <div className="userInfo">
          <div className='sidebar__dropdown'>
            <img className='userphoto' src={userPhoto} alt={userName} referrerpolicy="no-referrer"/>
            <div className="username">{userName}</div>
            <button className="dropdown-content" onClick={handleAuth}><LogoutIcon /> Log out</button>
          </div>
        </div>
        <div className="microphone_Input">
          <div className="microphone-container">
            <div className="microphone-status">
              {isListening ? <RadioButtonCheckedIcon /> : null}
            </div>
            <div
              className="microphone-icon-container"
              ref={microphoneRef}
              onClick={handleListening}
            >
              {isListening ? null : <button className="microphone_btn"><MicIcon /></button>}
            </div>
            {isListening && (
              <button className="microphone_btn" onClick={stopListening}>
                <MicOffIcon />
              </button>
            )}
          </div>
          <div className="microphone-result-container">
            <UserInput saveTranscript={saveTranscript} />
            {transcriptList.length > 0 && (
                <button className='chat_ClearAll' onClick={handleClearAll}>
                  Clear All
                </button>
            )}
          </div>
        </div>
      </div>
      <div className="MessageList">
        {transcriptList.length > 0 && (
          <MessageList transcriptList={transcriptList} deleteTranscript={deleteTranscript} />
        )}
      </div>
    </div>
  );
};

export default Microphone;
