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

var fnc = {
    startsWith:require('./startswith.js').startsWith,
    createScope:require('./scope.js').createScope
};

exports.processLine = function(lineContent, scope, linebuilder) {

    linebuilder.beginLine();

    var trimmedContent = lineContent.trim();
    var hasLineSpec;
    var hasBlockSpec;
    var localScope = fnc.createScope();

    // detect block quotes
    var blockQuotes = fnc.startsWith('\"', trimmedContent, 2);
    if (blockQuotes.startsWith) {
        if (!(scope.hasElementScope('blockquote') && blockQuotes.remainingLine.trim().length === 0)) {
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
        var paragraph = fnc.startsWith('\'', trimmedContent, 2);
        if (paragraph.startsWith) {
            if (!(scope.hasElementScope('p') && paragraph.remainingLine.trim().length === 0)) {
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
            var hr = fnc.startsWith('-', trimmedContent, 3);
            // starts AND ends
            if (hr.startsWith && hr.remainingLine.trim().length === 0){
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
                var ul = fnc.startsWith('%&', trimmedContent, 2);
                if (ul.startsWith){
                    if (!(scope.hasElementScope('ul') && ul.remainingLine.trim().length === 0)) {
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
                    var ol = fnc.startsWith('%+', trimmedContent, 2, false, true);
                    if (ol.startsWith){
                        if (!(scope.hasElementScope('ol') && ol.remainingLine.trim().length === 0)) {
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
                        var dataBlock = fnc.startsWith('$', trimmedContent, 4);
                        if (dataBlock.startsWith){
                            if (!(scope.inDataBlock() && dataBlock.remainingLine.trim().length === 0)) {
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
    var headings = fnc.startsWith('#', trimmedContent);
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

        //TODO: move these into block specs...
        var li = fnc.startsWith('+', trimmedContent);
        //TODO:Implicit OL
        if (li.startsWith && li.remainingLine.trim().length !== 0) {
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
            li = fnc.startsWith('&', trimmedContent);
            if (li.startsWith && li.remainingLine.trim().length !== 0) {
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
                var c = fnc.startsWith('/', trimmedContent);
                if (c.startsWith && c.symbolCount === 1){
                    if (linebuilder.options && linebuilder.options.outputComments){
                        // write it as a HTML comment
                        linebuilder.append('<!--' + c.remainingLine + '-->');
                        // the rest of the line simply does not exist!
                        trimmedContent = '';
                    }
                    else{
                        // the rest of the line simply does not exist!
                        trimmedContent = '';
                    }
                }
            }
        }
    }

    if (!hasLineSpec && !hasBlockSpec) {
        if (trimmedContent.length === 0) {
            // close any open blocks
            while (scope.hasCurrentBlock() && scope.currentBlockElement() !== 'blockquote') {
                linebuilder.endCurrentScope(scope);
            }
        }
    }

    var closeUntil;
    var alreadyEnded = false;

    // have we got an explicit block close? if so remove it from the end and remember we need to close up
    if (trimmedContent.length > 1) {
        var lTwo = trimmedContent.substring(trimmedContent.length - 2, trimmedContent.length);
        var closeLength;

        if (lTwo === '\'\'' && scope.hasElementScope('p')) {
            closeUntil = 'p';
            closeLength = 2;
        }
        else if (lTwo === '\"\"' && scope.hasElementScope('blockquote')) {
            closeUntil = 'blockquote';
            closeLength = 2;
        }
        else if (lTwo === '%&' && scope.hasElementScope('ul')) {
            closeUntil = 'ul';
            closeLength = 2;
        }
        else if (lTwo === '%+' && scope.hasElementScope('ol')) {
            closeUntil = 'ol';
            closeLength = 2;
        }
        else
        {
            if(trimmedContent.length > 3){
                var lFour = trimmedContent.substring(trimmedContent.length - 4, trimmedContent.length);
                if (lFour === '$$$$' && scope.inDataBlock()){
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
    if (!localScope.hasCurrentBlock() && (!scope.hasCurrentBlock() || scope.currentBlockElement() === 'blockquote') && trimmedContent.length > 0) {
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
        while (scope.hasCurrentBlock() && scope.currentBlockElement() !== closeUntil) {
            linebuilder.endCurrentScopeWithoutLineBreak(scope);
        }
        linebuilder.endCurrentScopeWithoutLineBreak(scope);
    }

    if (!alreadyEnded) {
        // do the inline!
        linebuilder.addInline(trimmedContent);
        linebuilder.endScope(localScope);
    }
};