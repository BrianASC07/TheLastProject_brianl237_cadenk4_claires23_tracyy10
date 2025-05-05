import React from "react";

export function Chat(socket, username, room) {
    return (
        <div>
            <div className="chat-header">
                <p> chat header!!! </p>
            </div>
            <div className="chat-body"></div>
            <div className="chat-footer">
                <input type="text" placeholder="type ur message..."/>
                <button>&#9658;</button>
            </div>
        </div>
    );
}

export default Chat