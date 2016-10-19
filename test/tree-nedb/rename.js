var assert = require("assert");
var nedb = require('nedb');
var treeDb = new nedb({ filename: 'tree.nedb', autoload: true });

var tree;
var async = require('asyncawait/async');
var await = require('asyncawait/await');


describe('tree', function(){

  before(function(done){
    treeDb.remove({}, { multi: true }, function (err, numRemoved) {
      tree=require('../../src/server/tree-nedb')(treeDb,done);
    });
  })

    it('should read_nodes ', function(done){
      async(function(){
         var son= await(tree.mk_son_by_name('0','hello'));
         var son2= await(tree.mk_son_by_name('0','hello'));
         var son3= await(tree.mk_son_by_name('0','world'));
         assert.equal(son._id,son2._id);
        console.log(son,son2,son3)
        done();
    })()
  });

});