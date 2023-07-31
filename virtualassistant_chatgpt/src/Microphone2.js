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
  // Hook to use speech recognition functionality
  const { transcript, resetTranscript } = useSpeechRecognition();
  const [isListening, setIsListening] = useState(false); // State to track if the microphone is listening
  const [transcriptList, setTranscriptList] = useState([]); // State to store transcripts
  const microphoneRef = useRef(null); // Ref to access the microphone element in the DOM
  const timeoutRef = useRef(null); // Ref to manage a timeout for saving transcripts
  const userName = useSelector(selectUserName); // Select the user's name from Redux store
  const userPhoto = useSelector(selectUserPhoto); // Select the user's photo from Redux store
  const userEmail = useSelector(selectUserEmail); // Select the user's email from Redux store
  const dispatch = useDispatch(); // Access the dispatch function for Redux actions
  const speaking = useSelector((state) => state.speaking); // Select speaking state from Redux store
  const history = useHistory(); // Access the history object for routing

  // Effect to handle the speech recognition when the speaking state changes
  useEffect(() => {
    if (speaking) {
      console.log("system speaking");
      stopListening(); // Stop listening if the system is speaking
    } else {
      console.log("system not speaking");
      startListening(); // Start listening if the system is not speaking
    }
  }, [speaking]);

  // Effect to save transcripts when the speech recognition captures a transcript
  useEffect(() => {
    if (transcript) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => {
        saveTranscript({ role: "user", content: transcript }); // Save the transcript to the database
        resetTranscript(); // Reset the transcript after saving
      }, 2000); // Wait for 2 seconds before saving to avoid continuous saving for every partial transcript
    }
  }, [transcript, resetTranscript]);

  // Function to start listening to the microphone
  const handleListening = () => {
    setIsListening(true);
    microphoneRef.current.classList.add("listening");
    SpeechRecognition.startListening({
      continuous: true, // Keep listening until manually stopped
    });
  };

  // Function to stop listening to the microphone
  const stopListening = () => {
    setIsListening(false);
    microphoneRef.current.classList.remove("listening");
    SpeechRecognition.stopListening();
    clearTimeout(timeoutRef.current); // Clear any ongoing timeouts
  };

  // Function to start listening again after it's stopped
  const startListening = () => {
    setIsListening(true);
    microphoneRef.current.classList.add("listening");
    SpeechRecognition.startListening({
      continuous: true, // Keep listening until manually stopped
    });
  };

  // Function to save a transcript to the Firebase database
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

  // Function to delete a transcript from the Firebase database
  const deleteTranscript = async (transcriptId) => {
    try {
      await db.collection("chat").doc(transcriptId).delete();
    } catch (error) {
      console.error("Error deleting transcript: ", error);
    }
  };

  // Function to handle clearing all the user's messages from the database
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

  // Effect to set up the listener for the transcripts in the Firebase database
  useEffect(() => {
    const unsubscribe = db.collection("chat").orderBy('timestamp').onSnapshot((snapshot) => {
      const transcripts = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setTranscriptList(transcripts);
    });
    // Dispatch action to update speaking state
    dispatch(setSpeaking(speaking));

    return () => unsubscribe(); // Cleanup function to unsubscribe from the Firebase listener
  }, [speaking]);

  // If the user's browser doesn't support speech recognition, display a message
  if (!SpeechRecognition.browserSupportsSpeechRecognition()) {
    return (
      <div className="microphone-container">
        Browser does not support Speech Recognition.
      </div>
    );
  }

  // Function to handle user authentication (sign-out)
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

  // Render the microphone and chat interface components
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
