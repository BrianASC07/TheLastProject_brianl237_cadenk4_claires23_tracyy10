import React, { useEffect, useState } from "react";
import { Dusk } from './Dusk.js';

const styles = {
  container: {
    background: 'linear-gradient(135deg, #181a33 0%, #2c2f4a 100%)',
    color: '#f5f6fa',
    minHeight: '100vh',
    padding: '40px',
    borderRadius: '18px',
    boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  section: {
    background: 'rgba(44, 47, 74, 0.94)',
    borderRadius: '15px',
    padding: '24px 36px',
    margin: '16px 0',
    boxShadow: '0 2px 8px 0 rgba(0,0,0,0.08)',
    width: '100%',
    maxWidth: '420px',
    textAlign: 'center',
  },
  title: {
    fontSize: '2.2rem',
    fontWeight: 700,
    letterSpacing: '2px',
    marginBottom: '12px',
    color: '#6be6ff',
    textShadow: '0 2px 12px #000b, 0 1px 1px #2228',
  },
  role: {
    fontSize: '1.35rem',
    fontWeight: 600,
    margin: '10px 0 18px 0',
    color: '#ffd86b',
    textTransform: 'capitalize',
    textShadow: '0 1px 8px #2226',
  },
  button: {
    background: 'linear-gradient(90deg, #6be6ff 0%, #b86bff 100%)',
    color: '#23244a',
    border: 'none',
    borderRadius: '8px',
    padding: '10px 22px',
    margin: '7px 7px 7px 0',
    fontSize: '1.05rem',
    fontWeight: 600,
    letterSpacing: '1px',
    cursor: 'pointer',
    transition: 'all 0.21s cubic-bezier(.4,0,.2,1)',
    boxShadow: '0 2px 16px #6be6ff44',
  },
  buttonClose: {
    background: 'linear-gradient(90deg, #ff6b6b 0%, #ffb36b 100%)',
    color: '#23244a',
    border: 'none',
    borderRadius: '50%',
    width: '32px',
    height: '32px',
    fontSize: '1.1rem',
    fontWeight: 900,
    cursor: 'pointer',
    margin: '10px 0 0 0',
    boxShadow: '0 2px 8px #f66b6b22',
    transition: 'background 0.18s',
  },
  timer: {
    fontSize: '1.25rem',
    fontWeight: 600,
    margin: '18px 0 10px 0',
    color: '#ffd86b',
    textShadow: '0 1px 6px #0006',
  },
  userList: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    margin: '10px 0 0 0',
    fontSize: '1.09rem',
    color: '#a0e7e5',
  },
  spectatingList: {
    color: '#b8b8c8',
    fontStyle: 'italic',
    fontSize: '0.98rem',
    marginTop: '5px',
  },
  msg: {
    background: 'rgba(107,230,255,.10)',
    borderRadius: '8px',
    padding: '8px 16px',
    margin: '16px auto 8px auto',
    color: '#95e1ff',
    fontWeight: 500,
    fontSize: '1.1rem',
    width: 'fit-content',
    boxShadow: '0 2px 8px #6be6ff11',
  },
  descriptionBox: {
    background: 'rgba(255,255,255,.10)',
    borderRadius: '12px',
    margin: '18px 0 10px 0',
    padding: '16px 20px',
    color: '#fff',
    boxShadow: '0 1px 6px #0004',
    position: 'relative',
  },
};


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
    socket.emit("test", condemned);
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
