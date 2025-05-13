import express from 'express';
var app = express();
// const http = require("http"); // sqlite making things act funny >:/
import http from 'http';
// const cors = require("cors");
import cors from "cors";
// const { Server } = require("socket.io");
import { Server } from "socket.io";
import { get_roles_in_room, pick_role, add_to_room } from './db.js';
app.use(cors());

const server = http.createServer(app);
const io = new Server(server, {
    cors:{ // cors configures socket.io to prevent errors later on...
        origin: "http://localhost:3000", // tells socket.io to accept requests from this location
        methods: ["GET", "POST"],
    },
});

io.on("connection", (socket) => { // whenever a connection to the serve is detected, grabs 'socket' or the information of the connection
    console.log(`User connected: ${socket.id}`); // every connection is given a unique id
                //               like f-strings but in js...

    socket.on("join_room", (data) => { // whenever the function join_room is emitted from frontend
        const in_room = get_roles_in_room(data); // returns array of roles in given room
        if (in_room.length < 5) {
            socket.join(data); // adds you to an arbitrary room; you can now emit messages to everyone in that room at once (like clumping...) (https://socket.io/docs/v3/rooms/)
            const role = pick_role(in_room); // returns random role
            add_to_room(socket.id, data, role);
        }
        // else stay in waiting room!!!
        // right now waiting room does not exist
        // so you will progress to chat room eitherway
    });

    socket.on("send_message", (data) => {
        // console.log(data);
        socket.to(data.room).emit("receive_message", data); // calls the receive_message func in the frontend file
        // emits the message only to the people in that room
    });

    socket.on("disconnect", () => {
        console.log("User disconnected: ", socket.id) // listens to disconnects from the server

        // const db = new sqlite3.Database("./database");
        // db.run("DELETE FROM rooms WHERE user_id = ?", [socket.id], function(err) {
        //     if (err) {
        //         console.log(err.message);
        //     }
        //     console.log(`Deleted ${socket.id}`);
        //     db.close();
        // });
    });
});



server.listen(3001, () => { // run 'npm start'
    console.log("SEVERE IS RUNNING");
});