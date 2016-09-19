import React from 'react';
import ReactDOM from 'react-dom';
var RestfulTable=require('react-restui/lib/client/rest_table');

var selectRowProp = {
          mode: "radio",
          clickToSelect: true,
          bgColor: "rgb(238, 193, 213)"
        };
        
ReactDOM.render(
   <RestfulTable url='/api/post' keyField="_id" 
    insertRow={true} deleteRow={true} selectRow={selectRowProp}>                
        <TableHeaderColumn dataField="title" >title</TableHeaderColumn>
        <TableHeaderColumn dataField="content" >content</TableHeaderColumn>
  </RestfulTable>,
  document.getElementById('root')
);

