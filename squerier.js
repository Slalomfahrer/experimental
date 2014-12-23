// https://github.com/nodeca/js-yaml
// npm install js-yaml

// https://github.com/felixge/node-mysql
// npm install felixge/node-mysql

// io9 mysql
// mysql-ctl start|stop|cli
// Root User: slalomfahrer
// Database Name: c9
// database: squerier
// table: test
// columns: id INT, sometext VARCHAR(256)
// two rows inserted

// check_mk
// http://mathias-kettner.de/checkmk_localchecks.html
// file: /etc/check_mk/spool
// Status, Itemname, Performance data, Check output
// Performance data: You may output zero, one or more performance variables 
// here with the standard Nagios convention. That is 
// varname=value;warn;crit;min;max, while the values ;warn;crit;min;max are 
// optional values. If you like to provide only the min and max values, you 
// can provide a definition like varname=value;warn;crit. If you have no 
// performance data simply write a dash (-) instead. From version 1.1.5 on, 
// it is possible to output more then one variable. Separate your variables 
// with a pipe symbol (|). Do not used spaces.
// <<<local>>>
// 0 Service_FOO V=1 This Check is OK
// 1 Bar_Service - This is WARNING and has no performance data
// 2 NotGood V=120;50;100;0;1000 A critical check

// $ npm init
// This utility will walk you through creating a package.json file.
// It only covers the most common items, and tries to guess sane defaults.
// 
// See `npm help json` for definitive documentation on these fields
// and exactly what they do.
//
// Use `npm install <pkg> --save` afterwards to install a package and
// save it as a dependency in the package.json file.

// Install examples: sudo npm run-script setup-example-config
// Cleanup: sudo rm -rf /etc/squerier/

// TODO (Nice-to-have): make multiple databases possible
// TODO (Normal); Prefix the local spool file with a configured time

var fs = require('fs');
var util = require('util');
var yaml = require('js-yaml');
var mysql = require('mysql');

// this is the output file that is sent to check_mk
var spoolfileName = "testspoolfile";

fs.writeFileSync(spoolfileName, "<<<local>>>\n");

function toMySQLDateFormat(d) {
        var result = d.getFullYear() + "-";
        if (d.getMonth() + 1 < 10) result += "0";
        result += d.getMonth() + 1 + "-";
        if (d.getDate() < 10) result += "0";
        result += d.getDate();
        return result;
}

function addLineToSpoolfile(status, itemname, performanceData, checkOutput) {
  var spoolfileLine = (status + ' ' + itemname + ' ' + performanceData + ' ' + checkOutput + '\n');
  fs.appendFile(spoolfileName, spoolfileLine, function (err) {
    if (err) throw err;
  });
}

// provide itemname to testQuery function
function testQueryFor(itemname) {
  return function(err, rows, fields) {
    testQuery(err, rows, fields, itemname);
  };
}

function testQuery(err, rows, fields, itemname) {
  if (err) throw err;
  // util.debug('rows: ' + util.inspect(rows));
  // util.debug('fields: ' + util.inspect(fields));
  // rows: [ { id: 1, sometext: 'bla' }, { id: 2, sometext: 'blubb' } ]

  
  // test for exactly 1 row
  if (rows.length != 1) {
    addLineToSpoolfile(3, itemname, '', 'Resultset has ' + rows.length + ' rows , MUST have exactly 1 row');
    return;
  }


  // prepare performance data
  var performanceData = '';
  for (var i = 0; i < fields.length; i++) {
    util.debug(fields[i].table + '.' + fields[i].name + '=' + rows[0][fields[i].name]);
    //values[fields[i]] = rows[0][fields[i]];
    // TODO: remove spaces
    performanceData += fields[i].table + '.' + fields[i].name + '=' + rows[0][fields[i].name] + '|';
  }
  

  // loop through Critical conditions
  for (var k = 0; k < YAMLPartParsed['Critical'].length; k++) {
    
    // try Critical conditions
    
    // parse condition
    var condition = YAMLPartParsed['Critical'][k].split(' ');
    var columnNameToTest = condition[0];
    var operatorToTest = condition[1];
    var operandToTest = condition[2];
    
    // TEST: malformed condition

    // TODO: if operandToTest is LASTVALUE, replace accordingly

    // get column value from database
    var actualValueFromRows = rows[0][columnNameToTest];
    
    // test condition
    if (operatorToTest == '<') {
      util.debug(actualValueFromRows + ' < ' + operandToTest + ' -> ' + (actualValueFromRows < operandToTest));
      if (actualValueFromRows < operandToTest) {
        // TODO (Business Critical): No spaces allowed in performanceData, so clean up actualValueFromFrowRows
        addLineToSpoolfile(2, 'TODO:continueHereAndConfigureNameInConfigFileAndKeepMultipleRowsInMind', performanceData, columnNameToTest + '=' + actualValueFromRows);
      }
    } else if (operatorToTest == '>') {
      util.debug(actualValueFromRows + ' > ' + operandToTest + ' -> ' + (actualValueFromRows > operandToTest));
    } else if (operatorToTest == '=') {
      util.debug(actualValueFromRows + ' = ' + operandToTest + ' -> ' + (actualValueFromRows == operandToTest));
    }
    
    // TEST: type conversions
    
  }
}

// Read config file
var configFile = fs.readFileSync('/etc/squerier/squerier.conf');
var configYAML = yaml.safeLoad(configFile);

// connect to database
var connection = mysql.createConnection({
  host     : configYAML.host,
  user     : configYAML.user,
  password : configYAML.password,
  port     : configYAML.port,
  database : configYAML.database
});

// Find all query files
var queryFilesArray = fs.readdirSync('/etc/squerier/queries/');

util.debug('Number of files found: ' + queryFilesArray.length);

// sort query files
queryFilesArray.sort();

// loop through query files
for (var i = 0; i < queryFilesArray.length; i++) {
  
  // convert filename into checkname (strip ordering and extension)
  var filename = queryFilesArray[i];
  var prefixEnd = (filename.indexOf('_') == -1) ? 0 : filename.indexOf('_') + 1;
  var extensionStart = (filename.lastIndexOf('.') == -1) ? filename.length : filename.lastIndexOf('.');
  var cleanedFilename = filename.slice(prefixEnd, extensionStart);

  // TEST: These filenames should work: 001_Test.sql, 001_Test, Test.sql, Test
  
  // read query file
  var queryFile = fs.readFileSync('/etc/squerier/queries/' + filename).toString();
  
  // extract configuration part (between --- and ---)
  var YAMLstart = queryFile.indexOf('---\n');
  var YAMLend = queryFile.lastIndexOf('---\n');
  var YAMLPart = queryFile.slice(YAMLstart, YAMLend);

  // TEST: start and/or end not found

  // load config part as YAML
  var YAMLPartParsed = yaml.safeLoad(YAMLPart);

  // util.debug(util.inspect(YAMLPartParsed));
  // util.debug(YAMLPartParsed['Critical'][0]);
  for (var p in YAMLPartParsed) {
    // util.debug(p + '+' + typeof p);
  }
  
  // execute SQL stmt
  connection.query(queryFile, testQueryFor(cleanedFilename));
  
}


connection.end();
