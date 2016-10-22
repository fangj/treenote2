// require("babel-register");
require("babel-polyfill");

var assert = require("assert");
var MongoClient = require('mongodb').MongoClient;

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
      treeDb.remove({}, { multi: true }, function (err, numRemoved) {
        tree=require('../../lib/server/tree-mongodb')(treeDb,done);
      });
    });
  })
  after(function(){
    console.log("clean up");
    db.close();
  })

  it('should read root',function(done){
    async(function(){
      var node=await(treeDb.findOne({_id:'0'})); //rm标记表示节点已经被删除
      console.log('root',node);
      done();
    })() 
  })

  // it('should buildRootIfNotExist ', function(done){
  //     async(function(){
  //       var root= await(tree.buildRootIfNotExist());
  //       assert.equal(typeof root,'object');
  //       assert.equal(root._id,'0');
  //       console.log(root)
  //       done();
  //   })()
  // })

  // it('should mk_son_by_data ', function(done){
  //     async(function(){
  //       var son= await(tree.mk_son_by_data('0','hello'));
  //       assert.equal(typeof son,'object');
  //       console.log('son',son)
  //       done();
  //   })()
  // });
  // 
  //   it('should mk_son_by_name ', function(done){
  //     async(function(){
  //       var son= await(tree.mk_son_by_name('0','hello'));
  //       assert.equal(typeof son,'object');
  //       console.log(son)
  //       var son2= await(tree.mk_son_by_name('0','hello'));
  //       assert.equal(typeof son2,'object');
  //       console.log(son2)
  //       done();
  //   })()
  // });

  // it('should mk_brother_by_data ', function(done){
  //     async(function(){
  //       var son= await(tree.mk_son_by_data('0','hello'));
  //       assert.equal(typeof son,'object');
  //       console.log('son',son)
  //       var bro= await(tree.mk_brother_by_data(son._id,'world'));
  //       assert.equal(typeof bro,'object');
  //       console.log('youngerbro',bro)
  //       var pNode= await(tree.read_node(son._link.p));
  //       assert.equal(typeof pNode,'object');
  //       console.log('pNode',pNode)
  //       var firstBro= await(tree.mk_son_by_data(son._link.p,'excel'));
  //       assert.equal(typeof firstBro,'object');
  //       console.log('firstBro',firstBro)
  //       done();
  //   })()
  // });

  it('should update_data ', function(done){
      async(function(){
        var n= await(tree.update_data('0','xxx'));
        console.log('n',n);
        done();
    })()
  });


  // it('should remove ', function(done){
  //     async(function(){
  //       var son= await(tree.mk_son_by_data('0','hello'));
  //       var gson= await(tree.mk_son_by_data(son._id,'world'));
  //       console.log("mk 2 nodes for delete",son,gson);
  //       var removed_gids=await(tree.remove(son._id));
  //       console.log(removed_gids)
  //       assert.deepEqual(removed_gids.sort(),[son._id,gson._id].sort())
  //       done();
  //   })()
  // });

  //   it('should move as son ', function(done){
  //     async(function(){
  //       var son= await(tree.mk_son_by_data('0','hello'));
  //       var gson1= await(tree.mk_son_by_data(son._id,'world'));
  //       var gson2= await(tree.mk_son_by_data(son._id,'book'));
  //       son=await(tree.read_node(son._id)); 
  //       console.log('son,gson1,gson2',son,gson1,gson2)
  //       await(tree.move_as_son(gson1._id,gson2._id));
  //       son=await(tree.read_node(son._id)); 
  //       gson1=await(tree.read_node(gson1._id)); 
  //       gson2=await(tree.read_node(gson2._id)); 
  //       console.log('son,gson1,gson2',son,gson1,gson2)
  //       done();
  //   })()
  // });
  
  //   it('should read_nodes ', function(done){
  //     async(function(){
  //       var n= await(tree.read_node('0'));
  //       var nodes=await(tree.read_nodes(n._link.children));
  //       console.log(nodes)
  //       done();
  //   })()
  // });

});