import React, { useEffect, useState } from "react";

export function Night({ socket, username, room, role }) {
    const [userList, setUserList] = useState([]);

    const options = async() => {
      await socket.emit("request_userList", room);
    };

    socket.on("user_list", (data) => {
      setUserList(data);
    });

    options();
    return (
        <div>
            <p>cats on cows</p>
            <p>role : {role}</p>
            <div>
                <p> userList : </p>
                { userList.map((username, index) => {
                    return <p>{username}</p>
                })}
            </div>
        </div>
    );
}


// {userList.map((username, index) => {
//   return {
//     <button> {username} </button>
//   };
// })}
