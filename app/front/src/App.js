import './App.css';
import io from 'socket.io-client'; // front end must be started ('npm start') !!!
import { JoinRoom } from './JoinRoom.js';

const socket = io.connect("http://localhost:3001"); // connects this to the backend

function App() {

  return (
    <JoinRoom socket={ socket }/>
  )
}

export default App;
