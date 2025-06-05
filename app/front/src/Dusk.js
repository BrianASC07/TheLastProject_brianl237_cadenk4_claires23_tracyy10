import React, { useEffect, useState } from "react";
import { Night } from './Night.js';
import { DuskHelper } from './DuskHelper.js'

export function Dusk({ socket, username, room, role, spectator, seconds, condemn, setCondemned}) {
  const [aliveUserList, setAliveUserList] = useState([]);
  const [spectatingUserList, setSpectatingUserList] = useState([]);
  const [checkRole, setCheckRole] = useState(false);
  const [roleDescription, setRoleDescription] = useState("");
  const [isSpectator, setIsSpectator] = useState(spectator);
  const [doOnce2, setDoOnce2] = useState(true);
  const [redirect, setRedirect] = useState(false);
  const [redirectOnce, setRedirectOnce] = useState(true);


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
      return `${condemn} has been sentenced to death by DEATH!!!!`
    }
    else {
      return `A decision could not be reached. Everyone returns to their own cabins feeling uneasy.`
    }
  }

  if (seconds <= 0) { // ends the night after timer is up
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

    // if (redirectOnce) {
    //   socket.emit("redirect_all_in_room", room);
    //   setRedirectOnce(false);
    // }

  }

  // if (redirect && seconds < 10) {
  //   return <Night socket={socket} username={username} room={room} role={role} spectator={isSpectator} />
  // }

  // socket.on("redirect", (data) => {
  //   setRedirect(data);
  // });

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
      <p> dusk </p>
      <p> this is who {condemn} </p>
      {seconds}
      { Canvas() }
      <p> {show_condemned()} </p>
      //TESTING RN
      { DuskHelper() }
    </div>

  )
}

export default Dusk
