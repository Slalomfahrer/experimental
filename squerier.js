// https://github.com/nodeca/js-yaml
// npm install js-yaml

// io9 mysql
// mysql-ctl start|stop|cli
// Root User: slalomfahrer
// Database Name: c9
// database: squerier
// table: test
// columns: id INT, sometext VARCHAR(256)
// two rows inserted

// TODO (Nice-to-have): make multiple databases possible

var fs = require('fs');
var util = require('util');
var yaml = require('js-yaml');

// Read config file
var configFile = fs.readFileSync('/etc/squerier/squerier.conf');

// Find all query files
var queryFilesArray = fs.readdirSync('/etc/squerier/queries/');

util.debug('Number of files found: ' + queryFilesArray.length);

// sort query files
queryFilesArray.sort();

// loop through query files
for (var i =0; i < queryFilesArray.length; i++) {
  
  // convert filename into checkname (strip ordering and extension)
  var filename = queryFilesArray[i]
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

  util.debug(util.inspect(YAMLPartParsed));
  util.debug(YAMLPartParsed['Critical'][0]);
  for (var p in YAMLPartParsed) {
    // util.debug(p + '+' + typeof p);
  }
}