import React, { useEffect, useState, useRef } from "react";
import { Chat } from './Chat.js';

export function Night({ socket, username, room, role }) {
  const [userList, setUserList] = useState([]);
  const [target, setTarget] = useState("");
  const [checkRole, setCheckRole] = useState(false);
  const [roleDescription, setRoleDescription] = useState("");
  const [seconds, setSeconds] = useState(60000); // 1000 ms -> s

  function end_night() {
    return <Chat socket={socket} username={username} room={room} />
  }

  const interval = useRef(null); // https://react.dev/reference/react/useRef
  useEffect(() => {
    // setInterval(() => { setSeconds(seconds - 1000); }, 1000);
    interval.current = setInterval(() => { setSeconds(seconds - 1000); }, 1000);
    clearInterval(interval);
  }, []);

  const [count, setCount] = useState(0);
  const intervalRef = useRef(null);

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setCount(prevCount => prevCount + 1);
    }, 1000);

    return () => {
      clearInterval(intervalRef.current);
    };
  }, []); // Empty dependency array ensures the effect runs only once







  const options = async () => {
    await socket.emit("request_userList", room);
  };

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
    else {
      return <p> You are thinking of who to select... </p>
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
          {seconds / 1000} {count}
          <p> *** Narration here  *** </p>
          {/* add in narration logic */}
        </div>
        <div /* side */>
          <p> Alive : </p>
          {userList.map((username, index) => {
            return <p>{username}</p>
          })}
          <p> Spectating : </p>
          {/* add in spectator logic */}
        </div>
      </div>
    )
  }

  socket.on("user_list", (data) => {
    setUserList(data);
  });

  options();
  if (["mafia", "doctor", "cop"].includes(role)) {
    return ( // if special role
      <div>
        {constant()}
        <p> Select a target: </p>
        {userList.map((uname, index) => {
          if (username !== uname || role === "doctor") {
            return <button onClick={() => setTarget(uname)}> {uname} </button>
          }
          else { return "" }
        })}
        {message()}
      </div>
    );
  }
  else {
    return ( // innocent
      <div>
        {constant()}
      </div>
    );
  }
}
