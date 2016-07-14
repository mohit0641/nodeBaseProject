var mysql = require('mysql');
var client = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'root' ,
  database: 'usersActivity'
});
module.exports=client;

