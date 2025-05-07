const sqlite3 = require('sqlite3'); 

const database = require('./db.js');

const conn = database.conn;
database.setup(conn);
database.fetchWins(conn, "def").then((wins) => {
  console.log(wins);
}).catch((err) => {
  console.log(err);
});
database.close(conn);