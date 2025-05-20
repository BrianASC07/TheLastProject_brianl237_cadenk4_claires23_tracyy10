import React, { useEffect, useState } from "react";

export function Night({ socket, username, room, role }) {
    const [userList, setUserList] = useState([]);
    const [target, setTarget] = useState("");

    const options = async() => {
      await socket.emit("request_userList", room);
    };

    socket.on("user_list", (data) => {
      setUserList(data);
    });

    options();
    // return (
    //     <div>
    //         <p>cats on cows</p>
    //         <p>role : {role}</p>
    //         <div>
    //             <p> userList : </p>
    //             { userList.map((username, index) => {
    //                 return <p>{username}</p>
    //             })}
    //         </div>
    //     </div>
    // );

    return (
      <div>
        <p> Select a target: </p>
        <button onClick={() => setTarget("username")}> username </button>
        { userList.map((username, index) => {
          return <button onClick={() => setTarget(username)}> {username} </button>
        })}
      </div>

        // if (role == "") { // special role
        //   <div>
        //     <p> no cats on cows </p>
        //   </div>
        // }
        // else { // innocent
        //
        // }

    );
}