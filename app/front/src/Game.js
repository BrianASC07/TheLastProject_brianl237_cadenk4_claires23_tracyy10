import React, { useEffect, useState } from "react";
import Night from './Night.js';
import Dawn from './Dawn.js';
import Morning from './Morning.js';
import Evening from './Evening.js';
import Dusk from './Dusk.js';

const phases = [
  { name: "Night", duration: 10 },
  { name: "Dawn", duration: 15 },
  { name: "Morning", duration: 20 },
  { name: "Evening", duration: 25 },
  { name: "Dusk", duration: 30 },
];

export function Game({ socket, username, room, role, spectator }) {
    const [phase, setPhase] = useState(0);
    const [seconds, setSeconds] = useState(20);
    const [condemned, setCondemned] = useState("");

    useEffect(() => {
        socket.emit("start_timer", room)
    }, [socket, room]);

    useEffect(() => {
        const handleTimeUpdate = ({ timeLeft, phaseIndex }) => {
            console.log("Received phaseIndex:", phaseIndex);

            setSeconds(timeLeft);
            setPhase(phaseIndex)
            //console.log(timeLeft)
        };
        socket.on("time_update", handleTimeUpdate);

        return () => {
            socket.off("time_update", handleTimeUpdate);
        };
    }, [socket, seconds]);

    useEffect(() => {
        setSeconds(phases[phase].duration);
    }, [phase]);

    switch (phases[phase].name) {
        case "Night":
            return <Night socket={socket} username={username} room={room} role={role} spectator={spectator} seconds={seconds}/>;
        case "Dawn":
            return <Dawn socket={socket} username={username} room={room} role={role} spectator={spectator} seconds={seconds} />;
        case "Morning":
            return <Morning socket={socket} username={username} room={room} role={role} spectator={spectator} seconds={seconds} />;
        case "Evening":
            return <Evening socket={socket} username={username} room={room} role={role} spectator={spectator} seconds={seconds} condemn={condemned} setCondemned={setCondemned}/>;
        case "Dusk":
            return <Dusk socket={socket} username={username} room={room} role={role} spectator={spectator} seconds={seconds} condemn={condemned} setCondemned={setCondemned}/>;
        default:
            return (
                <div>
                    Unknown phase: {phase}
                </div>
            );
    }
}

export default Game;
