var assert = require("assert");

var tree=require('../../lib/client/tree-cache')("http://localhost:3000/_api");
var treetool=require('../../lib/client/tool')(tree);

var async = require('asyncawait/async');
var await = require('asyncawait/await');


describe('tree', function(){

    it('should read_nodes ', function(done){
      async(function(){
         var son= await(treetool.createNodeByPath('0/hello/world'));
        console.log(son)
        done();
    })()
  });

});