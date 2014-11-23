function toMySQLDateFormat(d) {
        var result = d.getFullYear() + "-";
        if (d.getMonth() + 1 < 10) result += "0"
        result += d.getMonth() + 1 + "-";
        if (d.getDate() < 10) result += "0"
        result += d.getDate();
        return result;
}

var mysql      = require('mysql');
var connection = mysql.createConnection({
  host     : 'localhost',
  user     : 'readonly',
  password : '',
  port     : 3307,
  database : ''
});

connection.connect();
connection.query(sql, displayResult);
connection.end();

var displayResult = function(err, rows, fields) {
  if (err) throw err;
  console.log(rows.length);
}