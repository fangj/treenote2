var assert = require("assert");
var nedb = require('nedb');
var treeDb = new nedb({ filename: 'tree.nedb', autoload: true });
var tree=require('../../src/server/tree-nedb')(treeDb);
var async = require('asyncawait/async');
var await = require('asyncawait/await');

describe('tree', function(){

  before(function(done){
    treeDb.remove({}, { multi: true }, function (err, numRemoved) {
      done();
    });
  })

  it('should buildRootIfNotExist ', function(done){
      async(function(){
        var root= await(tree.buildRootIfNotExist());
        assert.equal(typeof root,'object');
        console.log(root)
        done();
    })()
  })

});