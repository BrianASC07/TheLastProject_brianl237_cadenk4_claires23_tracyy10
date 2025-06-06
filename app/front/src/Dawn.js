import React, { useEffect, useState } from "react";
import { Morning } from './Morning.js';
import { script } from './narration.js';

const styles = {
  container: {
    background: 'linear-gradient(135deg, #fbeedb 0%, #e6e9f0 100%)',
    color: '#23244a',
    minHeight: '100vh',
    padding: '40px',
    borderRadius: '18px',
    boxShadow: '0 8px 32px 0 rgba(220, 185, 100, 0.10)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  section: {
    background: 'rgba(255, 255, 255, 0.89)',
    borderRadius: '15px',
    padding: '24px 36px',
    margin: '16px 0',
    boxShadow: '0 2px 8px 0 rgba(210, 178, 120, 0.10)',
    width: '100%',
    maxWidth: '420px',
    textAlign: 'center',
  },
  title: {
    fontSize: '2.2rem',
    fontWeight: 700,
    letterSpacing: '2px',
    marginBottom: '12px',
    color: '#e8b067',
    textShadow: '0 2px 12px #ffe9b766, 0 1px 1px #fff8',
  },
  role: {
    fontSize: '1.35rem',
    fontWeight: 600,
    margin: '10px 0 18px 0',
    color: '#6b8aff',
    textTransform: 'capitalize',
    textShadow: '0 1px 8px #d2d2fa66',
  },
  button: {
    background: 'linear-gradient(90deg, #ffd86b 0%, #6b8aff 100%)',
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
    boxShadow: '0 2px 16px #ffd86b33',
  },
  buttonClose: {
    background: 'linear-gradient(90deg, #ff6b6b 0%, #ffd86b 100%)',
    color: '#23244a',
    border: 'none',
    borderRadius: '50%',
    width: '32px',
    height: '32px',
    fontSize: '1.1rem',
    fontWeight: 900,
    cursor: 'pointer',
    margin: '10px 0 0 0',
    boxShadow: '0 2px 8px #f66b6b11',
    transition: 'background 0.18s',
  },
  timer: {
    fontSize: '1.25rem',
    fontWeight: 600,
    margin: '18px 0 10px 0',
    color: '#e8b067',
    textShadow: '0 1px 6px #ffd86b55',
  },
  userList: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    margin: '10px 0 0 0',
    fontSize: '1.09rem',
    color: '#264673',
  },
  spectatingList: {
    color: '#a3a3bb',
    fontStyle: 'italic',
    fontSize: '0.98rem',
    marginTop: '5px',
  },
  msg: {
    background: 'rgba(232,176,103,.11)',
    borderRadius: '8px',
    padding: '8px 16px',
    margin: '16px auto 8px auto',
    color: '#b67c14',
    fontWeight: 500,
    fontSize: '1.1rem',
    width: 'fit-content',
    boxShadow: '0 2px 8px #ffd86b11',
  },
  descriptionBox: {
    background: 'rgba(255,255,255,.14)',
    borderRadius: '12px',
    margin: '18px 0 10px 0',
    padding: '16px 20px',
    color: '#23244a',
    boxShadow: '0 1px 6px #ffd86b33',
    position: 'relative',
  },
};

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
  const [narration, setNarration] = useState("");

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
    if (mafiaTarget === doctorTarget && mafiaTarget !== "") {
      setNarration(script(mafiaTarget, false));
    } else if (mafiaTarget !== doctorTarget) {
      if (actOnce) {
        socket.emit("kill_user", [mafiaTarget, room]);
        setNarration(script(mafiaTarget, true));
        setActOnce(false);
      }
    }
  }, [mafiaTarget, doctorTarget, actOnce, socket, username, role, room]);

  function ifCop() {
    if (role === "cop" && copTarget && copMessage) {
      return (
        <div style={styles.msg}>
          You snuck out in the dead of night to investigate <b>{copTarget}</b>, and found that they are the <b>{copMessage}</b>!
        </div>
      );
    }
    return "";
  }

  const ifNarration = () => {
    if (narration !== "") {
      return narration;
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
      setRoleDescription("The mafia's goal is to kill off all the other members in the party while not getting caught. Every night, they can select another player and send death vibes their way!");
    }
    else if (role === "doctor") {
      setRoleDescription("The doctor is a member of the townsfolk with a very special job. Every night, they can select another player and protect them from misfortune.");
    }
    else if (role === "cop") {
      setRoleDescription("The cop is a member of the townsfolk with a very special job. Every night, they can select another player and investigate them and find out their role!");
    }
    else if (role === "fool") {
      setRoleDescription("The fool is neither aligned with the townsfolk nor the mafia. They win upon getting condemned and hung.")
    }
    else {
      setRoleDescription("The innocent is a member of the townsfolk.");
    }
  }

  function constant() {
    return (
      <div style={styles.section}>
        <div>
          <div style={styles.title}>Dawn Phase</div>
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
          <div style={styles.timer}>🌅 Time left: <span>{seconds}s</span></div>
        </div>
        <div style={{ marginTop: '18px' }}>
          <div style={{ fontWeight: 600, color: '#e8b067' }}>Alive:</div>
          <div style={styles.userList}>
            {aliveUserList.map((uname, idx) => (
              <span key={uname + idx}>{uname}</span>
            ))}
          </div>
          <div style={{ fontWeight: 600, color: '#6b8aff', marginTop: 12 }}>Spectating:</div>
          <div style={styles.spectatingList}>
            {spectatingUserList.map((uname, idx) => (
              <span key={uname + idx}>{uname}</span>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {constant()}
      <div style={styles.section}>
        <div style={styles.title}>Dawn</div>
        <div style={styles.timer}>{seconds}s</div>
        {ifCop()}
      </div>
    </div>
  )
}

export default Dawn
