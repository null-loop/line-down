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
var he = require('he');

exports.replaceInline = function (content, linebuilder){
    var cLine = content;
    var oLine = '';
    var scope = fnc.createScope();
    while (cLine.length > 0){

        var startElement = '';
        var startSpec = '';
        var startElementId;
        var startElementClasses;
        var startElementData;
        var closeElement = '';
        var remainder;

        var strong = fnc.startsWith('*',cLine,2,true);
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
            var emphasis = fnc.startsWith('/',cLine,2,true);
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
                var underline = fnc.startsWith('_',cLine,2,true);
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
                    var superscript = fnc.startsWith('^',cLine,2,true);
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
                        var small = fnc.startsWith('>',cLine,2,true);
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
                            var strike = fnc.startsWith('~',cLine,2,true);
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
                                var subscript = fnc.startsWith('!',cLine,2,true);
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
                                    var code = fnc.startsWith(':',cLine,2,true);
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
                                        var span = fnc.startsWith('`',cLine,2,true);
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
};