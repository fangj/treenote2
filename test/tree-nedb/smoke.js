var assert = require("assert");
var nedb = require('nedb');
var treeDb = new nedb({ filename: 'tree.nedb', autoload: true });
// var tree=require('../../src/server/tree-nedb')(treeDb);
var tree;
var async = require('asyncawait/async');
var await = require('asyncawait/await');


describe('tree', function(){

  before(function(done){
    treeDb.remove({}, { multi: true }, function (err, numRemoved) {
      tree=require('../../src/server/tree-nedb')(treeDb,done);
    });
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
  //       console.log(son)
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
        var n= await(tree.update_data('0','hello'));
        console.log('n',n);
        done();
    })()
  });


});