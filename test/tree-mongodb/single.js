// require("babel-register");
require("babel-polyfill");
var assert = require("assert");

var MongoClient = require('mongodb').MongoClient;
var ObjectId = require('mongodb').ObjectId;

// Connection URL
var url = 'mongodb://localhost:10086/myproject';

// Use connect method to connect to the server


var tree,db,treeDb;
var async = require('asyncawait/async');
var await = require('asyncawait/await');

describe('tree', function(){

  before(function(done){
    MongoClient.connect(url, function(err, _db) {
      assert.equal(null, err);
      console.log("Connected successfully to server");
      db=_db;
      treeDb = db.collection('node');
      tree=require('../../lib/server/tree-mongodb')(treeDb,done);

    });
  })
  after(function(){
    console.log("clean up");
    db.close();
  })

  // it('should remove ',function(done){
  //   async(function(){
  //     var node=await(tree.remove("580b00fef89a6b543f29854a")); //rm标记表示节点已经被删除
  //     console.log('remove',node);
  //     done();
  //   })() 
  // })
  // 
    it('should mk_son_by_name ', function(done){
      async(function(){
        var son= await(tree.mk_son_by_name('0','helloax'));
        assert.equal(typeof son,'object');
        console.log(son)
        var son2= await(tree.mk_son_by_name('0','helloax'));
        assert.equal(typeof son2,'object');
        console.log(son2)
        done();
    })()
  });

});