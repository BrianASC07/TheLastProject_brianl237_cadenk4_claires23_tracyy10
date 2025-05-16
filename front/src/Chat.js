import React, { useEffect, useState } from "react";

export function Chat({ socket, username, room }) {
    const [currentMessage, setCurrentMessage] = useState(""); // use setCurrentMessage to update var currentMessage
    const [messageList, setMessageList] = useState([]);

    const sendMessage = async () => { // ASYNC causes this function to wait for the AWAIT statement to be finished (a new message is sent) before it runs (otherwise the data required to complete this func would be missing)
        if (currentMessage !== "") { // cannot send empty messages
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
            // console.log(data);
            setMessageList((list) => [...list, data]); // appends data (new message) to the current messageList
        });
    }, [socket]);

    return (
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
    );
}

export default Chat
