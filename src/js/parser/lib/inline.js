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
var col = require("./collections.js");
var fnc = {
    startsWith:require('./startswith.js').startsWith,
    createScope:require('./scope.js').createScope
};
var he = require('he');

exports.inlineSpecs = [
    { prefix:'**', element:'strong' },
    { prefix:'//', element:'em' },
    { prefix:'__', element:'u' },
    { prefix:'^^', element:'sup' },
    { prefix:'!!', element:'sub' },
    { prefix:'>>', element:'small' },
    { prefix:'::', element:'code' },
    { prefix:'``', element:'span' },
    { prefix:'~~', element:'strike' },
];

exports.replaceInline = function (content, linebuilder){
    var cLine = content;
    var oLine = '';
    var scope = fnc.createScope();
    var started = false;
    var startElement = '';
    var startSpec = '';
    var startElementId;
    var startElementClasses;
    var startElementData;
    var closeElement = '';
    var remainder = '';
    started = false;

    var h = function(k,spec){
        if (started) return;
        var sw = fnc.startsWith(spec.prefix[0], cLine, spec.prefix.length, true);
        if (sw.startsWith && !scope.hasElementScope(spec.element))
        {
            started = true;
            startElement = spec.element;
            startSpec = spec.prefix;
            startElementId = sw.id;
            startElementClasses = sw.classes;
            startElementData = sw.dataPairs;
            remainder = sw.remainingLine;
        }
        else if (sw.startsWith)
        {
            closeElement = spec.element;
            remainder = sw.remainingLine;
        }
    };

    while (cLine.length > 0){
        startElement = '';
        startSpec = '';
        startElementId = '';
        startElementClasses = '';
        startElementData = '';
        closeElement = '';
        remainder = '';
        started = false;
        col.each(exports.inlineSpecs, h);

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
            while (scope.hasCurrentBlock() && scope.currentBlockElement() !== closeElement) {
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