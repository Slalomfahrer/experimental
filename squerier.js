// https://github.com/nodeca/js-yaml
// npm install js-yaml

var fs = require('fs');
var util = require('util');
var yaml = require('js-yaml');

var configFile = fs.readFileSync('/etc/squerier/squerier.conf');

var queryFilesArray = fs.readdirSync('/etc/squerier/queries/');

util.debug('Number of files found: ' + queryFilesArray.length);

queryFilesArray.sort();

for (var i =0; i < queryFilesArray.length; i++) {
  var filename = queryFilesArray[i]
  var prefixEnd = (filename.indexOf('_') == -1) ? 0 : filename.indexOf('_') + 1;
  var extensionStart = (filename.lastIndexOf('.') == -1) ? filename.length : filename.lastIndexOf('.');
  var cleanedFilename = filename.slice(prefixEnd, extensionStart);
  util.debug('Filename: ' + filename + ': ' + cleanedFilename);
  
  var queryFile = fs.readFileSync('/etc/squerier/queries/' + filename).toString();
  
  //util.debug('File content: \n' +queryFile);
  
  // TODO: What if the part is not found
  var YAMLstart = queryFile.indexOf('---');
  var YAMLend = queryFile.lastIndexOf('---');
  var YAMLPart = queryFile.slice(YAMLstart, YAMLend);
  // util.debug(YAMLPart);
  var YAMLPartParsed = yaml.safeLoad(YAMLPart);
  
  for (var p in YAMLPartParsed) {
    util.debug(p);
  }
}