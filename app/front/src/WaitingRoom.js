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

  const centerStyle = {
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    minHeight: "100vh",
    background: "none"
  };

  const titleStyle = {
    fontSize: "2.5rem",
    fontWeight: "bold",
    marginBottom: "0.5em",
    letterSpacing: "2px"
  };

  const subtitleStyle = {
    fontSize: "1.4rem",
    fontWeight: "500",
    marginBottom: "1em",
  };

  const listStyle = {
    fontSize: "1.15rem",
    margin: 0,
    padding: 0,
    listStyleType: "none"
  };

  const listItemStyle = {
    marginBottom: "0.25em"
  };

  return (
    <div style={centerStyle}>
      <div style={titleStyle}>WAITING ROOM</div>
      <div style={subtitleStyle}>
        Users in room: {userList.length} / 5
      </div>
      <ul style={listStyle}>
        {userList.map((uname, index) => (
          <li key={index} style={listItemStyle}>{uname}</li>
        ))}
      </ul>
    </div>
  )
}

export default WaitingRoom
