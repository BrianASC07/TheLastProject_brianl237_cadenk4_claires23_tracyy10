import React, { useEffect, useState } from "react";
import { JoinRoom } from './JoinRoom.js';

export function Win({socket, username, room}) {
  const [seconds, setSeconds] = useState(5);

  useEffect(() => { // timer ticks down every second
    return () => {
      setInterval(() => {
        setSeconds(prevSeconds => prevSeconds - 1);
      }, 1000); // 1000 ms -> s
    }
  }, []);

  if (seconds <= 0) {
    socket.emit("force_disconnect", [username, room]);
    window.location.reload();
    return <JoinRoom socket={socket}/>
  }

  return (
    <div>
      <p> win condition met </p>
      <p> room closes in: </p>
      <p> {seconds} </p>
    </div>
  )
}

export default Win
