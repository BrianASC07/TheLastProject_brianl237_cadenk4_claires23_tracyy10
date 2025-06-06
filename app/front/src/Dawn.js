import React, { useRef, useEffect, useState } from "react";
import { Morning } from './Morning.js';
import { script } from './Narration.js';

import background from "./animations/background.png";
import banana from './animations/banana.png';
import blood from './animations/blood.png';
import bug from './animations/bug.png';
import butterfly from './animations/butterfly.png';
import cactus from './animations/cactus.png';
import cookie from './animations/cookie.png';
import dead from './animations/dead.png';
import dog from './animations/dog.png';
import duck from './animations/duck.png';
import exclaim from './animations/exclaim.png';
import oil from './animations/oil.png';
import pumpkin from './animations/pumpkin.png';
import rake from './animations/rake.png';
import rock from './animations/rock.png';
import rot from './animations/rot.png';
import skateboard from './animations/skateboard.png';
import soda from './animations/soda.png';
import string from './animations/string.png';

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
  const [done, setDone] = useState(false);

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

const Canvas = props => {
  const canvaS = useRef(null);

  useEffect(() => {
    const updateCanvas = canvaS.current;
    if (!updateCanvas) { // if null
      return;
    }
    const context = updateCanvas.getContext('2d');

    const image = new Image();
    var img = [];
    
    console.log(narration);

    if (narration.includes("stroll around the neighborhood") || narration.includes("running through a big sunny field") || narration.includes("scouting out possible picnic spots") || narration.includes("cheerfully frolicking") || narration.includes("grandmother's huge garden") || narration.includes("half marathon") || narration.includes("walking in the meadow")) {
        img.push(background);
    } else if (narration.includes("taking their dog for a walk")) {
        img.push(dog);
    } else if (narration.includes("build up their bug collection")) {
        img.push(bug);
    } else if (narration.includes("chase a pretty butterfly")) {
        img.push(butterfly);
    }

    if (narration.includes("upturned rake")) {
        img.push(rake);
    } else if (narration.includes("pet rock")) {
        img.push(rock);
    } else if (narration.includes("puddle of oil")) {
        img.push(oil);
    } else if (narration.includes("banana peel")) {
        img.push(banana);
    } else if (narration.includes("skateboard")) {
        img.push(skateboard);
    } else if (narration.includes("pet duck")) {
        img.push(duck);
    } else if (narration.includes("thorny pet plant")) {
        img.push(cactus);
    } else if (narration.includes("empty soda can")) {
        img.push(soda);
    } else if (narration.includes("jack-o-lantern")) {
        img.push(pumpkin);
    } else if (narration.includes("piece of string")) {
        img.push(string);
    }

    var dead = true;
    if (narration.includes("pool of blood")) {
        img.push(blood);
    } else if (narration.includes("slowly decompose")) {
        img.push(rot);
    } else if (narration.includes("never got up")) {
        img.push(dead);
    } else if (narration.includes("freshly baked cookies")) {
        dead = false;
        img.push(cookie);
    } else {
        dead = false;
        img.push(exclaim);
    }

    image.src = img[0];
    console.log(img);
    var intervalID = null;
    var row = 0;
    var col = 0;
    var tracker = "background";

    if (narration.includes("running") || narration.includes("chase") || narration.includes("marathon")) {
      var speed = 50;
    } else {
      var speed = 150;
    }
    console.log(speed);

    image.onload = function () {
      if ((!done) && img.length!=1) {
        setDone(true);
        console.log("lalala");
        intervalID = setInterval(animate, speed, 4, 3, 3);
        // context.drawImage(image, 1, 1, 400, 400, 0, 0, 500, 500);
      }
    }

    function animate(rows, cols, endCol) {
        if (col === cols) {
            col = 0;
            row += 1;
        }
        console.log(row, col);
        context.clearRect(0, 0, 500, 500);
        context.drawImage(image, 0+480*col, 0+480*row, 480, 480, 0, 0, 500, 500);
        if (row === (rows-1) && col === (endCol-1)) {
            console.log("done w/ sheet");
            clearInterval(intervalID);
            if (tracker === "background") {
                tracker = "action";
                image.src=img[1];
                image.onload = function() {
                    row = 0;
                    col = 0;
                    if (dead) {
                        intervalID = setInterval(animate, speed, 4, 4, 2);
                    } else {
                        intervalID = setInterval(animate, speed, 3, 4, 2);
                    }
                }
            } else if (tracker === "action") {
                tracker = "result";
                speed = 150;
                image.src=img[2];
                image.onload = function() {
                    row = 0;
                    col = 0;
                    if (dead) {
                        intervalID = setInterval(animate, speed, 3, 2, 1);
                    } else {
                        intervalID = setInterval(animate, speed, 4, 3, 2);
                    }
                }
            }
        }
        col += 1;
    }
  }, [narration]);

  return <canvas ref={canvaS} {...props} width="500" height="500"/>
}

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

        { Canvas() }

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
        <p> {ifNarration()} </p>
        <div style={styles.timer}>{seconds}s</div>
        {ifCop()}
      </div>
    </div>
  )
}

export default Dawn
