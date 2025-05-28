import React, { useState } from "react";
import { Night } from './Night.js';

export function WaitingRoom({ socket, username, room, role }) {
  const [userList, setUserList] = useState([]);

  const options = async () => {
    await socket.emit("request_userList", room);
  };

  socket.on("user_list", (data) => {
    setUserList(data);
  });

  if (userList.length === 5) {
    return <Night socket={ socket } username={ username } room={ room } role={ role } />
  }

  options();
  return (
    <div>
      <p> cats over cows </p>
      <p> (WAITING ROOM) </p>
    </div>
  )
}
