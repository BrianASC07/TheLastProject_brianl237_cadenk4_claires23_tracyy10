import React, { useEffect, useState } from "react";
import { Chat } from './Chat.js';
import { TemporaryDeath} from './TemporaryDeath.js';
import { Night } from './Night.js';
import { Win } from './Win.js';

export function Dawn({ socket, username, room, role }) {
  const [useOnce, setUseOnce] = useState(true);
  const [actOnce, setActOnce] = useState(true);
  const [mafiaTarget, setMafiaTarget] = useState("");
  const [doctorTarget, setDoctorTarget] = useState("");
  const [copTarget, setCopTarget] = useState("");
  const [result, setResult] = useState(1);
  const [seconds, setSeconds] = useState(5);

  useEffect(() => { // timer ticks down every second
    return () => {
      setInterval(() => {
        setSeconds(prevSeconds => prevSeconds-1);
      }, 1000); // 1000 ms -> s
    }
  }, []);

  if (seconds <= 0) { // ends the night after timer is up
    if (result === 1) {
      return <Night socket={socket} username={username} room={room} />
    }
    return <TemporaryDeath socket={socket} username={username} room={room} />
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

  const kill = async(target, room) => { // removes the target from socket room and database
    if (actOnce) {
      await socket.emit("force_disconnect", [target, room]);
      setActOnce(false);
    }
  };

  // (3) IF MAFIA == MAFIA --> KILL MAFIA target + ANIMATION
  if (mafiaTarget === username) {
    kill(mafiaTarget, room);
  }

  // (1) IF MAFIA != DOCTOR --> KILL MAFIA target + ANIMATION
  if (mafiaTarget !== doctorTarget) {
    kill(mafiaTarget, room);
  }

  // (2) IF MAFIA == DOCTOR --> NO KILL + ANIMATION
  if (mafiaTarget === doctorTarget) {
    // no kill...
  }

  return (
    <div>
      <p> ducks are jealous of cats over cows </p>
      <p> mafia picked : {mafiaTarget} </p>
      <p> Time left : </p>
      {seconds}
    </div>
  )
}
