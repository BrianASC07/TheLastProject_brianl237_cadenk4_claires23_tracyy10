import React, { useState } from "react";
import { WaitingRoom } from './WaitingRoom.js';
import { Night } from './Night.js';

export function JoinRoom({ socket }) {
  const [username, setUsername] = useState(""); // useState keeps track of the updated state of the variable
  const [room, setRoom] = useState(""); // ref below...
  const [showNight, setshowNight] = useState(false);
  const [role, setRole] = useState("");

  const joinRoom = () => {
    if (username !== "" && room !== "") { // requirements to join
      socket.emit("join_room", [room, username]) // calls join_room in backend and passes the room id
    }
  };

  socket.on("do_not_join", (data) => {
    if (data === false) setshowNight(true);
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
          </div>
        ) : ( // else enter night
          <Night socket={ socket } username={ username } room={ room } role={ role } spectator= { false } />
        )}
      </div>
    )
}

export default JoinRoom