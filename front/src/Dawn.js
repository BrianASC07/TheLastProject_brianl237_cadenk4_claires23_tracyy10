import React, { useEffect, useState } from "react";
import { Chat } from './Chat.js';
import { Night, constant } from './Night.js';

export function Dawn({ socket, username, room, role, spectator }) {
  const [useOnce, setUseOnce] = useState(true);
  const [actOnce, setActOnce] = useState(true);
  const [forCop, setForCop] = useState(true);
  const [mafiaTarget, setMafiaTarget] = useState("");
  const [doctorTarget, setDoctorTarget] = useState("");
  const [copTarget, setCopTarget] = useState("");
  const [seconds, setSeconds] = useState(5);
  const [isSpectator, setIsSpectator] = useState(spectator);
  const [copMessage, setCopMessage] = useState("");

  useEffect(() => { // timer ticks down every second
    return () => {
      setInterval(() => {
        setSeconds(prevSeconds => prevSeconds-1);
      }, 1000); // 1000 ms -> s
    }
  }, []);

  if (seconds <= 0) { // ends the night after timer is up
    return <Chat socket={socket} username={username} room={room} role={role} spectator={isSpectator}/>
  }

  if (useOnce) { // grab the targets from backend once
    socket.emit("get_mafia", "");
    socket.emit("get_doctor", "");
    socket.emit("get_cop", "");
    setUseOnce(false);
  }

  socket.on("recieve_mafia", (data) => {
    setMafiaTarget(data);
  });
  socket.on("recieve_doctor", (data) => {
    setDoctorTarget(data);
  });
  socket.on("recieve_cop", (data) => {
    setCopTarget(data);
  });

  if (forCop) { // doesn't need to be in this if-statement, i just don't want it running eternally....
    (async() => {
      try {
        socket.emit("get_role", (copTarget, room));
      } catch (error) {};
    })();
    setForCop(false);
  }

  socket.on("return_role", (data) => {
    setCopMessage(data);
  });

  const ifCop = () => {
    if (role === "cop") {
      return `You snuck out in the dead of night to investigate ${copTarget}, and found that they are the ${copMessage}!`;
    }
    return "";
  }

  const kill = async(target, room) => { // removes the target from socket room and database
    if (actOnce) {
      await socket.emit("kill_user", [target, room]);
      setActOnce(false);
    }
  };

  // IF MAFIA == DOCTOR --> NO KILL + ANIMATION
  if (mafiaTarget === doctorTarget) {
    // no kill...
  }

  // IF MAFIA == MAFIA --> KILL MAFIA target + ANIMATION
  else if (mafiaTarget === username) {
    kill(mafiaTarget, room);
    setIsSpectator(true);
  }

  // IF MAFIA != DOCTOR --> KILL MAFIA target + ANIMATION
  else if (mafiaTarget !== doctorTarget) {
    kill(mafiaTarget, room);
    if (username === mafiaTarget) {
      setIsSpectator(true);
    }
  }

  return (
    <div>
      { constant() }
      <p> ducks are jealous of cats over cows </p>
      <p> Time left : </p>
      {seconds}
      { ifCop() }
    </div>
  )
}
