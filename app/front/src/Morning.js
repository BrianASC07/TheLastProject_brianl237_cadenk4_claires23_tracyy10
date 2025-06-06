import React, { useEffect, useState } from "react";
import { Evening } from './Evening.js';
import { Win } from './Win.js';

export function Morning({ socket, username, room, role, spectator, seconds }) {
    const [currentMessage, setCurrentMessage] = useState(""); // use setCurrentMessage to update var currentMessage
    const [messageList, setMessageList] = useState([]);
    const [aliveUserList, setAliveUserList] = useState([]);
    const [spectatingUserList, setSpectatingUserList] = useState([]);
    const [checkRole, setCheckRole] = useState(false);
    const [roleDescription, setRoleDescription] = useState("");
    const [redirect, setRedirect] = useState(false);
    const [redirectOnce, setRedirectOnce] = useState(true);
    const [youWin, setYouWin] = useState([false, ""]);

    const sendMessage = async () => { // ASYNC causes this function to wait for the AWAIT statement to be finished (a new message is sent) before it runs (otherwise the data required to complete this func would be missing)
        if (currentMessage !== "" && spectator === false) { // cannot send empty messages
            const messageData = { // create a message object to emit
                room: room,
                author: username,
                message: currentMessage,
                time: new Date(Date.now()).getHours() + ":" + new Date(Date.now()).getMinutes(),
                // built into javascript, you can grab current time values
            };

            await socket.emit("send_message", messageData); // calls send_message on backend and sends the mesage object
            setMessageList((list) => [...list, messageData]); // adds your own message to the list
            setCurrentMessage(""); // resets your typie bar to nada
        }
    };

    useEffect(() => { // will call the function inside the useEffect whenever a specific change in socket occurs
        socket.off("receive_message").on("receive_message", (data) => { // the change will be when 'receive_message' is called
            // socket.off once bc it was sending twice (prevents that instance from running)
            setMessageList((list) => [...list, data]); // appends data (new message) to the current messageList
        });
    }, [socket]);

    const options = async () => {
        await socket.emit("request_alive_userList", room);
        await socket.emit("request_spectating_userList", room);
        await socket.emit("get_all_mafia_in_room", room);
    };

    socket.on("user_alive_list", (data) => {
        setAliveUserList(data);
    });

    socket.on("user_spectating_list", (data) => {
        setSpectatingUserList(data);
    });

    socket.on("recieve_cnt_mafia", (data) => {
      if (data === 0) {
        setYouWin([true, "town"]);
      }
    });

    if (youWin[0]) {
        return <Win socket={ socket } username={ username} room={room} condition={youWin[1]}/>
    }

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
            <div className="chat-window">
                <div className="chat-header">
                    <p> chat header!!! </p>
                    {seconds}
                </div>
                <div className="chat-body">
                    {messageList.map((messageContent, index) => { // .map returns a new array by modifying every element of the og array (aka for loop!)
                        return (
                            <div className="message">
                                <div>
                                    <div className="message-content">
                                        <p>{messageContent.message}</p> {/*returns the message component of each messageData (ref above)*/}
                                    </div>
                                    <div className="message-meta">
                                        <p>{messageContent.time}&nbsp;</p>
                                        <p>{messageContent.author}</p>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
                <div className="chat-footer"> {/* takes in message */}
                    <input
                        type="text"
                        value={currentMessage} // allows you to clear the message when youre done typing
                        placeholder="type ur message..."
                        onChange={(event) => {
                            setCurrentMessage(event.target.value); // stores message for emitting
                        }}
                        onKeyPress={(event) => { event.key === 'Enter' && sendMessage(); }} // if press enter key, will send message
                    />
                    <button onClick={sendMessage}>&#9658;</button>
                    {/* upon clicking, calls sendMessage */}
                </div>
            </div>
        </div>
    );
}

export default Morning
