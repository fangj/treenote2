var express = require('express');
var router = express.Router();
var fs = require('bluebird').promisifyAll(require('fs-extra'));
var path=require('path');
var _=require('lodash');
var logger = require('log4js').getLogger('server');
logger.setLevel('DEBUG'); //程序完成后注释掉。可以切换回默认等级，减少log

function factory(config) {
  var tree;
  if(config.mongodb){
    tree = require('../tree-mongodb')(config.mongodb);
  }else if(config.nedb){
    tree = require('../tree-nedb')(config.nedb);
  }else if(config.leancloud){
    tree = require('../tree-leancloud')(config.leancloud);
  }

  router.post('/nodes', 
    function(req, res, next) {
    tree.read_nodes(req.body).then(nodes => {
      res.json(nodes);
    }).catch(e => {
      logger.error(e);
      res.status(500).end();
    });
  });


  router.post('/mk/son/:gid', 
    function(req, res, next) {
    logger.debug(req.body);

    tree.mk_son_by_data(req.params.gid, req.body).then(node => {
      // logger.debug(node);
      res.json(node);
    }).catch(e => {
      logger.error(e);
      res.status(500).end();
    });
  });

  router.post('/mk/son_name/:gid', 
    function(req, res, next) {
    logger.debug(req.body);

    tree.mk_son_by_name(req.params.gid, req.body.name).then(node => {
      // logger.debug(node);
      res.json(node);
    }).catch(e => {
      logger.error(e);
      res.status(500).end();
    });
  });


  router.post('/mk/brother/:bgid', 
    function(req, res, next) {
    // res.send('mk brother of'+req.params.bgid);
    tree.mk_brother_by_data(req.body,req.params.bgid).then((node) => {
      // logger.debug(node);
      res.json(node);
    }).catch(e => {
      logger.error(e);
      res.status(500).end();
    });
  });


  router.post('/mv/:sgid/son/:dgid', 
    function(req, res, next) {
    var p = req.params;
    // logger.debug(`mv ${p.sgid} as son of ${p.dgid}`);
    tree.move_as_son(p.sgid,p.dgid).then(node => {
      // logger.debug(node);
      res.json(node);
    }).catch(e => {
      logger.error(e);
      res.status(500).end();
    });
  });

  router.post('/mv/:sgid/brother/:dgid', 
    function(req, res, next) {
    var p = req.params;
    // logger.debug(`mv ${p.sgid} as brother of ${p.dgid}`);
    tree.move_as_brother(p.sgid,p.dgid).then(node => {
      // logger.debug(node);
      res.json(node);
    }).catch(e => {
      logger.error(e);
      res.status(500).end();
    });
  });


  function clone(obj){
      return JSON.parse(JSON.stringify(obj));
  }
  
  function expand(node,level){ //level用于控制展开的层级
    if(node._link.children.length==0 || level<=0 ){ //不做展开的2种情况。1.没有子节点。2，展开层级小于0
        var cloneNode=clone(node);
        cloneNode._children=[];
        return Promise.resolve(cloneNode);
    }else{
        return tree.read_nodes(node._link.children)
        .then(nodes=>{
          logger.debug('children:',node._link.children,'nodes',nodes)
            const fnodes=nodes.map(node=>expand(node,level-1));
            return Promise.all(fnodes).then(nodes=>{
                var cloneNode=clone(node);
                cloneNode._children=nodes||[]; //展开的节点放到_children中
                return cloneNode;
            })
        })
    }
  }

  function read_bignode(gid,level) {
    return tree.read_node(gid).then(
      node=>expand(node,level)
    ); 
  }

  /* GET api . */
  router.get('/:gid',
    function(req, res, next) {
    tree.read_node(req.params.gid).then(node=> {    
      return res.json(node);
    }).catch(e => {
      logger.error(e);
      res.status(500).end();
    });
  });

    /* GET expanded node  . */
  router.get('/bignode/:gid/:level',
    function(req, res, next) {
      read_bignode(req.params.gid,req.params.level).then(node=> {    
        return res.json(node);
      }).catch(e => {
        logger.error(e);
        res.status(500).end();
      });
  });

  router.put('/:gid', 
    function(req, res, next) {
    tree.update_data(req.params.gid, req.body).then((node) => {
      // logger.debug(node);
      res.json(node);
      save2elasticsearch(node);
    }).catch(e => {
      logger.error(e);
      res.status(500).end();
    });
  });

  router.delete('/:gid', 
    function(req, res, next) {
    tree.remove(req.params.gid).then(() => {
      res.json([req.params.gid]);
    }).catch(e => {
      logger.error(e);
      res.status(500).end();
    });
  });

  return router;
}

module.exports = factory;