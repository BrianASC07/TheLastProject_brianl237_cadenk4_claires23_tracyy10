import React, { useEffect, useState } from "react";
import { JoinRoom } from './JoinRoom.js';

export function Win({socket, username, room, condition}) {
  const [seconds, setSeconds] = useState(5);
  const [whoWon, setWhoWon] =  useState("");
  const [uno, setUno] = useState(true);
  
  // socket.emit("test", condition);

  useEffect(() => { // timer ticks down every second
    return () => {
      setInterval(() => {
        setSeconds(prevSeconds => prevSeconds - 1);
      }, 1000); // 1000 ms -> s
    }
  }, []);

  if (uno) {
    if (condition === "town") {
      setWhoWon("The townsfolk have eliminated all mafia from their party!");
      setUno(false);
    }
    else if (condition === "mafia") {
      setWhoWon("The mafia has killed all other members in the party!");
      setUno(false);
    }
    else if (condition === "fool") {
      setWhoWon("As the fool takes their last breath, you realize that you've made a mistake. The fool has won by getting themself condemned!")
      setUno(false);
    }
  }

  if (seconds <= 0) {
    socket.emit("force_disconnect", [username, room]);
    window.location.reload();
  }

  return (
    <div>
      <p> { whoWon } </p>
      <p> room closes in: </p>
      <p> {seconds} </p>
    </div>
  )
}

export default Win
