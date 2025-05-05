import './App.css';
import { Chat } from './Chat.js';
import io from 'socket.io-client'; // front end must be started ('npm start') !!!
import { useState } from "react";

const socket = io.connect("http://localhost:3001"); // connects this to the backend 

function App() {
  const [username, setUsername] = useState(""); // useState keeps track of the updated state of the variable
  const [room, setRoom] = useState(""); // ref below...

  const joinRoom = () => {
    if (username !== "" && room != "") { // requirements to join
      socket.emit("join_room", room) // calls join_room in backend and passes the room id
    }
  }

  return (
    <div className="App">
      <h3> join chat </h3>
      <input 
        type="text" 
        placeholder="Name..." 
        onChange={(event) => // takes in the event (the inputted text)
          {setUsername(event.target.value); // updates the variable setUsername with input 
        }}
      />
      <input 
        type="text" 
        placeholder="Room ID..." 
        onChange={(event) => 
          {setRoom(event.target.value);
        }}
      />
      <button onClick={joinRoom}> join room </button> 

      <Chat socket={socket} username={username} room={room} />
      {/* calls the chat module from within Chat.js and passes these values */}
    </div>
  );
}

export default App;
