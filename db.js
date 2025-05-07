const sqlite3 = require('sqlite3'); 

const conn = new sqlite3.Database('mafia.db', (err) => {
  if (err) {
    console.error(err.message);
  }
});

function setup(db) {
  db.run('CREATE TABLE IF NOT EXISTS users(username TEXT, password TEXT, wins INTEGER)', (err) => {
    if (err) {
      console.error(err.message);
    }
  });
}

function addUser(db, user, pass) {
  db.run('INSERT INTO users(username, password, wins) VALUES(?, ?, ?)', [user, pass, 0], (err) => {
    if (err) {
      console.error(err.message);
    }
  });
}

function fetchWins(db, user) {
  return new Promise((resolve) => {
    db.get('SELECT wins FROM users WHERE username = ?', [user], (err, row) => {
      resolve(row["wins"]);
    });
  });
}

/*
async function getWins(db, user) {
  const result = await fetchWins(user);
  console.log(result);
  return result;
}
*/

function addWin(db, user) {
  var wins = getWins(user);
  db.run('UPDATE users SET wins = wins + 1 WHERE username = ?', [user], (err) => {
    if (err) {
      console.error(err.message);
    }
  });
}

function close(db) {
  db.close((err) => {
    if (err) {
      console.error(err.message);
    }
  });
}

/*
setup(conn);
//console.log(getWins("abc"));
close(conn);
*/

module.exports = {
  fetchWins: fetchWins,
  setup: setup,
  close: close,
  sqlite3: sqlite3,
  conn: conn
};