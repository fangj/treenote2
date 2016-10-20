var assert = require("assert");
var nedb = require('nedb');
var treeDb = new nedb({ filename: 'tree.nedb', autoload: true });
// var tree=require('../../src/server/tree-nedb')(treeDb);
var tree;
var async = require('asyncawait/async');
var await = require('asyncawait/await');

require("babel-register");
require("babel-polyfill");


describe('tree', function(){

  before(function(done){
    tree=require('../../src/server/tree-leancloud')(done);
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

  //   it('should mk_son_by_data ', function(done){
  //     async(function(){
  //       var son= await(tree.mk_son_by_data('0','hello'));
  //       assert.equal(typeof son,'object');
  //       console.log(son)
  //       done();
  //   })()
  // });

  it('should mk_brother_by_data ', function(done){
      async(function(){
        var son= await(tree.mk_son_by_data('0','hello'));
        assert.equal(typeof son,'object');
        console.log('son',son)
        var bro= await(tree.mk_brother_by_data(son._id,'world'));
        assert.equal(typeof bro,'object');
        console.log('youngerbro',bro)
        var pNode= await(tree.read_node(son._link.p));
        assert.equal(typeof pNode,'object');
        console.log('pNode',pNode)
        var firstBro= await(tree.mk_son_by_data(son._link.p,'excel'));
        assert.equal(typeof firstBro,'object');
        console.log('firstBro',firstBro)
        done();
    })()
  });

  // it('should update_data ', function(done){
  //     async(function(){
  //       var n= await(tree.update_data('0','hello'));
  //       console.log('n',n);
  //       done();
  //   })()
  // });


  // it('should remove ', function(done){
  //     async(function(){
  //       var son= await(tree.mk_son_by_data('0','hello'));
  //       var gson= await(tree.mk_son_by_data(son._id,'world'));
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

});