import './App.css';
import { Chat } from './Chat.js';
import io from 'socket.io-client'; // front end must be started ('npm start') !!!
import { useState } from "react";
import { Night } from './Night.js';

const socket = io.connect("http://localhost:3000"); // connects this to the backend

function App() {
  const [username, setUsername] = useState(""); // useState keeps track of the updated state of the variable
  const [room, setRoom] = useState(""); // ref below...
  const [showChat, setShowChat] = useState(false);
  const [role, setRole] = useState("");

  const joinRoom = () => {
    if (username !== "" && room !== "") { // requirements to join
      socket.emit("join_room", [room, username]) // calls join_room in backend and passes the room id
      setShowChat(true);
    }
  };

  socket.on("do_not_join", (data) => {
    if (data === false) setShowChat(true);
  });

  socket.on("set_role", (data) => {
    setRole(data);
  });

  return (
    <div className="App">
      {!showChat ? ( // if showChat is false, allow to join
        <div className="joinChatContainer">
          <h3> join chat </h3>
          <input
            type="text"
            placeholder="Name..."
            onChange={(event) => // takes in the event (the inputted text)
            {
              setUsername(event.target.value); // updates the variable setUsername with input
            }}
          />
          <input
            type="text"
            placeholder="Room ID..."
            onChange={(event) => {
              setRoom(event.target.value);
            }}
          />
          <button onClick={joinRoom}> join room </button>
        </div>
      ) : ( // else show the chat
        // <Chat socket={socket} username={username} room={room} />
        <Night socket={ socket } username={ username } room={ room } role={ role } />
      )}
    </div>
  );
}

export default App;
