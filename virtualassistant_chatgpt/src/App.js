import { BrowserRouter as Router, Switch, Route } from "react-router-dom";
import './App.css';
import Login from "./Login";
import OpenaiResponse from "./Openai2";
import Microphone from './Microphone2'; //using firestoreDB
function App() {
  return (
    <div className="App">
      <Router>
        <Switch>
          <Route exact path="/">
            <Login />
          </Route>
          <Route path="/home">
            {/* <Login /> */}
            <Microphone />
            <OpenaiResponse />
          </Route>
        </Switch>
      </Router>
    </div>
  );
}

export default App;