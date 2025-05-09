const express = require("express"); // search up what express does...
const app = express();
const http = require("http");
const cors = require("cors");
const { Server } = require("socket.io");
const sqlite3 = require('sqlite3');
app.use(cors());

const server = http.createServer(app);
const io = new Server(server, {
    cors:{ // cors configures socket.io to prevent errors later on...
        origin: "http://localhost:3000", // tells socket.io to accept requests from this location
        methods: ["GET", "POST"],
    },
});

const pick_role = (in_room) => {
    const chance = 1/(5-in_room.length)
    if (!in_room.includes("mafia")) {
        if (Math.random() <= chance) {
            return "mafia";
        }
    }
    else if (!in_room.includes("cop")) {
        if (Math.random() <= chance) {
            return "cop";
        }
    }
    else if (!in_room.includes("doctor")) {
        if (Math.random() <= chance) {
            return "doctor";
        }
    }
    return "innocent";
};

io.on("connection", (socket) => { // whenever a connection to the serve is detected, grabs 'socket' or the information of the connection 
    console.log(`User connected: ${socket.id}`); // every connection is given a unique id
                //               like f-strings but in js...
    const db = new sqlite3.Database("./database");
    db.run("CREATE TABLE IF NOT EXISTS rooms(user_id TEXT, room_id TEXT, role TEXT)");
    db.close();

    socket.on("join_room", (data) => { // whenever the function join_room is emitted from frontend
        const db = new sqlite3.Database("./database");
        const in_room = db.all(`SELECT role FROM rooms WHERE room_id = ${data}`);
        if (in_room.length < 5) {
            socket.join(data); // adds you to an arbitrary room; you can now emit messages to everyone in that room at once (like clumping...) (https://socket.io/docs/v3/rooms/)
            const role = pick_role(in_room);
            db.run("INSERT INTO rooms (user_id, room_id, role) VALUES (?, ?, ?)", [socket.id, data, role], function(err) {
                if (err) { 
                    return console.log(err.message);
                }
                console.log(`Inserted ${socket.id} into room ${data} as ${role}`);
                db.close();
            });
        }
        console.log(db.run("SELECT * FROM rooms;"));
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
        
        const db = new sqlite3.Database("./database");
        db.run("DELETE FROM rooms WHERE user_id = ?", [socket.id], function(err) {
            if (err) {
                console.log(err.message);
            }
            console.log(`Deleted ${socket.id}`);
            db.close();
        });
    });
});



server.listen(3001, () => { // run 'npm start'
    console.log("SEVERE IS RUNNING");
});