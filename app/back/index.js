const express = require("express"); // search up what express does...
const app = express();
const http = require("http");
const cors = require("cors");
const { Server } = require("socket.io");
const sqlite3 = require("sqlite3");
app.use(cors());

const server = http.createServer(app);
const io = new Server(server, {
  cors: { // cors configures socket.io to prevent errors later on...
    origin: "http://localhost:3000", // tells socket.io to accept requests from this location
    methods: ["GET", "POST"],
  },
});

io.on("connection", (socket) => { // whenever a connection to the serve is detected, grabs 'socket' or the information of the connection
  (async () => { try { await createTable() } catch (error) { } })();
  console.log(`User connected: ${socket.id}`); // every connection is given a unique id
  //               like f-strings but in js...

  socket.on("join_room", (data) => { // whenever the function join_room is emitted from frontend
    const room = data[0];
    const username = data[1];
    (async () => {
      try {
        const in_room = await get_roles_in_room(room);
        if (in_room.length < 5) {
          socket.emit("do_not_join", false);
          await add_to_room(socket.id, room, await pick_role(await get_roles_in_room(room)), username, socket);
          socket.join(room); // adds you to an arbitrary room; you can now emit messages to everyone in that room at once (like clumping...) (https://socket.io/docs/v3/rooms/)
          console.log(`User with ID: ${socket.id} joined room: ${room}`);
        }
        else {
          socket.emit("do_not_join", true);
          console.log(`Room ${data} is full.`);
        }
      } catch (error) { }
    })();
  });

  socket.on("send_message", (data) => {
    socket.to(data.room).emit("receive_message", data); // calls the receive_message func in the frontend file
    // emits the message only to the people in that room
  });

  socket.on("request_userList", (data) => {
    (async () => {
      try {
        socket.emit("user_list", await get_users_in_room(data));
      } catch (error) {}
    })();
  });

  socket.on("disconnect", () => {
    (async () => { try { await remove_from_room(socket.id) } catch (error) { } })();
    console.log("User disconnected: ", socket.id) // listens to disconnects from the server
  });
});

server.listen(3001, () => { // run 'npm start'
  console.log("SEVERE IS RUNNING");
});

///////////////////////////////////////////////////////
////////////////////// DATABASE ///////////////////////
///////////////////////////////////////////////////////

function connect() {
  const db = new sqlite3.Database('database.db', (err) => {
    if (err) {
      console.log(err.message);
    }
    // console.log('>>> Connected to the database.');
  });
  return db;
}

function close(db) {
  db.close((err) => {
    if (err) {
      console.log(err.message);
    }
    // console.log('>>> Database closed.')
  });
}

function createTable() {
  const db = connect();
  return new Promise((resolve, reject) => {
    const tables = `
      CREATE TABLE IF NOT EXISTS rooms(user_id TEXT, room_id TEXT, role TEXT, username TEXT);
    `;
    db.run(tables, (err) => {
      if (err) {
        console.log(err.message);
        reject(err);
      }
      resolve(); // console.log('>>> Table[s] added.'));
    });
    close(db);
  });
}

function pick_role(in_room) {
  const only_consider = [];
  if (!in_room.includes("mafia")) only_consider.push("mafia");
  if (!in_room.includes("cop")) only_consider.push("cop");
  if (!in_room.includes("doctor")) only_consider.push("doctor");
  const cnt_innocent = in_room.reduce((count, current) => {
    if (current == "innocent") count++;
    return count;
  }, 0);
  for (let i = 0; i < (2 - cnt_innocent); i++) { only_consider.push("innocent"); }
  return only_consider[Math.floor(Math.random() * only_consider.length)];
}

function add_to_room(user_id, room_id, role, username, socket) {
  const db = connect();
  return new Promise((resolve, reject) => {
    db.run("INSERT INTO rooms (user_id, room_id, role, username) VALUES (?, ?, ?, ?)", [user_id, room_id, role, username], (err) => {
      if (err) {
        console.log(err.message);
        reject(err);
      }
      socket.emit("set_role", role);
      resolve(console.log(`Inserted ${user_id} into room ${room_id} as ${role}`));
    });
    close(db);
  });
}

function get_roles_in_room(room) { // returns an array of roles in a given room
  const db = connect();
  return new Promise((resolve, reject) => {
    db.all("SELECT role FROM rooms WHERE room_id = ?", [room], (err, rows) => {
      if (err) {
        console.log(err.message);
        reject(err);
      }
      const ret = []
      rows.forEach(value => ret.push(value.role));
      resolve(ret);
    });
    close(db);
  });
}

function remove_from_room(user_id) {
  const db = connect();
  return new Promise((resolve, reject) => {
    db.run("DELETE FROM rooms WHERE user_id = ?", [user_id], (err) => {
      if (err) {
        console.log(err.message);
        reject(err);
      }
      resolve(console.log(`Removed ${user_id}.`));
    });
    close(db);
  });
}

function get_users_in_room(room) {
  const db = connect();
  return new Promise((resolve, reject) => {
    db.all("SELECT username FROM rooms WHERE room_id = ?", [room], (err, rows) => {
      if (err) {
        console.log(err.message);
        reject(err);
      }
      const ret = []
      rows.forEach(value => ret.push(value.username));
      resolve(ret);
    });
    close(db);
  });
}
