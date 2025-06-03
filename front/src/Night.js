import React, { useEffect, useState } from "react";
import { Dawn } from './Dawn.js';
import { Win } from './Win.js';

export function Night({ socket, username, room, role, spectator }) {
  const [aliveUserList, setAliveUserList] = useState([]);
  const [spectatingUserList, setSpectatingUserList] = useState([]);
  const [target, setTarget] = useState("");
  const [checkRole, setCheckRole] = useState(false);
  const [roleDescription, setRoleDescription] = useState("");
  const [seconds, setSeconds] = useState(10);
  const [redirect, setRedirect] = useState(false);
  const [redirectOnce, setRedirectOnce] = useState(true);
  const [youWin, setYouWin] = useState(false);

  // https://react.dev/learn/synchronizing-with-effects#how-to-handle-the-effect-firing-twice-in-development
  // because of how useEffect runs their 'setup' code and 'cleanup' code, effects "running twice" often occur
  // to fix, add the 'cleanup' code which undos the 'setup' code (first instance of running is for bug catching)
  // in this case, i just put everything inside the 'cleanup' code, which idk if its good practice? but it worked :D

  useEffect(() => { // timer ticks down every second
    return () => {
      setInterval(() => {
        setSeconds(prevSeconds => prevSeconds - 1);
      }, 1000); // 1000 ms -> s
    }
  }, []);

  useEffect(() => {
    if (role === 'mafia') {
      socket.emit("set_mafia", target);
    }
    if (role === 'doctor') {
      socket.emit("set_doctor", target);
    }
    if (role === 'cop') {
      socket.emit("set_cop", target);
    }
  }, [role, socket, target]);



  if (seconds <= 0) { // ends the night after timer is up
    // if (redirectOnce) {
    //   socket.emit("redirect_all_in_room", room);
    //   setRedirectOnce(false);
    // }
    return <Dawn socket={socket} username={username} room={room} role={role} spectator={spectator} />
  }

  // if (redirect && seconds < 1) {
  //   return <Dawn socket={socket} username={username} room={room} role={role} spectator={spectator} />
  // }

  // socket.on("redirect", (data) => {
  //   setRedirect(data);
  // });

  const options = async () => {
    await socket.emit("request_alive_userList", room);
    await socket.emit("request_spectating_userList", room);
    if (seconds < 14) {
      await socket.emit("get_all_mafia_in_room", room);
    }
  };

  socket.on("user_alive_list", (data) => {
    setAliveUserList(data);
  });

  socket.on("user_spectating_list", (data) => {
    setSpectatingUserList(data);
  });

  socket.on("recieve_cnt_mafia", (data) => {
    if (data === 0) {
      setYouWin(true);
    }
  })

  if (youWin) {
    return <Win socket={ socket } username={ username} room={room}/>
  }

  const message = () => {
    if (target !== "") {
      if (role === "mafia") {
        return <p> You have selected {target} to kill. </p>
      }
      if (role === "doctor") {
        return <p> You have selected {target} to protect. </p>
      }
      else {
        return <p> You have selected {target} to investigate. </p>
      }
    }
    else if (spectator === false) {
      return <p> You are thinking of who to select... </p>
    }
    else {
      return "";
    }
  }

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
  if (["mafia", "doctor", "cop"].includes(role) && spectator === false) {
    return ( // if special role AND ALIVE
      <div>
        {constant()}
        <p> Select a target: </p>
        {aliveUserList.map((uname, index) => {
          if (username !== uname || role === "doctor") {
            return <button onClick={() => setTarget(uname)}> {uname} </button>
          }
          else { return "" }
        })}
        {message()}
      </div>
    );
  }
  else if (["mafia", "doctor", "cop"].includes(role) && spectator === true) {
    return (
      <div>
        {constant()}
        <p> You may not act, you are dead. </p>
        {message()}
      </div>
    )
  }
  else {
    return ( // innocent
      <div>
        { constant() }
        <p> night </p>
      </div>
    );
  }
}

export default Night
