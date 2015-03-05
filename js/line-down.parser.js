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

(function (ld, $, undefined) {

    var digits = '0123456789';

    function startsWith(symbol, line) {
        var doesStartWith = false;
        var r = line;
        var count = 0;
        var f = false;
        var numberCount = '';
        var inClasses = false;
        var inId = false;
        var classes = '';
        var id = '';

        while (r.length > 0 && !f) {
            var c = r[0];
            if (c == symbol) {
              count++;
              doesStartWith = true;
              r = r.substring(1);
            }
            else if ($.inArray(c, digits) != -1 && !inClasses) {
              numberCount = numberCount + c;
              r = r.substring(1);
            }
            else if (c == '@' && !inClasses) {
              inClasses = true;
              inId = false;
              r = r.substring(1);
            }
            else if (c == '@' && inClasses) {
              inClasses = false;
              r = r.substring(1);
            }
            else if (c == '?' && !inId) {
              inId = true;
              inClasses = false;
              r = r.substring(1);
            }
            else if (c == '?' && inId) {
              inId = false;
              r = r.substring(1);
            }
            else if (inClasses && c != ' ' && c!='?') {
              classes = classes + c;
              r = r.substring(1);
            }
            else if (inId && c != ' ' && c!='@') {
              id = id + c;
              r = r.substring(1);
            }
            else if (count > 0) {
              f = true;
            } else {
              doesStartWith = false;
              f = true;
            }
        }

        if (numberCount.length > 0) {
          count = parseInt(numberCount);
        }
        r = r.trim();

        return {
            id:id,
            classes:classes,
            startsWith: doesStartWith,
            symbol: symbol,
            symbolCount: count,
            remaingLine: r
        };
    }

    function replaceAll(find, replace, str) {
      return str.replace(new RegExp(find, 'g'), replace);
    }

    function buildLine(lineIndex, lineContent, scope, linebuilder) {

        linebuilder.beginLine();

        var trimmedContent = lineContent.trim();

        var blockOpenElement;
        var blockOpenId;
        var blockOpenClasses;
        var blockCloseElement;
        var implicitBlockOpenElement;
        var manyBlockCloseElements;

        var lineElement;
        var lineClasses;
        var lineId;

        var hasLineSpec;
        var hasBlockSpec;

        var noOutput;
        var localScope = createScope();

        // detect block quotes
        var blockQuotes = startsWith('\"', trimmedContent);
        if (blockQuotes.startsWith && blockQuotes.symbolCount == 2) {
          // TODO:check if there's a current block - if it matches our spec we need to close rather than open...
          scope.pushBlock({
            element:'blockquote',
            spec:'\"\"'
          });
          linebuilder.openTag('blockquote', blockQuotes.id, blockQuotes.classes)
          trimmedContent = blockQuotes.remaingLine;
          hasBlockSpec = true;
        }
        else
        {
          // more block specs
          var paragraph = startsWith('\'', trimmedContent);
          if (paragraph.startsWith && paragraph.symbolCount == 2) {
            scope.pushBlock({
              element:'p',
              spec:'\'\''
            });
            linebuilder.openTag('p', paragraph.id, paragraph.classes)
            trimmedContent = paragraph.remaingLine;
            hasBlockSpec = true;
          }
        }

        // detect headings
        var headings = startsWith('#', trimmedContent);
        if (headings.startsWith) {
            localScope.pushBlock({
              element:'h' + headings.symbolCount
            });
            linebuilder.openTag('h' + headings.symbolCount, headings.id, headings.classes)
            trimmedContent = headings.remaingLine;
            hasLineSpec = true;
        } else {
          // more line specs

        }

        // check and see if we show open a paragraph block
        if (!localScope.hasCurrentBlock() && (!scope.hasCurrentBlock() || scope.currentBlockElement() == 'blockquote') && trimmedContent.length > 0) {
          scope.pushBlock({
            element:'p',
            spec:'\'\'',
            implicit:true
          });
          linebuilder.openTag('p');
        }
        else if(!hasLineSpec && !hasBlockSpec){
          if (trimmedContent.length == 0)
          {
            // close any open blocks
            if (scope.hasCurrentBlock()){
              manyBlockCloseElements = [];
              linebuilder.endScope(scope);
            }
          }
        }

        linebuilder.append(he.encode(trimmedContent));
        linebuilder.endScope(localScope);
    }

    function parse(linedownContent) {
      return parseWithOptions(linedownContent, {});
    }

    function contains(a, obj) {
      for (var i = 0; i < a.length; i++) {
          if (a[i] === obj) {
              return true;
          }
      }
      return false;
    }

    function createScope(){
      return scope = {
          _scopeStack: [],
          _currentBlock:null,
          _usedIds:[],
          hasCurrentBlock:function(){
            if (this._currentBlock!=null) return true;
            else return false;
          },
          currentBlockElement:function(){
            if (!this.hasCurrentBlock()) return null;
            return this._currentBlock.element;
          },
          pushBlock:function(block){
            this._scopeStack.push(block);
            this._currentBlock = block;
          },
          popBlock:function(){
            var current = this._scopeStack.pop();
            if (this._scopeStack.length > 0)
            {
              this._currentBlock = this._scopeStack[this._scopeStack.length - 1];
            }
            else
            {
              this._currentBlock = null;
            }
            return current;
          },
          hasElementScope:function(element){
            var has = false;
            $.each(this._scopeStack,function(i,v){
              if (v.element==element) has = true;
            });
            return has;
          },
          shouldTrim:function(){
            return !this.hasElementScope("code");
          },
          usedId:function(id){
            this._usedIds.push(id);
          },
          hasUsedId:function(id){
            return contains(this._usedIds, id);
          }
      };
    }

    function parseWithOptions(linedownContent, options) {
        var re=/\r\n|\n\r|\n|\r/g;

        var lines=linedownContent.replace(re,"\n").split("\n");
        var lineIndex = 0;
        var newScope = createScope();
        var lineBuilder = {
            _outputLines: [],
            currentLine:'',
            cssWhitelist: options.cssWhitelist,
            idWhitelist: options.idWhitelist,
            scope: newScope,

            beginLine:function(){
              if (this.currentLine!='') {
                this._outputLines.push(this.currentLine);
              }
              this.currentLine='';
            },
            complete:function(){
              if (this.currentLine!='') {
                this._outputLines.push(this.currentLine);
              }
            },
            openTag: function (tag,id,classes){
              //TODO:Check against white lists!
              var t = '<' + tag;
              if (id) {
                if (!this.scope.hasUsedId(id))
                {
                  t = t + ' id=\'' + id + '\'';
                  this.scope.usedId(id);
                }
              }
              if (classes)
              {
                classes = classes.split('.');
                // remove invalid classes
                classes = classes.join(' ');
                t = t + ' class=\'' + classes + '\'';
              }
              t = t + '>';
              this.append(t);
            },
            append: function (text) {
              this.currentLine=this.currentLine+text;
            },
            closeTag: function (tag) {
              this.append('</' + tag + '>');
            },
            result: function () {
                var s = '';
                $.each(this._outputLines, function (key, value) {
                    if (key > 0) s = s + '\r\n';
                    s = s + value;
                });
                return s;
            },
            endScope:function(scope){
              while (scope.hasCurrentBlock()){
                var block = scope.popBlock();
                this.closeTag(block.element);
                this.beginLine();
              }
            },
            endCurrentScope:function(scope){
              if (scope.hasCurrentBlock()){
                var block = scope.popBlock();
                this.closeTag(block.element);
                this.beginLine();
              }
            }

        }


        while (lineIndex < lines.length) {
            var lineText = lines[lineIndex];
            buildLine(lineIndex, lineText, newScope, lineBuilder);
            lineIndex++;
        }

        if (newScope.hasCurrentBlock())
        {
          lineBuilder.beginLine();
          lineBuilder.endScope(newScope);
        }


        lineBuilder.complete();

        return lineBuilder.result();
    }

    ld.parse = parse;

})(window.linedown = window.linedown || {}, jQuery)
