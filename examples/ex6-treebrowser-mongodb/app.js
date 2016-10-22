require("babel-polyfill");

var path=require('path');
var express = require('express');
var expressRestResource = require('express-rest-resource');
var nedb = require('nedb');
var bodyParser = require('body-parser');

var app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));


app.use(express.static(path.join(__dirname, '..','common')));
app.use(express.static(path.join(__dirname, 'public')));

var tree=require('treenote2/lib/server/middleware/tree.js');

var assert = require("assert");
var MongoClient = require('mongodb').MongoClient;
var url = 'mongodb://localhost:10086/myproject';
MongoClient.connect(url, function(err, db) {
  assert.equal(null, err);
  console.log("Connected successfully to server");
  treeDb = db.collection('node');
  var config={mongodb:treeDb};
  app.use('/_api', tree(config));
});


app.listen("3000");