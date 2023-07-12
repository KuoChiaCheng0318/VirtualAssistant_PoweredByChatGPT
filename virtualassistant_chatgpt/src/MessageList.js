import React, { useState } from "react";
import FlipMove from "react-flip-move";
import { useSelector } from "react-redux";
import { selectUserName, selectUserEmail } from "./userSlice";
import db from "./firebaseConfig";
import firebase from "firebase/compat/app";
import './MessageList.css'

const MessageList = ({ transcriptList, deleteTranscript }) => {
  const userName = useSelector(selectUserName);
  const userEmail = useSelector(selectUserEmail);
  const [editData, setEditData] = useState({ id: "", message: ""});

  const filteredTranscripts = transcriptList.filter(
    (item) => item.userEmail === userEmail
  );

  const editItem = (item) => {
    setEditData({ id: item.id, message: item.content});
  };

  const updateData = async () => {
    try {
      const timestamp = firebase.firestore.Timestamp.now();
      await db.collection("chat").doc(editData.id).update({
        content: editData.message,
        role: "user",
        timestamp,
        userName: userName,
        userEmail: userEmail,
      });
      setEditData({ id: "", message: ""});
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="microphone-result-container">
      <div className="microphone-result-list">
        <FlipMove>
          <div className='chat_prevmessage'>
            {filteredTranscripts.map((item) => (
              <div 
              className={`${item.role === 'user' ? 'chat-message__user-input' : 'chat-message'}`}
              key={item.id}>
                {item.id === editData.id ? (
                  <>
                    <input className='chat__inputtxt'
                      type="text"
                      value={editData.message}
                      onChange={(e) =>
                        setEditData({ ...editData, message: e.target.value })
                      }
                    />
                    <button className='chat_editdeleteupdatecancel' onClick={updateData}>Update</button>
                    <button className='chat_editdeleteupdatecancel' onClick={() => setEditData({ id: '', message: ''})}>
                      Cancel
                    </button>
                  </>
                ) : (
                  <>
                    <div className='chat__txt'>{item.content}</div>
                    <div className="chat__btntime">
                      <div className="chat__time">{item.timestamp.toDate().toLocaleString()} </div>
                      <div className="chat_btn">
                        {item.role === "user" && (
                        <button className='chat_editdeleteupdatecancel' onClick={() => editItem(item)}>Edit</button>
                        )}
                        <button className='chat_editdeleteupdatecancel' onClick={() => deleteTranscript(item.id)}>Delete</button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        </FlipMove>
      </div>
    </div>
  );
};

export default MessageList;
