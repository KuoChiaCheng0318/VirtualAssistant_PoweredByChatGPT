import React, { useEffect, useState } from "react";
import firebase from "firebase/compat/app";
import "firebase/compat/firestore";
import { Configuration, OpenAIApi } from 'openai';
import db from './firebaseConfig';
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
import { useSpeechSynthesis } from "react-speech-kit";
import "./Openai2.css"

const OpenaiResponse = () => {
  const [messages, setMessages] = useState([]);
  const userName = useSelector(selectUserName);
  const userEmail = useSelector(selectUserEmail);
  const { speak, cancel, speaking, supported, voices } = useSpeechSynthesis();
  const dispatch = useDispatch();

  useEffect(() => {

    const unsubscribe = db.collection("chat").orderBy('timestamp').onSnapshot((snapshot) => {
      const messagesData = snapshot.docs
      .map((doc) => doc.data())
        .filter(
          (message) =>
            message.userEmail === userEmail &&
            Date.now() - message.timestamp.toMillis() <= 60000 * 5 // Within 5 minutes
        );
      setMessages(messagesData);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const latestMessage = messages[messages.length - 1];
    if (latestMessage && latestMessage.role === "user" && 
      Date.now() - latestMessage.timestamp.toMillis() <= 500 ) { // within 0.5 sec
      generateAIResponse();
    }
  }, [messages]);

  const generateAIResponse = async () => {
    try {
      // console.log(messages)
      const messagesHistory = messages
        .map(({ role, content }) => ({ role, content }));
      messagesHistory.unshift({ role: "system", content: "This system is a personal assistant called Amy. This personal assistant called Amy is always energetic and helpful." });
      console.log(messagesHistory)
      const { Configuration, OpenAIApi } = require("openai");

      const configuration = new Configuration({
          apiKey: "XXXXXXXXXXXXXXXXXXXXXXXX"
      });
      const openai = new OpenAIApi(configuration);

      const chatCompletion = await openai.createChatCompletion({
      model: "gpt-3.5-turbo",
      messages: messagesHistory,
      // max_tokens: 100,
      });
      // console.log(chatCompletion.data.choices[0].message);
      {/* female voice: 2,7,8, */}
      {/* 16--japanese girl */}
      speak({ text: chatCompletion.data.choices[0].message.content, voice: voices[2]})
      
      const timestamp = firebase.firestore.Timestamp.now();
      const newMessage = {
        content: chatCompletion.data.choices[0].message.content,
        role: "assistant",
        timestamp,
        userName: userName,
        userEmail: userEmail,
      };

      
      await firebase.firestore().collection("chat").add(newMessage);
    } catch (error) {
      console.error("Error generating AI response: ", error);
    }
  };

  useEffect(() => {
    if (speaking) {
      // console.log("speaking")
      dispatch(setSpeaking(true));
    } else {
      // console.log("not speaking")
      dispatch(setSpeaking(false));
    }
  }, [speaking]);

  const handleCancelSpeaking = () => {
    cancel(); 
    dispatch(setSpeaking(false));
  };

  return (
    <div>
      <div class="image-container" onClick={handleCancelSpeaking}>
        {speaking && <img className="OL_IMG_Q" src="OL_IMG_Q6.gif" alt="Speaking" />}
        {/* <img className="OL_IMG_Q" src="OL_IMG_Q.png" alt="Speaking" /> */}
      </div>
      {/* <button onClick={generateAIResponse}>Generate AI Response</button> */}
    </div>
  );
};

export default OpenaiResponse;