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
var inl = require('./inline.js');

exports.createBuilder = function(options, scope){
    return {
        _outputLines: [],
        _generateIdsFor:['h','li','p','blockquote'],
        currentLine: '',
        options: options,
        scope: scope,

        generateId:function(block){
            var allowed = false;
            if (block.element ==='h' || block.element === 'p' || block.element === 'li') {
                allowed = true;
            }
            if (allowed){
                var r = block.remainingLine;
                var maxLength = 100;
                if (r.length > maxLength)
                {
                    r = r.substring(0,maxLength);
                }
                var possibleId = this.formatDataKey(r);
                var base = possibleId;
                var s=0;
                while (this.scope.hasUsedId(possibleId)){
                    s++;
                    possibleId = base + "-" + s.toString();
                }
                if (possibleId.substring(0,1)==='-'){
                    possibleId = possibleId.substring(1,possibleId.length - 1);
                }
                if (possibleId.substring(possibleId.length - 1)==='-'){
                    possibleId = possibleId.substring(0,possibleId.length - 1);
                }
                return possibleId;
            }
            return undefined;
            //TODO:this for one thing... also - need to work with the scope to get the real content when working with opening block specs on their own line
        },
        applyOptions:function(block){
            if (options && options.generateIds && (!block.id || this.scope.hasUsedId(block.id))){
                block.id = this.generateId(block);
            }
        },

        beginLine: function () {
            if (this.currentLine !== '') {
                this._outputLines.push(this.currentLine);
            }
            this.currentLine = '';
        },
        complete: function () {
            if (this.currentLine !== '') {
                this._outputLines.push(this.currentLine);
            }
        },

        formatDataKey:function(key){
            //TODO:This is so naive... - http://stackoverflow.com/questions/9862761/how-to-check-if-character-is-a-letter-in-javascript
            function isLetter(str) {
                return str.length === 1 && str.match(/[a-z]/i);
            }
            var k = '';
            var kc = key.split('');
            var wasLower = false;
            col.each(kc,function(i,v){
                if (isLetter(v)){
                    var uv = v.toLocaleUpperCase();
                    if (uv === v) {
                        if (wasLower) {
                            v = '-' + v;
                            wasLower = false;
                        }
                    }
                    else {
                        wasLower = true;
                    }
                }
                else
                {
                    v='-';
                }
                k = k + v.toLocaleLowerCase();
            });
            while (k.indexOf('--') > -1){
                k = k.replace('--','-');
            }
            return k;
        },
        tagWithEnd: function (tag, id, classes, data,extraAttributes, end) {
            //TODO:Check against white lists!
            var t = '<' + tag;
            if (id) {
                if (!this.scope.hasUsedId(id)) {
                    t = t + ' id=\'' + id + '\'';
                    this.scope.usedId(id);
                }
            }
            if (classes) {
                classes = classes.split('&');
                // remove invalid classes
                classes = classes.join(' ');
                t = t + ' class=\'' + classes + '\'';
            }

            if (data) {
                var self = this;
                col.each(data,function(k,v){
                    t = t + ' data-' + self.formatDataKey(v.key) + '=\'' + v.value + '\'';
                });
            }

            if (extraAttributes)
            {
                t = t + ' ' + extraAttributes;
            }

            t = t + end;
            this.append(t);
        },

        //TODO:data specs... find calls - pass in from matches
        openTag: function (tag, id, classes, data, extraAttributes) {
            this.tagWithEnd(tag,id,classes,data,extraAttributes, '>');
        },
        selfClosingTag:function(tag,id,classes,data){
            this.tagWithEnd(tag,id,classes,data,undefined, '/>');
        },
        append: function (text) {
            this.currentLine = this.currentLine + text;
        },
        closeTag: function (tag) {
            this.append('</' + tag + '>');
        },
        result: function () {
            var s = '';
            col.each(this._outputLines, function (key, value) {
                if (key > 0) {
                    s = s + '\r\n';
                }
                s = s + value;
            });
            return s;
        },
        endScope: function (scope) {
            while (scope.hasCurrentBlock()) {
                var block = scope.popBlock();
                this.closeTag(block.element);
                this.beginLine();
            }
        },
        endScopeWithoutLineBreak: function (scope) {
            while (scope.hasCurrentBlock()) {
                var block = scope.popBlock();
                this.closeTag(block.element);
            }
        },
        endCurrentScope: function (scope) {
            if (scope.hasCurrentBlock()) {
                var block = scope.popBlock();
                this.closeTag(block.element);
                this.beginLine();
            }
        },
        endCurrentScopeWithoutLineBreak:function(scope){
            if (scope.hasCurrentBlock()) {
                var block = scope.popBlock();
                this.closeTag(block.element);
            }
        },
        addInline:function(content){
            inl.replaceInline(content, this);
        },
        writeDataBlocks:function(dataBlocks){
            var self = this;
            if (dataBlocks && dataBlocks.length > 0){
                col.each(dataBlocks,function(k,v){
                    var id = v.id;
                    var type = v.classes? v.classes.toLocaleLowerCase():'json';
                    var contentType = type==='json'?'application/json':
                                      type==='jsonp'?'application/javascript':
                                      type==='xml'?'application/xml':'text/plain';
                    self.beginLine();
                    self.openTag("script",id,undefined,undefined,'type=\'' + contentType + '\'');
                    //TODO:write the data model out :)
                    self.beginLine();
                    self.closeTag("script");
                });
            }
        }

        // JSON.stringify
    };
};