import React, { useEffect, useState } from "react";
import { Morning } from './Morning.js';
import { script } from './Narration.js';
import { Canvas } from './Animation.js';

export function Dawn({ socket, username, room, role, spectator }) {
  const [useOnce, setUseOnce] = useState(true);
  const [actOnce, setActOnce] = useState(true);
  const [forCop, setForCop] = useState(true);
  const [aliveUserList, setAliveUserList] = useState([]);
  const [spectatingUserList, setSpectatingUserList] = useState([]);
  const [checkRole, setCheckRole] = useState(false);
  const [roleDescription, setRoleDescription] = useState("");
  const [mafiaTarget, setMafiaTarget] = useState("");
  const [doctorTarget, setDoctorTarget] = useState("");
  const [copTarget, setCopTarget] = useState("");
  const [seconds, setSeconds] = useState(5);
  const [isSpectator, setIsSpectator] = useState(spectator);
  const [copMessage, setCopMessage] = useState("");
  const [redirect, setRedirect] = useState(false);
  const [redirectOnce, setRedirectOnce] = useState(true);
  const [narration, setNarration] = useState("");

  useEffect(() => { // timer ticks down every second
    return () => {
      setInterval(() => {
        setSeconds(prevSeconds => prevSeconds - 1);
      }, 1000); // 1000 ms -> s
    }
  }, []);

  useEffect(() => {
    if (username === mafiaTarget && mafiaTarget !== doctorTarget) {
      setIsSpectator(true);
    }
  }, [mafiaTarget, doctorTarget]);

  if (seconds <= 0) { // ends the night after timer is up
    if (redirectOnce) {
      socket.emit("redirect_all_in_room", room);
      setRedirectOnce(false);
    }
  }

  if (redirect && seconds < 1) {
    return <Morning socket={socket} username={username} room={room} role={role} spectator={isSpectator} />
  }

  socket.on("redirect", (data) => {
    setRedirect(data);
  });

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

  if (forCop && copTarget !== "") { // doesn't need to be in this if-statement, i just don't want it running eternally....
    (async () => {
      try {
        socket.emit("get_role", [copTarget, room]);
      } catch (error) { };
    })();
    setForCop(false);
  }

  socket.on("return_role", (data) => {
    setCopMessage(data);
  });

  const ifCop = () => {
    if (role === "cop" && copTarget !== "") {
      return `You snuck out in the dead of night to investigate ${copTarget}, and found that they are the ${copMessage}!`;
    }
    return "";
  }

  const kill = async (target, room) => { // removes the target from socket room and database
    if (actOnce) {
      await socket.emit("kill_user", [target, room]);
      if (username === mafiaTarget) {
      }
      setActOnce(false);
    }
  };

  // IF MAFIA == DOCTOR --> NO KILL + ANIMATION
  if (mafiaTarget === doctorTarget) {
    // no kill...
    setNarration(script(mafiaTarget, false));
  }

  // no more suicide :')'
  // // IF MAFIA == MAFIA --> KILL MAFIA target + ANIMATION
  // else if (mafiaTarget === username && role === "mafia") {
  //   kill(mafiaTarget, room);
  // }

  // IF MAFIA != DOCTOR --> KILL MAFIA target + ANIMATION
  else if (mafiaTarget !== doctorTarget) {
    kill(mafiaTarget, room);
    setNarration(script(mafiaTarget, true));
  }

  const options = async () => {
    await socket.emit("request_alive_userList", room);
    await socket.emit("request_spectating_userList", room);
  };

  socket.on("user_alive_list", (data) => {
    setAliveUserList(data);
  });

  socket.on("user_spectating_list", (data) => {
    setSpectatingUserList(data);
  });

  function description(role) {
    setCheckRole(true);
    if (role === "mafia") {
      setRoleDescription("The mafia is the evil guy, blah blah blah, kill someone each night...");
    }
    else if (role === "doctor") {
      setRoleDescription("The doctor is a pretty cool role, blah blah blah, grant invincibility to a person for a night...");
    }
    else if (role === "cop") {
      setRoleDescription("The cop is cool i guess, blah blah blah, select someone to investigate each night to learn their role in the morning...");
    }
    else {
      setRoleDescription("The innocent is a basic role... you have no special role at night. Fear not because there is power in numbers, pay attention to the others' behaviour and vote to condemn the suspicious in the morning!");
    }
  }

  const constant = () => {
    return (
      <div>
        <div /* top */>
          <p> You are the </p>
          <p> {role} </p>
          {["mafia", "doctor", "cop", "innocent"].map((role, index) => {
            return <button onClick={() => description(role)}> {role} </button>
          })}
          {checkRole ? (
            <div>
              <p> {roleDescription} </p>
              <button onClick={() => setCheckRole(false)}> x </button>
            </div>
          ) : (
            ""
          )}
          <p> Time left : </p>
          {seconds}
        </div>
        <div /* side */>
          <p> Alive : </p>
          {aliveUserList.map((username, index) => {
            return <p>{username}</p>
          })}
          <p> Spectating : </p>
          {spectatingUserList.map((username, index) => {
            return <p>{username}</p>
          })}
        </div>
      </div>
    )
  }

  options();
  return (
    <div>
      { constant() }
      <p> dawn </p>
      { Canvas(narration) }
      <p> {ifCop() } </p>
    </div>
  )
}

export default Dawn
