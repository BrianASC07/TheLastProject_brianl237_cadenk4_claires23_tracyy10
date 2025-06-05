import React, { useEffect, useState } from "react";
import { Morning } from './Morning.js';

export function Dawn({
  socket, username, room, role, spectator, seconds,
  copTarget, setCopTarget, copMessage, setCopMessage, setIsSpectator
}) {
  const [useOnce, setUseOnce] = useState(true);
  const [actOnce, setActOnce] = useState(true);
  const [forCop, setForCop] = useState(true);
  const [aliveUserList, setAliveUserList] = useState([]);
  const [spectatingUserList, setSpectatingUserList] = useState([]);
  const [checkRole, setCheckRole] = useState(false);
  const [roleDescription, setRoleDescription] = useState("");
  const [mafiaTarget, setMafiaTarget] = useState("");
  const [doctorTarget, setDoctorTarget] = useState("");
  const [redirect, setRedirect] = useState(false);
  const [redirectOnce, setRedirectOnce] = useState(true);

  // Request targets once
  useEffect(() => {
    if (useOnce) {
      socket.emit("get_mafia", "");
      socket.emit("get_doctor", "");
      socket.emit("get_cop", "");
      setUseOnce(false);
    }
  }, [useOnce, socket]);

  useEffect(() => {
    if (username === mafiaTarget && mafiaTarget !== doctorTarget) {
      setIsSpectator(true);
    }
  }, [mafiaTarget, doctorTarget]);

  // Listen for targets and cop result
  useEffect(() => {
    const handleMafia = (data) => setMafiaTarget(data);
    const handleDoctor = (data) => setDoctorTarget(data);
    const handleCop = (data) => setCopTarget(data);
    const handleReturnRole = (data) => setCopMessage(data);

    socket.on("recieve_mafia", handleMafia);
    socket.on("recieve_doctor", handleDoctor);
    socket.on("recieve_cop", handleCop);
    socket.on("return_role", handleReturnRole);

    return () => {
      socket.off("recieve_mafia", handleMafia);
      socket.off("recieve_doctor", handleDoctor);
      socket.off("recieve_cop", handleCop);
      socket.off("return_role", handleReturnRole);
    };
  }, [socket, setCopTarget, setCopMessage]);

  // When copTarget is set, ask for their role
  useEffect(() => {
    if (role === "cop" && copTarget) {
      socket.emit("get_role", [copTarget, room]);
    }
  }, [copTarget, role, room, socket]);

  // Listen for alive/spectating list updates
  useEffect(() => {
    const handleAliveList = (data) => setAliveUserList(data);
    const handleSpectatingList = (data) => setSpectatingUserList(data);

    socket.on("user_alive_list", handleAliveList);
    socket.on("user_spectating_list", handleSpectatingList);

    // Request lists on mount
    socket.emit("request_alive_userList", room);
    socket.emit("request_spectating_userList", room);

    return () => {
      socket.off("user_alive_list", handleAliveList);
      socket.off("user_spectating_list", handleSpectatingList);
    };
  }, [socket, room]);

  // Handle killing logic (unchanged)
  useEffect(() => {
    if (mafiaTarget === doctorTarget) {
      // no kill...
    } else if (mafiaTarget === username && role === "mafia") {
      if (actOnce) {
        socket.emit("kill_user", [mafiaTarget, room]);
        setActOnce(false);
      }
    } else if (mafiaTarget !== doctorTarget) {
      if (actOnce) {
        socket.emit("kill_user", [mafiaTarget, room]);
        setActOnce(false);
      }
    }
  }, [mafiaTarget, doctorTarget, actOnce, socket, username, role, room]);

  function ifCop() {
    if (role === "cop" && copTarget && copMessage) {
      return `You snuck out in the dead of night to investigate ${copTarget}, and found that they are the ${copMessage}!`;
    }
    return "";
  }

  const options = async () => {
    await socket.emit("request_alive_userList", room);
    await socket.emit("request_spectating_userList", room);
  };

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

  //options();
  return (
    <div>
      {/* constant() */}
      <p> dawn </p>
      {seconds}

      <p> {ifCop() } </p>
    </div>
  )
}

export default Dawn
