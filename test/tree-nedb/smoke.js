var assert = require("assert");
var tree=require('../../src/server/tree-nedb');

describe('tree', function(){

  it('should be function', function(){
      assert.equal('function',typeof tree);
  })

});