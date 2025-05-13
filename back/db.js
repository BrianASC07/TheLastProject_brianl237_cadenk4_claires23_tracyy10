import sqlite3 from 'sqlite3';

async function connect() {
  const db = async() => {
    return await new sqlite3.Database("./database");
  };
  const s = await db();
  console.log(s);
  // await db.run("CREATE TABLE IF NOT EXISTS rooms(user_id TEXT, room_id TEXT, role TEXT)");
  const c = async() => {
    return await db.all("SELECT role FROM room");
  };
  console.log(`${c} keojdeiadeeee`);
  return db
}

async function close(db) {
  await db.close();
}

export function pick_role(in_room) { // returns a random untaken role
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

// https://stackoverflow.com/questions/65454450/how-to-assign-a-variable-to-the-output-of-a-sqlite-query-in-node-js
export async function get_roles_in_room(room) { // returns an array of roles in a given room
  const db = connect();
  return new Promise((resolve, reject) => {
    db.all("SELECT role FROM rooms WHERE room_id = ?", [room], (err, rows) => {
      if (err) {
        console.log(err.message);
        reject(err);
      }
      resolve(rows);
    });
    close(db);
  });
}
// example of calling get_roles_in_room:
// const in_room = await get_roles_in_room(connect(), room);

export async function add_to_room(user_id, room_id, role) { // basically, Promise takes in a functin and waits for the function to finish
  const db = connect();
  return new Promise((resolve, reject) => {
    db.run("INSERT INTO rooms (user_id, room_id, role) VALUES (?, ?, ?)", [user_id, room_id, role], (err) => {
      if (err) {
        console.log(err.message);
        reject(err);
      }
      resolve(console.log(`Inserted ${user_id} into room ${room_id} as ${role}`));
    });
    close(db);
  });
}