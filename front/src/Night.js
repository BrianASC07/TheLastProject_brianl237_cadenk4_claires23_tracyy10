import React, { useEffect, useState } from "react";

export function Night({ socket, username, room, role }) {
    const [userList, setUserList] = useState([]);

    socket.emit("request_user_list", room);

    useEffect(() => {
        socket.on("user_list", (data) => { 
            setUserList(data);
        });
    }, [socket]);

    return async() => {
        
    }
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
}