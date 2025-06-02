import React, { useEffect, useState } from "react";
import { Dusk } from './Dusk.js';

export function Evening({ socket, username, room, role, spectator }) {
  const [aliveUserList, setAliveUserList] = useState([]);
  const [spectatingUserList, setSpectatingUserList] = useState([]);
  const [checkRole, setCheckRole] = useState(false);
  const [roleDescription, setRoleDescription] = useState("");
  const [seconds, setSeconds] = useState(15);
  const [target, setTarget] = useState("");
  const [doOnce, setDoOnce] = useState(true);
  const [idiotTriedToVote, setIdiotTriedToVote] = useState("");
  const [redirect, setRedirect] = useState(false);
  const [redirectOnce, setRedirectOnce] = useState(true);
  const [condemned, setCondemned] = useState("");

  const picked_who = () => {
    if (target !== "" && spectator === false) {
      return <p> You have voted for {target} to be condemned to death! </p>
    }
    return <p> Who do you think is the most suspicious? </p>
  }

  const vote = (uname) => {
    if (spectator === false) {
      setTarget(uname);
    }
    else {
      setIdiotTriedToVote("You may not vote, you are dead.");
    }
  }

  useEffect(() => { // timer ticks down every second
    return () => {
      setInterval(() => {
        setSeconds(prevSeconds => prevSeconds - 1);
      }, 1000); // 1000 ms -> s
    }
  }, []);

  if (seconds <= 0) { // ends the night after timer is up
    if (doOnce && target !== "") {
      (async () => {
        try {
          await socket.emit("update_condemnCnt", [target, room]);
          await socket.emit("get_condemned", room);
          setDoOnce(false);
        } catch (error) { };
      })();
    }

    if (redirectOnce && doOnce == false) {
      socket.emit("redirect_all_in_room", room);
      setRedirectOnce(false);
    }
    // return <Dusk socket={socket} username={username} room={room} role={role} spectator={spectator} />
  }

  socket.on("return_condemned", (data) => {
    setCondemned(data);
  })

  if (redirect && seconds < 10) {
    return <Dusk socket={socket} username={username} room={room} role={role} spectator={spectator} condemn={condemned}/>
  }

  socket.on("redirect", (data) => {
    setRedirect(data);
  });

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
      {/* constant() */}
      <p> evening </p>
      {seconds}

      <p> CONDEMN </p>
      {aliveUserList.map((uname, index) => {
        return [<p> {uname} <button onClick={() => vote(uname)}> 💀 </button></p>];
      })}
      <p> {picked_who()} </p>
      <p> {idiotTriedToVote} </p>
    </div>
  )
}

export default Evening
