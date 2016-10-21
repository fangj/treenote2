require("babel-register");
require("babel-polyfill");

var path=require('path');
var express = require('express');
// var expressRestResource = require('express-rest-resource');
// var nedb = require('nedb');
var bodyParser = require('body-parser');

var app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));


app.use(express.static(path.join(__dirname, '..','common')));
app.use(express.static(path.join(__dirname, 'public')));


// var treeDb = new nedb({ filename: 'treeDb', autoload: true });
var tree=require('../../src/server/middleware/tree-leancloud.js');
// var config={nedb:treeDb};
app.use('/_api', tree());

app.listen("3000");