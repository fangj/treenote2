import React from 'react';
import ReactDOM from 'react-dom';
import TreeBrowser from 'treenote2/lib/client/ui/tree_browser';
var tree=require('treenote2/lib/client/tree.js')("_api");

        
ReactDOM.render(
   <div>
   <TreeBrowser tree={tree} root='0' gid='4CoTsMzWLq0UNf89'/>
   </div>,
  document.getElementById('root')
);

