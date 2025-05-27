
import React, { useEffect, useState } from "react";
import { Night } from './Night.js';

export function WaitingRoom({ socket, username, room, role }) {
  const [userList, setUserList] = useState([]);

  useEffect(() => {
    socket.emit("request_userList", room);

    const handleUserList = (data) => {
      setUserList(data);
    };

    socket.on("user_list", handleUserList);

    return () => {
      socket.off("user_list", handleUserList);
    };
  }, [socket, room]);

  if (userList.length === 5) {
    return <Night socket={socket} username={username} room={room} role={role} />;
  }

  return (
    <div> cats over cows </div>
  );
}
