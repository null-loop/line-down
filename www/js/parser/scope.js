define("scope",["require","exports","module"],function(t,n){var e=t("./collections.js");n.createScope=function(){return{_scopeStack:[],_currentBlock:null,_usedIds:[],_dataBlocks:[],_currentDataBlock:null,_currentGeneratedDataBlockIdIndex:0,inDataBlock:function(){return null!==this._currentDataBlock},startDataBlock:function(t){t.id||(t.id=this.generateNextDataBlockId()),this._dataBlocks.push(t),this._currentDataBlock=t},generateNextDataBlockId:function(){return this._currentGeneratedDataBlockIdIndex++,"data-block-"+this._currentGeneratedDataBlockIdIndex.toString()},finishDataBlock:function(){this._currentDataBlock=null},hasDataBlocks:function(){return this._dataBlocks.length>0},getDataBlocks:function(){return this._dataBlocks},hasCurrentBlock:function(){return null!==this._currentBlock},currentBlockElement:function(){return this.hasCurrentBlock()?this._currentBlock.element:null},pushBlock:function(t){this._scopeStack.push(t),this._currentBlock=t},popBlock:function(){var t=this._scopeStack.pop();return this._currentBlock=this._scopeStack.length>0?this._scopeStack[this._scopeStack.length-1]:null,t},hasElementScope:function(t){var n=!1;return e.each(this._scopeStack,function(e,c){c.element==t&&(n=!0)}),n},usedId:function(t){this._usedIds.push(t)},hasUsedId:function(t){return e.contains(this._usedIds,t)},isImplicitParagraphScope:function(){return null===this._currentBlock?!1:!("p"!=this._currentBlock.element||!this._currentBlock.implicit)}}}});