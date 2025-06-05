import React, { useEffect, useState } from "react";
import { Dawn } from './Dawn.js';
import { Win } from './Win.js';

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


export function Night({ socket, username, room, role, spectator, seconds }) {
  const [aliveUserList, setAliveUserList] = useState([]);
  const [spectatingUserList, setSpectatingUserList] = useState([]);
  const [target, setTarget] = useState("");
  const [checkRole, setCheckRole] = useState(false);
  const [roleDescription, setRoleDescription] = useState("");
  const [youWin, setYouWin] = useState(false);

  // https://react.dev/learn/synchronizing-with-effects#how-to-handle-the-effect-firing-twice-in-development
  // because of how useEffect runs their 'setup' code and 'cleanup' code, effects "running twice" often occur
  // to fix, add the 'cleanup' code which undos the 'setup' code (first instance of running is for bug catching)
  // in this case, i just put everything inside the 'cleanup' code, which idk if its good practice? but it worked :D

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

  useEffect(() => {
    socket.emit("request_alive_userList", room);
    socket.emit("request_spectating_userList", room);
    if (seconds < 14) {
      socket.emit("get_all_mafia_in_room", room);
    }
  }, [socket, room, seconds]);

  useEffect(() => {
    const handleAliveList = (data) => setAliveUserList(data);
    const handleSpectatingList = (data) => setSpectatingUserList(data);
    const handleCntMafia = (data) => { if (data === 0) setYouWin(true); };

    socket.on("user_alive_list", handleAliveList);
    socket.on("user_spectating_list", handleSpectatingList);
    socket.on("recieve_cnt_mafia", handleCntMafia);

    return () => {
      socket.off("user_alive_list", handleAliveList);
      socket.off("user_spectating_list", handleSpectatingList);
      socket.off("recieve_cnt_mafia", handleCntMafia);
    };
  }, [socket]);

  if (youWin) {
    return <Win socket={ socket } username={ username} room={room}/>
  }

  const message = () => {
    if (target !== "") {
      if (role === "mafia") {
        return <div style={styles.msg}>You have selected <b>{target}</b> to kill.</div>
      }
      if (role === "doctor") {
        return <div style={styles.msg}>You have selected <b>{target}</b> to protect.</div>
      }
      else {
      return <div style={styles.msg}>You have selected <b>{target}</b> to investigate.</div>;
      }
    }
    else if (spectator === false) {
      return <div style={styles.msg}>You are thinking of who to select...</div>
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

  function constant() {
    return (
      <div style={styles.section}>
        <div>
          <div style={styles.title}>Night Phase</div>
          <div style={styles.role}>You are the <span>{role}</span></div>
          <div>
            {["mafia", "doctor", "cop", "innocent"].map((roleName) => (
              <button
                key={roleName}
                style={styles.button}
                onClick={() => description(roleName)}
              >
                {roleName.charAt(0).toUpperCase() + roleName.slice(1)}
              </button>
            ))}
          </div>
          {checkRole && (
            <div style={styles.descriptionBox}>
              <div>{roleDescription}</div>
              <button
                style={styles.buttonClose}
                onClick={() => setCheckRole(false)}
                aria-label="Close"
              >
                ×
              </button>
            </div>
          )}
          <div style={styles.timer}>⏳ Time left: <span>{seconds}s</span></div>
        </div>
        <div style={{ marginTop: '18px' }}>
          <div style={{ fontWeight: 600, color: '#6be6ff' }}>Alive:</div>
          <div style={styles.userList}>
            {aliveUserList.map((uname, idx) => (
              <span key={uname + idx}>{uname}</span>
            ))}
          </div>
          <div style={{ fontWeight: 600, color: '#b86bff', marginTop: 12 }}>Spectating:</div>
          <div style={styles.spectatingList}>
            {spectatingUserList.map((uname, idx) => (
              <span key={uname + idx}>{uname}</span>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (["mafia", "doctor", "cop"].includes(role) && !spectator) {
    return (
      <div style={styles.container}>
        {constant()}
        <div style={styles.section}>
          <div style={styles.title}>Select a target</div>
          {aliveUserList.map((uname, idx) => {
            if (username !== uname || role === "doctor" || role === "mafia") {
              return (
                <button
                  key={uname + idx}
                  style={styles.button}
                  onClick={() => setTarget(uname)}
                >
                  {uname}
                </button>
              );
            }
            return null;
          })}
          {message()}
        </div>
      </div>
    );
  } else if (["mafia", "doctor", "cop"].includes(role) && spectator) {
    return (
      <div style={styles.container}>
        {constant()}
        <div style={styles.section}>
          <div style={styles.msg}>You may not act, you are dead.</div>
          {message()}
        </div>
      </div>
    );
  } else {
    // Innocent/other roles
    return (
      <div style={styles.container}>
        <div style={styles.section}>
          <div style={styles.title}>Night</div>
          <div style={styles.timer}>{seconds}s</div>
        </div>
      </div>
    );
  }
}

export default Night
