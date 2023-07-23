// import firebase from 'firebase/app';
// import 'firebase/firestore';
import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import 'firebase/compat/firestore';
import 'firebase/compat/storage';


const firebaseConfig = {
    apiKey: "AIzaSyCwrlJs566doNhQ90GvVSF0xFV6npzpAxs",

  authDomain: "virtualassistantreact20230606.firebaseapp.com",

  projectId: "virtualassistantreact20230606",

  storageBucket: "virtualassistantreact20230606.appspot.com",

  messagingSenderId: "833666269146",

  appId: "1:833666269146:web:8612ab52816aa78d71cae3",

  measurementId: "G-23W0S3DJEV"

  
};

firebase.initializeApp(firebaseConfig);

const db = firebase.firestore();
const auth = firebase.auth();
const provider = new firebase.auth.GoogleAuthProvider();

export default db;
export { auth, provider};
