// const sqlite3 = require('sqlite3');
import sqlite3 from 'sqlite3';

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
    db.run("CREATE TABLE IF NOT EXISTS rooms(user_id TEXT, room_id TEXT, role TEXT)", (err) => {
      if (err) {
        console.log(err.message);
        reject(err);
      }
      resolve(console.log('Table[s] added.'));
    });
    close(db);
  });
}

function pick_role(in_room) { // returns a random untaken role
  const chance = 1/(5-in_room.length)
  if (structuredClone(in_room).reduce((count, current) => { // if max innocent, then only consider missing roles
    if (current == "innocent") count++;
    return count;
  }) == 2) {
    const only_consider=[];
    if (!in_room.includes("mafia")) only_consider.push("mafia");
    if (!in_room.includes("cop")) only_consider.push("cop");
    if (!in_room.includes("doctor")) only_consider.push("doctor");
    return only_consider[Math.floor(Math.random() * only_consider.length)]
  }
  else if (!in_room.includes("mafia")) {
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

function add_to_room(user_id, room_id, role) {
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


const temp_room = "123";
const temp_user_id = "aurum";
await createTable();
console.log(await get_roles_in_room(temp_room));
await add_to_room(temp_user_id, temp_room, pick_role(await get_roles_in_room(temp_room)));
console.log(await get_roles_in_room(temp_room));
await add_to_room("a", temp_room, pick_role(await get_roles_in_room(temp_room)));
console.log(await get_roles_in_room(temp_room));
await add_to_room("b", temp_room, pick_role(await get_roles_in_room(temp_room)));
console.log(await get_roles_in_room(temp_room));
await add_to_room("c", temp_room, pick_role(await get_roles_in_room(temp_room)));
console.log(await get_roles_in_room(temp_room));
await add_to_room("d", temp_room, pick_role(await get_roles_in_room(temp_room)));
console.log(await get_roles_in_room(temp_room));
await remove_from_room(temp_user_id);