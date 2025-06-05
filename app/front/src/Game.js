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

export function Game({ socket, username, room, role }) {
    const [phase, setPhase] = useState(0);
    const [seconds, setSeconds] = useState(20);
    const [condemned, setCondemned] = useState("");
    const [copTarget, setCopTarget] = useState("");
    const [copMessage, setCopMessage] = useState("");
    const [spectator, setIsSpectator] = useState(false);

    useEffect(() => {
        socket.emit("start_timer", room)
    }, [socket, room]);

    useEffect(() => {
        const handleTimeUpdate = ({ timeLeft, phaseIndex }) => {

            setSeconds(timeLeft);
            setPhase(phaseIndex)
        };
        socket.on("time_update", handleTimeUpdate);

        return () => {
            socket.off("time_update", handleTimeUpdate);
        };
    }, [socket, seconds]);

    useEffect(() => {
        setSeconds(phases[phase].duration);
    }, [phase]);

    useEffect(() => {
        const handleCondemned = (data) => setCondemned(data);
        socket.on("return_condemned", handleCondemned);
        return () => {
            socket.off("return_condemned", handleCondemned);
        };
    }, [socket]);
    useEffect(() => {
        if (phases[phase].name === "Evening") {
            setCondemned("");
        }
    }, [phase]);

    switch (phases[phase].name) {
        case "Night":
            return <Night socket={socket} username={username} room={room} role={role} spectator={spectator} seconds={seconds}
/>;
        case "Dawn":
            return <Dawn
                socket={socket}
                username={username}
                room={room}
                role={role}
                spectator={spectator}
                seconds={seconds}
                copTarget={copTarget}
                setCopTarget={setCopTarget}
                copMessage={copMessage}
                setCopMessage={setCopMessage}
                setIsSpectator={setIsSpectator}
            />;
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
