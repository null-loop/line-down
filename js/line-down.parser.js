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

    function buildLine(lineIndex, lineContent, scope, cssWhitelist, idWhitelist) {
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

        // detect block quotes
        var blockQuotes = startsWith('\"', trimmedContent);
        if (blockQuotes.startsWith && blockQuotes.symbolCount == 2) {
          // TODO:check if there's a current block - if it matches our spec we need to close rather than open...
          scope.pushBlock({
            element:'blockquote',
            spec:'\"\"'
          });
          blockOpenElement = 'blockquote';
          blockOpenClasses = blockQuotes.classes;
          blockOpenId = blockQuotes.id;
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
            blockOpenElement = 'p';
            blockOpenClasses = paragraph.classes;
            blockOpenId = paragraph.id;
            trimmedContent = paragraph.remaingLine;
            hasBlockSpec = true;
          }
        }

        // detect headings
        var headings = startsWith('#', trimmedContent);
        if (headings.startsWith) {
            lineElement = 'h' + headings.symbolCount;
            trimmedContent = headings.remaingLine;
            lineClasses = headings.classes;
            lineId = headings.id;
            hasLineSpec = true;
        } else {
          // more line specs

        }

        if (!hasLineSpec && (!scope.hasCurrentBlock() || scope.currentBlockElement() == 'blockquote') && trimmedContent.length > 0) {
          // push an implicit p block
          scope.pushBlock({
            element:'p',
            spec:'\'\'',
            implicit:true
          });
          implicitBlockOpenElement='p';
        }
        else if(!hasLineSpec && !hasBlockSpec){
          if (trimmedContent.length == 0)
          {
            // close any open blocks
            if (scope.hasCurrentBlock()){
              manyBlockCloseElements = [];
              while (scope.hasCurrentBlock()){
                var block = scope.popBlock();
                manyBlockCloseElements.push(block.element);
              }
              manyBlockCloseElements.reverse();
            }
            else{
              noOutput = true;
            }
          }
        }

        // look for closes for open block specs


        var finalLineContent =  trimmedContent;

        // apply white lists
        if (cssWhitelist){
          // empty list means no css classes
          if (cssWhitelist.length==0){
            lineClasses = undefined;
            blockOpenClasses = undefined;
          }
          else
          {

          }
          // todo: the rest
        }

        if (idWhitelist) {
          if (idWhitelist.length==0){
            lineId = undefined;
            blockOpenId = undefined;
          }
          else
          {

          }
          // todo: the rest
        }

        return {
            noOutput: noOutput,
            lineIndex: lineIndex,
            lineContent: finalLineContent,
            lineElement: lineElement,
            lineId: lineId,
            lineClasses: lineClasses,
            implicitBlockOpenElement: implicitBlockOpenElement,
            blockOpenElement: blockOpenElement,
            blockOpenId:blockOpenId,
            blockOpenClasses:blockOpenClasses,
            blockCloseElement:blockCloseElement,
            manyBlockCloseElements:manyBlockCloseElements,

            result:function() {
                var l = this.blockOpenElement ? this.open(this.blockOpenElement, this.blockOpenId, this.blockOpenClasses):'';
                if (this.implicitBlockOpenElement) {
                  l = l + this.open(this.implicitBlockOpenElement);
                }
                if (this.lineElement) {
                  l = l + this.open(this.lineElement, this.lineId, this.lineClasses) + this.lineContent + this.close(this.lineElement);
                }
                else
                {
                  l = l + this.lineContent;
                }
                if (this.blockCloseElement){
                  l = l + this.close(this.blockCloseElement);
                }
                var many;
                while (this.manyBlockCloseElements && this.manyBlockCloseElements.length > 0){
                  var e = this.manyBlockCloseElements.pop();
                  if (many) l = l + '\r\n';
                  l = l + this.close(e);
                  many = true;
                }
                return l;
            },
            open: function (tag, id, classes) {

                var o = '<' + tag;

                if (id && id.length > 0) {
                    o = o + ' id=\'' + id + '\'';
                }
                if (classes && classes.length > 0) {
                    o = o + ' class=\'' + replaceAll('\\.',' ',classes) + '\'';
                }

                o = o + '>';

                return o;
            },
            close:function(tag) {
                return '</' + tag + '>';
            }
        }
    }

    function parse(linedownContent) {
      return parseWithOptions(linedownContent, {});
    }

    function parseWithOptions(linedownContent, options) {
        var cssWhitelist = options.cssWhitelist;
        var idWhitelist = options.idWhitelist;

        var re=/\r\n|\n\r|\n|\r/g;

        var lines=linedownContent.replace(re,"\n").split("\n");
        var lineIndex = 0;

        var builder = {
            _outputLines: [],
            addLine: function(line) {
                this._outputLines.push(line);
            },
            result: function () {
                var s = '';
                var sKey = 0;
                $.each(this._outputLines, function (key, value) {
                    if (!value.noOutput)
                    {
                      var r = value.result();
                      if (sKey > 0) s = s + '\r\n';
                      s = s + r;
                      sKey = sKey + 1;
                    }
                });
                return s;
            }
        }

        var scope = {
            _scopeStack: [],
            _currentBlock:null,
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
            }
        };

        while (lineIndex < lines.length) {
            var lineText = lines[lineIndex];
            var line = buildLine(lineIndex, lineText, scope, cssWhitelist, idWhitelist);
            builder.addLine(line);
            lineIndex++;
        }

        if (scope.hasCurrentBlock())
        {
          builder.addLine(buildLine(lineIndex,'',scope));
        }

        return builder.result();
    }

    ld.parse = parse;

})(window.linedown = window.linedown || {}, jQuery)
