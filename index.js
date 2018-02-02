#!/usr/bin/env node
const express = require('express');
const path = require('path');
var program = require('commander');
var moment = require('moment');
var chalk = require('chalk');
var open = require('open');

program
    .version('1.0.0')
    .option('-p --port <port>', 'Provide server port number, default is 4000')
    .option('-d, --dist <dist>', 'Provide relative path to distribution folder, default is current')
    .option('-i --index <index>', 'Provide relative path to default index html with in dist')
    .parse(process.argv);

const app = express();
const PORT = program.port || 4000;
let DIST_FOLDER = process.cwd();

if(program.dist) {
    DIST_FOLDER = path.join(DIST_FOLDER, program.dist);
}

console.log('Serving from: ' + DIST_FOLDER);

var logger = function (req, res, next) {
    var end = res.end;
    res.end = function(chunk, encoding){
        console.log(moment().format('MM/DD/YYYY:hh:mm:ss'), chalk.blue(req.originalUrl), req.method, chalk.green(res.statusCode));
        res.end = end;
        res.end(chunk, encoding);
    }
    next()
  }
  
app.use(logger);


// Server static files from /browser
app.get(
    '*.*',
    express.static(DIST_FOLDER, {
      maxAge: '1y'
    })
);

// ALl regular routes use the Universal engine
let indexHtml = 'index.html';
if(program.index) {
    indexHtml = program.index;
}
app.get('*', (req, res) => {
    res.sendFile(path.join(DIST_FOLDER, indexHtml));
});

// Start up the Node server
app.listen(PORT, () => {
  console.log(`SPA test server listening on http://localhost:${PORT}`);
  open(`http://localhost:${PORT}`);
});