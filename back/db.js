const sqlite3 = require('sqlite3');

function connect() {
  const db = new sqlite3.Database("./database");
  db.run("CREATE TABLE IF NOT EXISTS rooms(user_id TEXT, room_id TEXT, role TEXT)");
  return db
}

function close(db) {
  db.close();
}

function pick_role(in_room) { // returns a random untaken role
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
}

async function get_in_room(db, room) { // returns an array of roles in a given room
  return new Promise((resolve, reject) => {
    db.all("SELECT role FROM rooms WHERE room_id = ?", [room], (err, rows) => {
      if (err) {
        console.log(err.message);
      }
      resolve(rows);
    });
  });
}

// example of calling get_in_room:
// const in_room = await get_in_room(connect(), room);
