import React from 'react';
import Form from "react-jsonschema-form";
var tree=require('treenote2/src/client/tree-cache.js')("_api");


const schema = {

  type: "object",
  properties: {
    data: {type: "string", title: ":"}
  }
};

const uiSchema = {
    data: {
      "ui:widget": "textarea"
    }
}

const clearEdit=()=>{PubSub.publish("TreeBrowser",{edit:null})};
const txt_editor=(node)=><Form schema={schema} uiSchema={uiSchema} formData={node._data}
        onSubmit={({formData})=>{
        	// const data={data:formData,type:"tn/txt"}
        	formData.type="tn/txt";
        	tree.update(node._id,formData)
        	.then(clearEdit);
      }}
><div className="btn-toolbar">
	<div className="btn-group btn-group-sm">
		<button type="button" className="btn btn-success btn-xs"  type="submit">保存</button>
		<button type="button" className="btn btn-default btn-xs" onClick={clearEdit}>取消</button>
	</div>
</div>
</Form>
module.exports=txt_editor;