/*
 Copyright (C) 2015 Daniel Gray, Grayholme Ltd

 This program is free software; you can redistribute it and/or
 modify it under the terms of the GNU General Public License
 as published by the Free Software Foundation; either version 2
 of the License, or (at your option) any later version.

 This program is distributed in the hope that it will be useful,
 but WITHOUT ANY WARRANTY; without even the implied warranty of
 MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 GNU General Public License for more details.

 You should have received a copy of the GNU General Public License
 along with this program; if not, write to the Free Software
 Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston, MA  02110-1301, USA.
 */

var col = require('./collections.js');

exports.createScope = function () {
    return {
        _scopeStack: [],
        _currentBlock: null,
        _usedIds: [],
        _dataBlocks:[],
        _currentDataBlock:null,
        _currentGeneratedDataBlockIdIndex:0,
        inDataBlock:function(){
            return this._currentDataBlock != null;
        },
        startDataBlock:function(dataBlock){

            if (!dataBlock.id)
            {
                dataBlock.id = this.generateNextDataBlockId();
            }

            this._dataBlocks.push(dataBlock);
            this._currentDataBlock = dataBlock;
        },
        generateNextDataBlockId:function(){
            this._currentGeneratedDataBlockIdIndex++;
            return 'data-block-' + this._currentGeneratedDataBlockIdIndex.toString();
        },
        finishDataBlock:function(){
            this._currentDataBlock = null;
        },
        hasDataBlocks:function(){
            return this._dataBlocks.length > 0;
        },
        getDataBlocks:function(){
            return this._dataBlocks;
        },
        hasCurrentBlock: function () {
            return this._currentBlock != null;
        },
        currentBlockElement: function () {
            if (!this.hasCurrentBlock()) return null;
            return this._currentBlock.element;
        },
        pushBlock: function (block) {
            this._scopeStack.push(block);
            this._currentBlock = block;
        },
        popBlock: function () {
            var current = this._scopeStack.pop();
            if (this._scopeStack.length > 0) {
                this._currentBlock = this._scopeStack[this._scopeStack.length - 1];
            }
            else {
                this._currentBlock = null;
            }
            return current;
        },
        hasElementScope: function (element) {
            var has = false;
            col.each(this._scopeStack, function (i, v) {
                if (v.element == element) has = true;
            });
            return has;
        },
        usedId: function (id) {
            this._usedIds.push(id);
        },
        hasUsedId: function (id) {
            return col.contains(this._usedIds, id);
        },
        isImplicitParagraphScope:function(){
            if (this._currentBlock==null) return false;
            return !!(this._currentBlock.element == 'p' && this._currentBlock.implicit);
        }
    };
};
