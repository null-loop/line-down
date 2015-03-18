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

    function startsWith(symbol, line, fixedCount, preserveWhitespace, allowFloatingNumber) {
        var doesStartWith = false;
        var r = line;
        var count = 0;
        var f = false;
        var numberCount = '';
        var inClasses = false;
        var inId = false;
        var inData = false;
        var classes = '';
        var id = '';
        var data = '';
        var inferBaseCss = false;
        var allSymbol = symbol;
        if (allSymbol.length && allSymbol.length > 1)
        {
            symbol = allSymbol[0];
        }

        while (r.length > 0 && !f) {
            var c = r[0];
            if (c == symbol && !inData && !inClasses && !inId) {
                count++;
                if (allSymbol.length && allSymbol.length > 1 && count <= allSymbol.length)
                {
                    symbol = allSymbol[count];
                    doesStartWith = true;
                }
                else
                {
                    doesStartWith = true;
                }
                r = r.substring(1);
            }
            else if ($.inArray(c, digits) != -1 && !inClasses && !inId && ((count == 1) || (count > 1 && allowFloatingNumber))) {
                numberCount = numberCount + c;
                r = r.substring(1);
            }
            else if (c == '@' && !inClasses && count > 0) {
                inClasses = true;
                inId = false;
                r = r.substring(1);
            }
            else if (c == '@' && inClasses && classes.length==0 && !inferBaseCss){
                inferBaseCss = true;
                r = r.substring(1);
            }
            else if (c == '@' && inClasses) {
                inClasses = false;
                r = r.substring(1);
            }
            else if (c == '?' && !inId && count > 0) {
                inId = true;
                inClasses = false;
                r = r.substring(1);
            }
            else if (c == '?' && inId) {
                inId = false;
                r = r.substring(1);
            }
            else if (c == '$' && !inData && count > 0)
            {
                inData = true;
                r = r.substring(1);
            }
            else if (c == '$' && inData){
                inData = false;
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
            else if (inData && c!= ' ' && c!='$'){
                data = data + c;
                r = r.substring(1);
            }
            else if (count > 0) {
                f = true;
            } else {
                doesStartWith = false;
                f = true;
            }
        }

        if (numberCount.length > 0 && !allowFloatingNumber) {
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

        if (classes && inferBaseCss) {
            var sc = classes.split('&');
            var extras = [];
            $.each(sc,function(k,v){
               if (v.indexOf('-')!=-1){
                   var cs = v.split('-');
                   var ex = cs[0];
                   if (!contains(extras,ex) && !contains(sc,ex)) extras.push(ex);
               }
            });
            var extraClasses='';
            var eci = 0;
            $.each(extras,function(k,v){
                extraClasses=extraClasses+(eci>0?'&':'')+v;
                eci++;
            });
            if (extraClasses.length>0){
                classes = extraClasses + '&' + classes;
            }
        }

        var dataPairs;
        if (data && data.length > 0)
        {
            dataPairs = [];
            // split by & then by =
            var pairs = data.split('&');
            $.each(pairs,function(k,v){
               var pair = v.split('=');
                var key = '';
                var value = '';
                if (pair.length==1){
                    key = 'id';
                    value = pair[0];
                }
                else
                {
                    key = pair[0];
                    value = pair[1];
                }
                dataPairs.push({
                    key:key,
                    value:value
                });
            });
        }

        return {
            id: id,
            classes: classes,
            dataPairs:dataPairs,
            startsWith: doesStartWith,
            symbol: symbol,
            symbolCount: count,
            remainingLine: r,
            numberCapture:numberCount
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
            var startElementData;
            var closeElement = '';
            var remainder;

            var strong = startsWith('*',cLine,2,true);
            if (strong.startsWith && !scope.hasElementScope('strong')){
                startElement = 'strong';
                startSpec = '**';
                startElementId = strong.id;
                startElementClasses = strong.classes;
                startElementData = strong.dataPairs;
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
                    startElementData = emphasis.dataPairs;
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
                        startElementData = underline.dataPairs;
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
                            startElementData = superscript.dataPairs;
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
                                startElementData = small.dataPairs;
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
                                    startElementData = strike.dataPairs;
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
                                        startElementData = subscript.dataPairs;
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
                                            startElementData = code.dataPairs;
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
                                                startElementData = span.dataPairs;
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
                });
                linebuilder.append(he.encode(oLine));
                oLine = '';
                var con = {
                    element:startElement,
                    id:startElementId,
                    classes:startElementClasses,
                    dataPairs:startElementData
                };
                linebuilder.applyOptions(con);
                linebuilder.openTag(startElement, con.id, con.classes, con.dataPairs);
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
                if (scope.isImplicitParagraphScope()){
                    linebuilder.endCurrentScopeWithoutLineBreak(scope);
                }
                scope.pushBlock({
                    element: 'blockquote',
                    spec: '\"\"'
                });
                blockQuotes.element = 'blockquote';
                linebuilder.applyOptions(blockQuotes);


                /* TODO: BUILD AND SUPPORT THIS ELSEWHERE
                scope.pushData(blockQuotes);
                */

                linebuilder.openTag('blockquote', blockQuotes.id, blockQuotes.classes, blockQuotes.dataPairs);
                trimmedContent = blockQuotes.remainingLine;
                hasBlockSpec = true;
            }
        }
        else {
            // explicit paragraph
            var paragraph = startsWith('\'', trimmedContent, 2);
            if (paragraph.startsWith) {
                if (!(scope.hasElementScope('p') && paragraph.remainingLine.trim().length == 0)) {
                    if (scope.isImplicitParagraphScope()){
                        linebuilder.endCurrentScopeWithoutLineBreak(scope);
                    }
                    scope.pushBlock({
                        element: 'p',
                        spec: '\'\''
                    });
                    paragraph.element = 'p';
                    linebuilder.applyOptions(paragraph);
                    linebuilder.openTag('p', paragraph.id, paragraph.classes, paragraph.dataPairs);
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
                    if (scope.isImplicitParagraphScope()){
                        linebuilder.endCurrentScopeWithoutLineBreak(scope);
                    }
                    hr.element='hr';
                    linebuilder.applyOptions(hr);
                    linebuilder.selfClosingTag('hr', hr.id, hr.classes, hr.dataPairs);
                    trimmedContent = hr.remainingLine;
                    hasBlockSpec = true;
                }
                else
                {
                    // unordered list
                    var ul = startsWith('%&', trimmedContent, 2);
                    if (ul.startsWith){
                        if (!(scope.hasElementScope('ul') && ul.remainingLine.trim().length == 0)) {
                            if (scope.isImplicitParagraphScope()){
                                linebuilder.endCurrentScopeWithoutLineBreak(scope);
                            }
                            scope.pushBlock({
                                element: 'ul',
                                spec: '%&'
                            });
                            ul.element='ul';
                            linebuilder.applyOptions(ul);
                            linebuilder.openTag('ul', ul.id, ul.classes, ul.dataPairs);
                            trimmedContent = ul.remainingLine;
                            hasBlockSpec = true;
                        }
                    }
                    else
                    {
                        // ordered list
                        var ol = startsWith('%+', trimmedContent, 2, false, true);
                        if (ol.startsWith){
                            if (!(scope.hasElementScope('ol') && ol.remainingLine.trim().length == 0)) {
                                if (scope.isImplicitParagraphScope()){
                                    linebuilder.endCurrentScopeWithoutLineBreak(scope);
                                }
                                scope.pushBlock({
                                    element: 'ol',
                                    spec: '%+'
                                });
                                ol.element='ol';
                                if (ol.numberCapture){
                                    linebuilder.applyOptions(ol);
                                    linebuilder.openTag('ol', ol.id, ol.classes, ol.dataPairs, 'start=\'' + ol.numberCapture + '\'');
                                }
                                else
                                {
                                    linebuilder.applyOptions(ol);
                                    linebuilder.openTag('ol', ol.id, ol.classes, ol.dataPairs);
                                }

                                trimmedContent = ol.remainingLine;
                                hasBlockSpec = true;
                            }
                        }
                        else
                        {
                            // data block
                            var dataBlock = startsWith('$', trimmedContent, 4);
                            if (dataBlock.startsWith){
                                if (!(scope.inDataBlock() && dataBlock.remainingLine.trim().length == 0)) {
                                    scope.startDataBlock(dataBlock);
                                    if (!linebuilder.options.generateIds){
                                        linebuilder.options.implicitGenerateIds = true;
                                        linebuilder.options.generateIds = true;
                                    }
                                    trimmedContent = dataBlock.remainingLine;
                                    hasBlockSpec = true;
                                }
                            }
                        }
                    }

                    // ordered list
                }

            }
        }

        // detect headings
        var headings = startsWith('#', trimmedContent);
        if (headings.startsWith) {
            localScope.pushBlock({
                element: 'h' + headings.symbolCount
            });
            headings.element = 'h';
            linebuilder.applyOptions(headings);
            linebuilder.openTag('h' + headings.symbolCount, headings.id, headings.classes, headings.dataPairs);
            trimmedContent = headings.remainingLine;
            hasLineSpec = true;
        } else {
            // more line specs

            var li = startsWith('+', trimmedContent);
            //TODO:Implicit OL
            if (li.startsWith && li.remainingLine.trim().length != 0) {
                if (!scope.hasElementScope('ol')){
                    scope.pushBlock({
                        element: 'ol',
                        spec: '++',
                        implicit: true
                    });
                    linebuilder.openTag('ol');
                }
                localScope.pushBlock({
                    element: 'li'
                });
                li.element = 'li';
                linebuilder.applyOptions(li);
                linebuilder.openTag('li', li.id, li.classes, li.dataPairs);
                trimmedContent = li.remainingLine;
                hasLineSpec = true;
            } else {

              //TODO:implicit UL
                li = startsWith('&', trimmedContent);
                if (li.startsWith && li.remainingLine.trim().length != 0) {
                    if (!scope.hasElementScope('ul')){
                        scope.pushBlock({
                            element: 'ul',
                            spec: '&&',
                            implicit: true
                        });
                        linebuilder.openTag('ul');
                    }
                    localScope.pushBlock({
                        element: 'li'
                    });
                    li.element = 'li';
                    linebuilder.applyOptions(li);
                    linebuilder.openTag('li', li.id, li.classes, li.dataPairs);
                    trimmedContent = li.remainingLine;
                    hasLineSpec = true;
                }
                else
                {
                    // more line specs
                }
            }
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
            else if (ltwo == '%&' && scope.hasElementScope('ul')) {
                closeUntil = 'ul';
                closeLength = 2;
            }
            else if (ltwo == '%+' && scope.hasElementScope('ol')) {
                closeUntil = 'ol';
                closeLength = 2;
            }
            else
            {
                if(trimmedContent.length > 3){
                    var lFour = trimmedContent.substring(trimmedContent.length - 4, trimmedContent.length);
                    if (lFour=='$$$$' && scope.inDataBlock()){
                        if (linebuilder.options.implicitGenerateIds){
                            linebuilder.options.generateIds = false;
                        }
                        scope.finishDataBlock();
                        trimmedContent = trimmedContent.substring(0, trimmedContent.length - 4).trim();
                    }
                }
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
            _dataBlocks:[],
            _currentDataBlock:null,
            _currentGeneratedDataBlockIdIndex:0,
            inDataBlock:function(){
                if (this._currentDataBlock==null) return false;
                else return true;
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
            },
            isImplicitParagraphScope:function(){
                if (this._currentBlock==null) return false;
                if (this._currentBlock.element=='p' && this._currentBlock.implicit) return true;
                return false
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
            _generateIdsFor:['h','li','p','blockquote'],
            currentLine: '',
            options:options,
            scope: newScope,

            generateId:function(block){
                var allowed = false;
                if (block.element=='h' || block.element=='p' || block.element=='li') allowed = true;
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
                    return possibleId;
                }
                return undefined;
                //TODO:this for one thing... also - need to work with the scope to get the real content when working with opening block specs on their own line
            },
            applyOptions:function(block){
                if (options && options.generateIds && !block.id){
                    block.id = this.generateId(block);
                }
            },

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

            formatDataKey:function(key){
                //TODO:This is so naive... - http://stackoverflow.com/questions/9862761/how-to-check-if-character-is-a-letter-in-javascript
                function isLetter(str) {
                    return str.length === 1 && str.match(/[a-z]/i);
                }
                var k = '';
                var kc = key.split('');
                var wasLower = false;
                $.each(kc,function(i,v){
                    if (isLetter(v)){
                        var uv = v.toLocaleUpperCase();
                        if (uv == v) {
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
                    $.each(data,function(k,v){
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
            },
            writeDataBlocks:function(dataBlocks){
                var self = this;
                if (dataBlocks && dataBlocks.length > 0){
                    console.log("Writing data blocks");
                    $.each(dataBlocks,function(k,v){
                       var id = v.id;
                        var type = v.classes? v.classes.toLocaleLowerCase():'json';
                        var contentType = type=='json'?'application/json':
                                          type=='jsonp'?'application/javascript':
                                          type=='xml'?'application/xml':'text/plain';
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


        while (lineIndex < lines.length) {
            var lineText = lines[lineIndex];
            buildLine(lineText, newScope, lineBuilder);
            lineIndex++;
        }

        if (newScope.hasCurrentBlock()) {
            lineBuilder.beginLine();
            lineBuilder.endScope(newScope);
        }

        if (newScope.hasDataBlocks()){
            lineBuilder.writeDataBlocks(newScope.getDataBlocks());
        }


        lineBuilder.complete();

        return lineBuilder.result();
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

    ld.parseWithOptions = parseWithOptions;
    ld.parseNoOptions = noOptionsParse;
    ld.parse = defaultOptionsParse;
    ld.contains = contains;

})(window.linedown = window.linedown || {}, jQuery)
