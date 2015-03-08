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

    function startsWith(symbol, line, fixedCount, preserveWhitespace) {
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
            else if ($.inArray(c, digits) != -1 && !inClasses && !inId && count == 1) {
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
            else if (inClasses && c != ' ' && c != '?') {
                classes = classes + c;
                r = r.substring(1);
            }
            else if (inId && c != ' ' && c != '@') {
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
        if (!preserveWhitespace) {
            r = r.trim();
        }

        if (fixedCount && count != fixedCount) {
            // no match
            return {
                startsWith: false,
                remainingLine: line
            }
        }

        return {
            id: id,
            classes: classes,
            startsWith: doesStartWith,
            symbol: symbol,
            symbolCount: count,
            remainingLine: r
        };
    }

    function replaceInline(content, linebuilder){
        var cLine = content;
        var oLine = '';
        var scope = createScope();
        while (cLine.length > 0){

            var startElement = '';
            var startSpec = '';
            var startElementId;
            var startElementClasses;
            var closeElement = '';
            var remainder;

            var strong = startsWith('*',cLine,2,true);
            if (strong.startsWith && !scope.hasElementScope('strong')){
                startElement = 'strong';
                startSpec = '**';
                startElementId = strong.id;
                startElementClasses = strong.classes;
                remainder = strong.remainingLine;
            }
            else if(strong.startsWith){
                closeElement = 'strong';
                remainder = strong.remainingLine;
            }
            else
            {
                var emphasis = startsWith('/',cLine,2,true);
                if (emphasis.startsWith && !scope.hasElementScope('em')){
                    startElement = 'em';
                    startSpec = '//';
                    startElementId = emphasis.id;
                    startElementClasses = emphasis.classes;
                    remainder = emphasis.remainingLine;
                }
                else if(emphasis.startsWith){
                    closeElement = 'em';
                    remainder = emphasis.remainingLine;
                }
                else
                {
                    var underline = startsWith('_',cLine,2,true);
                    if (underline.startsWith && !scope.hasElementScope('u')){
                        startElement = 'u';
                        startSpec = '__';
                        startElementId = underline.id;
                        startElementClasses = underline.classes;
                        remainder = underline.remainingLine;
                    }
                    else if(underline.startsWith){
                        closeElement = 'u';
                        remainder = underline.remainingLine;
                    }
                    else
                    {
                        var superscript = startsWith('^',cLine,2,true);
                        if (superscript.startsWith && !scope.hasElementScope('sup')){
                            startElement = 'sup';
                            startSpec = '^^';
                            startElementId = superscript.id;
                            startElementClasses = superscript.classes;
                            remainder = superscript.remainingLine;
                        }
                        else if(superscript.startsWith){
                            closeElement = 'sup';
                            remainder = superscript.remainingLine;
                        }
                        else
                        {
                            var small = startsWith('>',cLine,2,true);
                            if (small.startsWith && !scope.hasElementScope('small')){
                                startElement = 'small';
                                startSpec = '>>';
                                startElementId = small.id;
                                startElementClasses = small.classes;
                                remainder = small.remainingLine;
                            }
                            else if(small.startsWith){
                                closeElement = 'small';
                                remainder = small.remainingLine;
                            }
                            else
                            {
                                var strike = startsWith('~',cLine,2,true);
                                if (strike.startsWith && !scope.hasElementScope('strike')){
                                    startElement = 'strike';
                                    startSpec = '~~';
                                    startElementId = strike.id;
                                    startElementClasses = strike.classes;
                                    remainder = strike.remainingLine;
                                }
                                else if(strike.startsWith){
                                    closeElement = 'strike';
                                    remainder = strike.remainingLine;
                                }
                                else
                                {
                                    var subscript = startsWith('!',cLine,2,true);
                                    if (subscript.startsWith && !scope.hasElementScope('sub')){
                                        startElement = 'sub';
                                        startSpec = '!!';
                                        startElementId = subscript.id;
                                        startElementClasses = subscript.classes;
                                        remainder = subscript.remainingLine;
                                    }
                                    else if(subscript.startsWith){
                                        closeElement = 'sub';
                                        remainder = subscript.remainingLine;
                                    }
                                    else
                                    {
                                        var code = startsWith(':',cLine,2,true);
                                        if (code.startsWith && !scope.hasElementScope('code')){
                                            startElement = 'code';
                                            startSpec = '::';
                                            startElementId = code.id;
                                            startElementClasses = code.classes;
                                            remainder = code.remainingLine;
                                        }
                                        else if(code.startsWith){
                                            closeElement = 'code';
                                            remainder = code.remainingLine;
                                        }
                                        else{
                                            var span = startsWith('`',cLine,2,true);
                                            if (span.startsWith && !scope.hasElementScope('span')){
                                                startElement = 'span';
                                                startSpec = '``';
                                                startElementId = span.id;
                                                startElementClasses = span.classes;
                                                remainder = span.remainingLine;
                                            }
                                            else if(span.startsWith){
                                                closeElement = 'span';
                                                remainder = span.remainingLine;
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }

            if (startElement.length > 0)
            {
                scope.pushBlock({
                    element:startElement,
                    spec:startSpec
                })
                linebuilder.append(he.encode(oLine));
                oLine = '';
                linebuilder.openTag(startElement, startElementId, startElementClasses);
                cLine = remainder;
            }
            else if (closeElement.length > 0)
            {
                linebuilder.append(he.encode(oLine));
                oLine = '';
                while (scope.hasCurrentBlock() && scope.currentBlockElement() != closeElement) {
                    linebuilder.endCurrentScopeWithoutLineBreak(scope);
                }
                linebuilder.endCurrentScopeWithoutLineBreak(scope);
                cLine = remainder;
            }
            else
            {
                oLine = oLine + cLine[0];
                cLine = cLine.substring(1);
           }

        }
        if (oLine.length > 0)
        {
            linebuilder.append(he.encode(oLine));
        }
        if (scope.hasCurrentBlock()){
            linebuilder.endScopeWithoutLineBreak(scope);
        }
    }

    function buildLine(lineContent, scope, linebuilder) {

        linebuilder.beginLine();

        var trimmedContent = lineContent.trim();
        var hasLineSpec;
        var hasBlockSpec;
        var localScope = createScope();

        // detect block quotes
        var blockQuotes = startsWith('\"', trimmedContent, 2);
        if (blockQuotes.startsWith) {
            if (!(scope.hasElementScope('blockquote') && blockQuotes.remainingLine.trim().length == 0)) {
                scope.pushBlock({
                    element: 'blockquote',
                    spec: '\"\"'
                });
                linebuilder.openTag('blockquote', blockQuotes.id, blockQuotes.classes);
                trimmedContent = blockQuotes.remainingLine;
                hasBlockSpec = true;
            }
        }
        else {
            // explicit paragraph
            var paragraph = startsWith('\'', trimmedContent, 2);
            if (paragraph.startsWith) {
                if (!(scope.hasElementScope('p') && paragraph.remainingLine.trim().length == 0)) {
                    scope.pushBlock({
                        element: 'p',
                        spec: '\'\''
                    });
                    linebuilder.openTag('p', paragraph.id, paragraph.classes);
                    trimmedContent = paragraph.remainingLine;
                    hasBlockSpec = true;
                }
            }
            else
            {
                // horizontal rule
                var hr = startsWith('-', trimmedContent, 3);
                // starts AND ends
                if (hr.startsWith && hr.remainingLine.trim().length == 0){
                    linebuilder.selfClosingTag('hr', hr.id, hr.classes);
                    trimmedContent = hr.remainingLine;
                    hasBlockSpec = true;
                }
                else
                {
                    // pre formatted
                }

            }
        }

        // detect headings
        var headings = startsWith('#', trimmedContent);
        if (headings.startsWith) {
            localScope.pushBlock({
                element: 'h' + headings.symbolCount
            });
            linebuilder.openTag('h' + headings.symbolCount, headings.id, headings.classes);
            trimmedContent = headings.remainingLine;
            hasLineSpec = true;
        } else {
            // more line specs

        }

        if (!hasLineSpec && !hasBlockSpec) {
            if (trimmedContent.length == 0) {
                // close any open blocks
                while (scope.hasCurrentBlock() && scope.currentBlockElement() != 'blockquote') {
                    linebuilder.endCurrentScope(scope);
                }
            }
        }

        var closeUntil;
        var alreadyEnded = false;

        // have we got an explicit block close? if so remove it from the end and remember we need to close up
        if (trimmedContent.length > 1) {
            var ltwo = trimmedContent.substring(trimmedContent.length - 2, trimmedContent.length);
            var closeLength;

            if (ltwo == '\'\'' && scope.hasElementScope('p')) {
                closeUntil = 'p';
                closeLength = 2;
            }
            else if (ltwo == '\"\"' && scope.hasElementScope('blockquote')) {
                closeUntil = 'blockquote';
                closeLength = 2;
            }

            if (closeUntil){
                trimmedContent = trimmedContent.substring(0, trimmedContent.length - closeLength).trim();
            }
        }

        // check and see if we should open a paragraph block
        if (!localScope.hasCurrentBlock() && (!scope.hasCurrentBlock() || scope.currentBlockElement() == 'blockquote') && trimmedContent.length > 0) {
            scope.pushBlock({
                element: 'p',
                spec: '\'\'',
                implicit: true
            });
            linebuilder.openTag('p');
        }



        // close up blocks
        if (closeUntil) {
            alreadyEnded = true;
            // do the inline!
            linebuilder.addInline(trimmedContent);
            linebuilder.endScopeWithoutLineBreak(localScope);
            while (scope.hasCurrentBlock() && scope.currentBlockElement() != closeUntil) {
                linebuilder.endCurrentScopeWithoutLineBreak(scope);
            }
            linebuilder.endCurrentScopeWithoutLineBreak(scope);
        }

        if (!alreadyEnded) {
            // do the inline!
            linebuilder.addInline(trimmedContent);
            linebuilder.endScope(localScope);
        }
    }

    function noOptionsParse(linedownContent)
    {
        return parseWithOptions(linedownContent, {});
    }

    function defaultOptionsParse(linedownContent) {
        return parseWithOptions(linedownContent, {
            idWhitelist:undefined,
            cssWhitelist:undefined,
            idBlacklist:undefined,
            cssBlacklist:undefined,
            deprecatedTags:[
                {tag:"u",class:"underline"},
                {tag:"strike",class:"strikethrough"}
            ]
        });
        //TODO:Support deprecatedTags, idWhitelist & cssWhitelist, idBlacklist & cssBlacklist
    }

    function contains(a, obj) {
        for (var i = 0; i < a.length; i++) {
            if (a[i] === obj) {
                return true;
            }
        }
        return false;
    }

    function createScope() {
        return {
            _scopeStack: [],
            _currentBlock: null,
            _usedIds: [],
            hasCurrentBlock: function () {
                if (this._currentBlock != null) return true;
                else return false;
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
                $.each(this._scopeStack, function (i, v) {
                    if (v.element == element) has = true;
                });
                return has;
            },
            shouldTrim: function () {
                return !this.hasElementScope("pre");
            },
            usedId: function (id) {
                this._usedIds.push(id);
            },
            hasUsedId: function (id) {
                return contains(this._usedIds, id);
            }
        };
    }

    function parseWithOptions(linedownContent, options) {
        var re = /\r\n|\n\r|\n|\r/g;

        var lines = linedownContent.replace(re, "\n").split("\n");
        var lineIndex = 0;
        var newScope = createScope();
        var lineBuilder = {
            _outputLines: [],
            currentLine: '',
            cssWhitelist: options.cssWhitelist,
            idWhitelist: options.idWhitelist,
            scope: newScope,

            beginLine: function () {
                if (this.currentLine != '') {
                    this._outputLines.push(this.currentLine);
                }
                this.currentLine = '';
            },
            complete: function () {
                if (this.currentLine != '') {
                    this._outputLines.push(this.currentLine);
                }
            },
            tagWithEnd: function (tag, id, classes, end) {
                //TODO:Check against white lists!
                var t = '<' + tag;
                if (id) {
                    if (!this.scope.hasUsedId(id)) {
                        t = t + ' id=\'' + id + '\'';
                        this.scope.usedId(id);
                    }
                }
                if (classes) {
                    classes = classes.split('.');
                    // remove invalid classes
                    classes = classes.join(' ');
                    t = t + ' class=\'' + classes + '\'';
                }
                t = t + end;
                this.append(t);
            },
            openTag: function (tag, id, classes) {
                this.tagWithEnd(tag,id,classes, '>');
            },
            selfClosingTag:function(tag,id,classes){
                this.tagWithEnd(tag,id,classes, '/>');
            },
            append: function (text) {
                this.currentLine = this.currentLine + text;
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
                replaceInline(content, this);
            }

        }


        while (lineIndex < lines.length) {
            var lineText = lines[lineIndex];
            buildLine(lineText, newScope, lineBuilder);
            lineIndex++;
        }

        if (newScope.hasCurrentBlock()) {
            lineBuilder.beginLine();
            lineBuilder.endScope(newScope);
        }


        lineBuilder.complete();

        return lineBuilder.result();
    }

    ld.parseNoOptions = noOptionsParse;
    ld.parse = defaultOptionsParse;
    ld.contains = contains;

})(window.linedown = window.linedown || {}, jQuery)
