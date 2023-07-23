// import firebase from 'firebase/app';
// import 'firebase/firestore';
import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import 'firebase/compat/firestore';
import 'firebase/compat/storage';


const firebaseConfig = {
  apiKey: "AIzaSyAk5ccMnCQdD3CAfnXWMcHXK-mh1s_vj3E",

  authDomain: "virtualassistantchatgpt.firebaseapp.com",

  projectId: "virtualassistantchatgpt",

  storageBucket: "virtualassistantchatgpt.appspot.com",

  messagingSenderId: "849770296706",

  appId: "1:849770296706:web:98f254463ac24015b14b9b",

  measurementId: "G-K136P271Z2"


  
};

firebase.initializeApp(firebaseConfig);

const db = firebase.firestore();
const auth = firebase.auth();
const provider = new firebase.auth.GoogleAuthProvider();

export default db;
export { auth, provider};
