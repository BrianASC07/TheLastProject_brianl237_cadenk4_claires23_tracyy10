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

// import { Canvas } from './Animation.js';

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
  const [seconds, setSeconds] = useState(15);
  const [isSpectator, setIsSpectator] = useState(spectator);
  const [copMessage, setCopMessage] = useState("");
  const [redirect, setRedirect] = useState(false);
  const [redirectOnce, setRedirectOnce] = useState(true);
  const [narration, setNarration] = useState("");
  const [done, setDone] = useState(false);

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
      var speed = 75;
    } else {
      var speed = 300;
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
                speed = 300;
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
        await socket.emit("get_role", [copTarget, room]);
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
      setNarration(script(mafiaTarget, false));
      setActOnce(false);
    }
  };

  // IF MAFIA == DOCTOR --> NO KILL + ANIMATION
  if (mafiaTarget === doctorTarget) {
    // no kill...
    // setNarration(script(mafiaTarget, false));
  }

  // IF MAFIA != DOCTOR --> KILL MAFIA target + ANIMATION
  else if (mafiaTarget !== doctorTarget) {
    kill(mafiaTarget, room);
    // setNarration(script(mafiaTarget, true));
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
      {/* constant() */}
      <p> dawn </p>
      { Canvas() }
      <p> {narration} </p>
      <p> {ifCop() } </p>
    </div>
  )
}

export default Dawn
