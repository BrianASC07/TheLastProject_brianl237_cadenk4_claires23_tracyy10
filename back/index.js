const express = require("express"); // search up what express does...
const app = express();
const http = require("http");
const cors = require("cors");
const { Server } = require("socket.io");
const sqlite3 = require("sqlite3");
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
        socket.join(data); // adds you to an arbitrary room; you can now emit messages to everyone in that room at once (like clumping...) (https://socket.io/docs/v3/rooms/) 
        console.log(`User with ID: ${socket.id} joined room: ${data}`)
    });

    socket.on("send_message", (data) => {
        // console.log(data);
        socket.to(data.room).emit("receive_message", data); // calls the receive_message func in the frontend file
        // emits the message only to the people in that room
    });

    socket.on("disconnect", () => {
        console.log("User disconnected: ", socket.id) // listens to disconnects from the server
    });
});



server.listen(3001, () => { // run 'npm start'
    console.log("SEVERE IS RUNNING");
});