import React, { useEffect, useState } from "react";
import { Night, constant } from './Night.js';

export function Chat({ socket, username, room, role, spectator }) {
    const [currentMessage, setCurrentMessage] = useState(""); // use setCurrentMessage to update var currentMessage
    const [messageList, setMessageList] = useState([]);
    const [seconds, setSeconds] = useState(10);
    const [aliveUserList, setAliveUserList] = useState([]);
    const [spectatingUserList, setSpectatingUserList] = useState([]);
    const [checkRole, setCheckRole] = useState(false);
    const [roleDescription, setRoleDescription] = useState("");

    useEffect(() => { // timer ticks down every second
        return () => {
            setInterval(() => {
                setSeconds(prevSeconds => prevSeconds - 1);
            }, 1000); // 1000 ms -> s
        }
    }, []);

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

    if (seconds <= 0) { // ends the night after timer is up
        return <Night socket={socket} username={username} room={room} role={role} spectator={spectator} />
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
            {constant()}
            <div className="chat-window">
                <div className="chat-header">
                    <p> chat header!!! </p>
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

export default Chat
