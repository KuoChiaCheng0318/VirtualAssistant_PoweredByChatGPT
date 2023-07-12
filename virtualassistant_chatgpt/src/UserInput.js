import React, { useState } from "react";
import SendIcon from '@mui/icons-material/Send';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import './UserInput.css';

const UserInput = ({ saveTranscript }) => {
  const [inputTranscript, setInputTranscript] = useState("");

  const handleInputChange = (e) => {
    setInputTranscript(e.target.value);
  };

  const handleInputEnter = () => {
    if (inputTranscript.trim() !== "") {
      saveTranscript({ role: "user", content: inputTranscript });
      setInputTranscript("");
    }
  };

  const insertThumbsUp = () => {
    saveTranscript({ role: "user", content: "👍" });
    setInputTranscript("");
  };

  return (
    <div className="input-container">
      <input className='chat__inputtxt' 
        type="text"
        placeholder="Aa"
        value={inputTranscript}
        onChange={handleInputChange}
      />
      <button className='chat__sendicon' onClick={handleInputEnter}><SendIcon /></button>
      <button className='chat__sendicon' onClick={insertThumbsUp}><ThumbUpIcon /></button>
    </div>
  );
};

export default UserInput;
