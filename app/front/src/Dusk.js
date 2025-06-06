import React, { useRef, useEffect, useState } from "react";
import { Night } from './Night.js';
import guillotine from "./animations/condemn.png";

export function Dusk({ socket, username, room, role, spectator, seconds, condemn, setCondemned}) {
  const [aliveUserList, setAliveUserList] = useState([]);
  const [spectatingUserList, setSpectatingUserList] = useState([]);
  const [checkRole, setCheckRole] = useState(false);
  const [roleDescription, setRoleDescription] = useState("");
  const [isSpectator, setIsSpectator] = useState(spectator);
  const [doOnce2, setDoOnce2] = useState(true);
  const [redirect, setRedirect] = useState(false);
  const [redirectOnce, setRedirectOnce] = useState(true);
  const [done, setDone] = useState(false);

  const Canvas = props => {
    const canvaS = useRef(null);

    useEffect(() => {
      const updateCanvas = canvaS.current;
      if (!updateCanvas) { // if null
        return;
      }
      const context = updateCanvas.getContext('2d');
      const image = new Image();
      image.src = guillotine;
      var intervalID = null;
      var row = 0;
      var col = 0;
      var speed = 300;

      image.onload = function () {
        if (!done) {
          setDone(true);
          intervalID = setInterval(animate, speed, 5, 5, 2);
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
            clearInterval(intervalID);
        }

        col += 1;
      }

    }, []);
    return <canvas ref={canvaS} {...props} width="500" height="500"/>
  }

  const show_condemned = () => {
    if (condemn !== "") {
      (async() => {
        await socket.emit("set_condemned", condemn);
      })();
      return `${condemn} has been sentenced to death by DEATH!!!!`
    }
    else {
      return `A decision could not be reached. Everyone returns to their own cabins feeling uneasy.`
    }
  }

  if (seconds <= 1) { // ends the night after timer is up
    if (doOnce2) {
      (async () => {
        try {
          await socket.emit("reset_condemn_cnts", room);
          if (username === condemn) {
            setIsSpectator(true);
          }
          setDoOnce2(false);
        } catch (error) { };
      })();
    }
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

  const constant = () => {
    return (
      <div>
        <div /* top */>
          <p> You are the </p>
          <p> {role} </p>
          {["mafia", "doctor", "cop", "fool", "innocent"].map((role, index) => {
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
        { Canvas() }
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
      { constant() }
      <p> dusk </p>
      {seconds}

      <p> {show_condemned()} </p>
    </div>
  )
}

export default Dusk
