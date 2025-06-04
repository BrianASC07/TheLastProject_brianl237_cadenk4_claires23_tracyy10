import React, { useState } from "react";
import { Game } from './Game.js';

export function WaitingRoom({ socket, username, room, role, spectator }) {
  const [userList, setUserList] = useState([]);

  const options = async () => {
    await socket.emit("request_userList", room);
  };

  socket.on("user_list", (data) => {
    setUserList(data);
  });

  if (userList.length === 5) {
    return <Game socket={socket} username={username} room={room} role={role} spectator={spectator} />
  }

  options();
  return (
    <div>
      <p> WAITING ROOM </p>
      <p> Users in room: {userList.length} / 5 </p>
      {userList.map((uname, index) => {
        return <p> {uname} </p>;
      })}
    </div>
  )
}

export default WaitingRoom