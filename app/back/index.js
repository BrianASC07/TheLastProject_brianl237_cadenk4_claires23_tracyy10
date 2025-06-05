const express = require("express"); // search up what express does...
const app = express();
const http = require("http");
const cors = require("cors");
const { Server } = require("socket.io");
const sqlite3 = require("sqlite3");
app.use(cors());


var mafiaSelect = "";
var doctorSelect = "";
var copSelect = "";

const phases = [
  { name: "Night", duration: 15 },
  { name: "Dawn", duration: 6 },
  { name: "Morning", duration: 10 },
  { name: "Evening", duration: 15 },
  { name: "Dusk", duration: 7 },
];

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
        }
        else {
          socket.emit("do_not_join", true);
          console.log(`Room ${room} is full.`);
        }
      } catch (error) { }
    })();
  });

  socket.on("start_timer", (data) => {
    (async () => {
      try {
        let phaseIndex = await get_room_phase(data);
        let timeLeft = phases[phaseIndex].duration;

        io.to(data).emit("time_update", { timeLeft, phaseIndex });

        const interval = setInterval(async () => {
          timeLeft -= 1;

          if (timeLeft > 0) {
            io.to(data).emit("time_update", { timeLeft, phaseIndex });
          } else {
            phaseIndex = (phaseIndex + 1) % phases.length;
            const db = connect();
            db.run("UPDATE rooms SET phase = ? WHERE room_id = ?", [phaseIndex, data]);
            db.close();
            timeLeft = phases[phaseIndex].duration;

            // ---- NEW: Calculate condemned when moving from Evening to Dusk ----
            if (phases[phaseIndex - 1]?.name === "Evening" && phases[phaseIndex].name === "Dusk") {
              const condemned_name = await get_highest_condemn(data);
              let condemned = "";
              if (condemned_name[0][1] === 0) {
                condemned = "";
              } else if (condemned_name.length > 1 && condemned_name[0][1] === condemned_name[1][1]) {
                condemned = "";
              } else {
                condemned = condemned_name[0][0];
                await set_spectator(condemned, data);
              }
              io.to(data).emit("return_condemned", condemned);
            }
            // ---------------------------------------------------------------

            io.to(data).emit("time_update", { timeLeft, phaseIndex });
          }
        }, 1000);
      } catch (error) { }
    })()
  });

  socket.on("send_message", (data) => {
    socket.to(data.room).emit("receive_message", data); // calls the receive_message func in the frontend file
    // emits the message only to the people in that room
  });

  socket.on("request_userList", (data) => {
    (async () => {
      try {
        socket.emit("user_list", await get_users_in_room(data));
      } catch (error) { }
    })();
  });

  socket.on("request_alive_userList", (data) => {
    (async () => {
      try {
        socket.emit("user_alive_list", await get_alive_users_in_room(data));
      } catch (error) { }
    })();
  });

  socket.on("request_spectating_userList", (data) => {
    (async () => {
      try {
        socket.emit("user_spectating_list", await get_spectating_users_in_room(data));
      } catch (error) { }
    })();
  });

  socket.on("set_mafia", (data) => {
    console.log("mafia selected : " + data);
    mafiaSelect = data;
  });

  socket.on("set_doctor", (data) => {
    console.log("doctor selected : " + data);
    doctorSelect = data;
  });

  socket.on("set_cop", (data) => {
    console.log("cop selected : " + data);
    copSelect = data;
  });

  socket.on("get_mafia", (data) => {
    socket.emit("recieve_mafia", mafiaSelect);
  });

  socket.on("get_doctor", (data) => {
    socket.emit("recieve_doctor", doctorSelect);
  });

  socket.on("get_cop", (data) => {
    socket.emit("recieve_cop", copSelect);
  });

  socket.on("force_disconnect", (data) => {
    (async () => {
      try {
        const userID = await get_user_id(data[0], data[1]);
        await remove_from_room(userID);
        io.in(userID).disconnectSockets();
      } catch (error) { }
    })();
  });

  socket.on("kill_user", (data) => {
    (async () => {
      try {
        await set_spectator(data[0], data[1]);
        // Emit updated lists to everyone in the room
        io.to(data[1]).emit("user_alive_list", await get_alive_users_in_room(data[1]));
        io.to(data[1]).emit("user_spectating_list", await get_spectating_users_in_room(data[1]));
      } catch (error) { }
    })();
  });

  socket.on("get_role", (data) => {
    (async () => {
      try {
        socket.emit("return_role", await get_role(data[0], data[1]));
      } catch (error) { }
    })();
  });

  socket.on("update_condemnCnt", (data) => {
    (async () => {
      try {
        await update_condemn_count(data[0], data[1]);
      } catch (error) { };
    })();
  });

  socket.on("get_condemned", (data) => {
    (async () => {
      try {
        const condemned_name = await get_highest_condemn(data);
        if (condemned_name[0][1] === 0) {
          socket.emit("return_condemned", "");
        }
        else if (condemned_name.length > 1 && condemned_name[0][1] === condemned_name[1][1]) {
          socket.emit("return_condemned", "");
        }
        else {
          socket.emit("return_condemned", condemned_name[0][0]);
          await set_spectator(await condemned_name[0][0], data);
        }
      } catch (error) { };
    })();
  });

  socket.on("reset_condemn_cnts", (data) => {
    (async () => {
      try {
        await reset_condemn_cnt(data);
      } catch (error) { };
    })();
  });

  socket.on("redirect_all_in_room", (data) => { // [room, page]
    // console.log("is redirecting .........................");
    socket.to(data).emit("redirect", true);
  })


  socket.on("get_all_mafia_in_room", (data) => {
    (async() => {
      try {
        socket.emit("recieve_cnt_mafia", await get_how_many_role_in_room("mafia", data));
      } catch (error) {};
    })();
  });

  socket.on("disconnect", () => {
    (async () => { try { await remove_from_room(socket.id) } catch (error) { } })();
    console.log("User disconnected: ", socket.id) // listens to disconnects from the server
  });

  socket.on("test", (data) => {
    console.log(`!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!! ${data}`);
  })
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
      CREATE TABLE IF NOT EXISTS rooms(user_id TEXT, room_id TEXT, role TEXT, username TEXT, spectating REAL, condemnCnt REAL, phase REAL);
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
    db.run("INSERT INTO rooms (user_id, room_id, role, username, spectating, condemnCnt, phase) VALUES (?, ?, ?, ?, ?, ?, ?)", [user_id, room_id, role, username, 0, 0, 0], (err) => {
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

function get_room_phase(room) {
  const db = connect();
  return new Promise((resolve, reject) => {
    db.get("SELECT phase FROM rooms WHERE room_id = ?", [room], (err, rows) => {
      if (err) {
        console.log(err.message);
        reject(err);
      }
      resolve(rows.phase);
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
      if (rows !== undefined) {
        rows.forEach(value => ret.push(value.role));
      }
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

function get_alive_users_in_room(room) {
  const db = connect();
  return new Promise((resolve, reject) => {
    db.all("SELECT username FROM rooms WHERE room_id = ? AND spectating = ?", [room, 0], (err, rows) => {
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

function get_spectating_users_in_room(room) {
  const db = connect();
  return new Promise((resolve, reject) => {
    db.all("SELECT username FROM rooms WHERE room_id = ? AND spectating = ?", [room, 1], (err, rows) => {
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

function get_user_id(username, room) {
  const db = connect();
  return new Promise((resolve, reject) => {
    db.get("SELECT user_id FROM rooms WHERE username = ? AND room_id = ?", [username, room], (err, rows) => {
      if (err) {
        console.log(err.message);
        reject(err);
      }
      if (typeof(rows) !== undefined) {
        resolve(rows.userID);
      }
      resolve(console.log("Row 351 unidentified error (timing misaligned, most likely)"));
    });
    close(db);
  });
}

function set_spectator(username, room) {
  const db = connect();
  return new Promise((resolve, reject) => {
    db.run("UPDATE rooms SET spectating = 1 WHERE username = ? AND room_id = ?", [username, room], (err, rows) => {
      if (err) {
        console.log(err.message);
        reject(err);
      }
      resolve(console.log(`Set ${username} as spectator.`));
    });
    close(db);
  });

}

function get_role(username, room) {
  const db = connect();
  return new Promise((resolve, reject) => {
    db.get("SELECT role FROM rooms WHERE username = ? AND room_id = ?", [username, room], (err, rows) => {
      if (err) {
        console.log(err.message);
        reject(err);
      }
      resolve(rows.role);
    });
    close(db);
  });
}

function update_condemn_count(username, room) {
  const db = connect();
  return new Promise((resolve, reject) => {
    db.run("UPDATE rooms SET condemnCnt = condemnCnt +1 WHERE username = ? AND room_id = ?", [username, room], (err, rows) => {
      if (err) {
        console.log(err.message);
        reject(err);
      }
      resolve(console.log(`Someone has voted for ${username}`));
    });
    close(db);
  });
}

function get_highest_condemn(room) {
  const db = connect();
  return new Promise((resolve, reject) => {
    db.all("SELECT * FROM rooms WHERE room_id = ? ORDER BY condemnCnt DESC", [room], (err, rows) => {
      if (err) {
        console.log(err.message);
        reject(err);
      }
      var ret = [];
      rows.map((row, index) => {
        ret.push([row.username, row.condemnCnt]);
      })
      console.log(ret);
      resolve(ret);
    });
    close(db);
  });
}

function reset_condemn_cnt(room) {
  const db = connect();
  return new Promise((resolve, reject) => {
    db.run("UPDATE rooms SET condemnCnt = 0 WHERE room_id = ?", [room], (err, rows) => {
      if (err) {
        console.log(err.message);
        reject(err);
      }
      resolve(console.log(`Reset all condemnCnt in room_id: ${room}`));
    })
  })
}

function get_how_many_role_in_room(role, room) {
  const db = connect();
  return new Promise((resolve, reject) => {
    db.all("SELECT role FROM rooms WHERE room_id = ? AND role = ? AND spectating = ?", [room, role, 0], (err, rows) => {
      if (err) {
        console.log(err.message);
        reject(err);
      }
      const ret = []
      if (rows !== undefined) {
        rows.forEach(value => ret.push(value.role));
      }
      resolve(ret.length);
    });
    close(db);
  });
}
