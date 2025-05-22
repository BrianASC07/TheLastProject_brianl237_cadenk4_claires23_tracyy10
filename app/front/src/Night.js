import React, { useEffect, useState, useRef } from "react";
import { Chat } from './Chat.js';

export function Night({ socket, username, room, role }) {
  const [userList, setUserList] = useState([]);
  const [target, setTarget] = useState("");
  const [checkRole, setCheckRole] = useState(false);
  const [roleDescription, setRoleDescription] = useState("");
  const [seconds, setSeconds] = useState(60000);
  const [displayRole, setDisplayRole] = useState(role); // New state for displayed role


  function end_night() {
    return <Chat socket={socket} username={username} room={room} />;
  }

  const interval = useRef(null);
  useEffect(() => {
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
  }, []);

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
      <div style={{ padding: "20px", fontFamily: "Arial, sans-serif", display: "flex", flexDirection: "column", alignItems: "center" }}>
        <div style={{ width: "100%", textAlign: "center", marginBottom: "20px" }}>
          <p style={{ fontSize: "20px", fontWeight: "bold" }}>You are the {role}</p>
          {["mafia", "doctor", "cop", "innocent"].map((role, index) => {
            return <button key={index} onClick={() => description(role)} style={buttonStyle}> {role} </button>
          })}
          {checkRole ? (
            <div style={{ marginTop: "10px", fontSize: "16px", color: "#555", textAlign: "center" }}>
              <p> {roleDescription} </p>
              <button onClick={() => setCheckRole(false)} style={closeButtonStyle}>x</button>
            </div>
          ) : (
            ""
          )}
          <p style={{ fontSize: "18px" }}>Time left: {seconds / 1000} sec</p>
          <p style={{ fontSize: "18px" }}>Count: {count}</p>
          <p style={{ marginTop: "20px", fontSize: "18px", fontStyle: "italic" }}>*** Narration here ***</p>
        </div>
        <div style={{ width: "100%", display: "flex", justifyContent: "space-around", marginTop: "20px" }}>
          <div style={{ flex: 1, padding: "10px", borderRight: "1px solid #ccc" }}>
            <p style={{ fontWeight: "bold" }}>Alive:</p>
            {userList.map((username, index) => {
              return <p key={index}>{username}</p>;
            })}
          </div>
          <div style={{ flex: 1, padding: "10px" }}>
            <p style={{ fontWeight: "bold" }}>Spectating:</p>
            {/* Add in spectator logic */}
          </div>
        </div>
      </div>
    );
  };

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
            return <button key={index} onClick={() => setTarget(uname)} style={buttonStyle}> {uname} </button>;
          }
          return "";
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

const buttonStyle = {
  padding: "8px 16px",
  fontSize: "14px",
  margin: "5px",
  cursor: "pointer",
  backgroundColor: "#4CAF50",
  color: "white",
  border: "none",
  borderRadius: "4px",
  transition: "background-color 0.3s ease",
};

const closeButtonStyle = {
  padding: "5px 10px",
  fontSize: "14px",
  cursor: "pointer",
  backgroundColor: "#f44336",
  color: "white",
  border: "none",
  borderRadius: "50%",
  marginLeft: "10px",
  transition: "background-color 0.3s ease",
};
