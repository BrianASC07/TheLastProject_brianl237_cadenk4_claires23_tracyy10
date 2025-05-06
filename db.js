const sqlite3 = require('sqlite3'); 

const db = new sqlite3.Database('mafia.db', (err) => {
  if (err) {
    console.error(err.message);
  }
});

function setup() {
  db.run('CREATE TABLE IF NOT EXISTS users(username TEXT, password TEXT, wins INTEGER)', (err) => {
    if (err) {
      console.error(err.message);
    }
  });
}

function addUser(user, pass) {
  db.run('INSERT INTO users(username, password, wins) VALUES(?, ?, ?)', [user, pass, 0], (err) => {
    if (err) {
      console.error(err.message);
    }
  });
}

function fetchWins(user) {
  return new Promise((resolve) => {
    db.get('SELECT wins FROM users WHERE username = ?', [user], (err, row) => {
      resolve(row["wins"]);
    });
  });
}

async function getWins(user) {
  const result = await fetchWins(user);
  console.log(result.value);
  return result.value;
}

function addWin(user) {
  var wins = getWins(user);
  db.run('UPDATE users SET wins = wins + 1 WHERE username = ?', [user], (err) => {
    if (err) {
      console.error(err.message);
    }
  });
}

let mafia = function(user) {
  return new Promise((resolve) => {
    db.get('SELECT wins FROM users WHERE username = ?', [user], (err, row) => {
      resolve(row["wins"]);
    });
  });
}

var bye;
let winCount = mafia("abc");
winCount.then(function(result) {
  bye = result;
});
console.log(bye);
console.log(winCount);

function close() {
  db.close((err) => {
    if (err) {
      console.error(err.message);
    }
  });
}

setup();

close();