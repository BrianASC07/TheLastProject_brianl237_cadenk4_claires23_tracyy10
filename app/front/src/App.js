import './App.css';
import { Chat } from './Chat.js';
import io from 'socket.io-client'; // front end must be started ('npm start') !!!
import { useState } from "react";
import { Night } from './Night.js';

const socket = io.connect("http://localhost:3001"); // connects this to the backend
//const socket = io.connect("http://localhost:3000");

export function App() {
  const [username, setUsername] = useState(""); // useState keeps track of the updated state of the variable
  const [room, setRoom] = useState(""); // ref below...
  const [showNight, setshowNight] = useState(false);
  const [role, setRole] = useState("");
  const [roomFull, setRoomFull] = useState(false); // NEW: state for showing if room is full

  const joinRoom = () => {
    setRoomFull(false); // Reset any previous full message
    if (username !== "" && room !== "") { // requirements to join
      socket.emit("join_room", [room, username]) // calls join_room in backend and passes the room id
      //setshowNight(true);
    }
  };

  socket.on("do_not_join", (data) => {
    // If room is full, show message. Otherwise, allow to join.
    if (data === true) {
      setRoomFull(true);
    } else if (data === false) {
      setshowNight(true);
    }
  });

  socket.on("set_role", (data) => {
    setRole(data);
  });

  return (
    <div className="App">
      {!showNight ? ( // if showNight is false, allow to join
        <div className="joinChatContainer">
          <h3> Join Room </h3>
          <input
            type="text"
            placeholder="Name..."
            onChange={(event) => // takes in the event (the inputted text)
            {
              setUsername(event.target.value); // updates the variable setUsername with input
            }}
            onKeyPress={(event) => { event.key === 'Enter' && joinRoom(); }}
          />
          <input
            type="text"
            placeholder="Room ID..."
            onChange={(event) => {
              setRoom(event.target.value);
            }}
            onKeyPress={(event) => { event.key === 'Enter' && joinRoom(); }}
          />
          <button onClick={joinRoom}> connect </button>
          {roomFull && (
            <div style={{ color: 'red', marginTop: '10px' }}>
              The room is full. Please try a different room!
            </div>
          )}
        </div>
      ) : ( // else enter night
        <Night socket={ socket } username={ username } room={ room } role={ role } />
      )}
    </div>
  );
}

export default App;
