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
var lb = require('./linebuilder.js');
var lp = require('./lineprocessor.js');
var fnc = {
    startsWith:require('./startswith.js').startsWith,
    createScope:require('./scope.js').createScope
};

function parseWithNoOptions(linedownContent) {
    return parseWithOptions(linedownContent, {});
}
function parseWithOptions(linedownContent, options) {
    var re = /\r\n|\n\r|\n|\r/g;

    var lines = linedownContent.replace(re, "\n").split("\n");
    var lineIndex = 0;
    var newScope = fnc.createScope();
    var lineBuilder = lb.createBuilder(options, newScope);

    while (lineIndex < lines.length) {
        var lineText = lines[lineIndex];
        lp.processLine(lineText, newScope, lineBuilder);
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

exports.parser = { version : '0.0.6' };

exports.parser.parseWithNoOptions = function(linedownContent){
    return parseWithNoOptions(linedownContent);
};

exports.parser.defaultOptions = {
    idWhitelist:undefined,
    cssWhitelist:undefined,
    idBlacklist:undefined,
    cssBlacklist:undefined,
    deprecatedTags:[
        {tag:"u",class:"underline"},
        {tag:"strike",class:"strikethrough"}
    ]
};

exports.parser.parseWithDefaultOptions = function(linedownContent){
    return parseWithOptions(linedownContent, exports.parser.defaultOptions);
};

exports.parser.parseWithOptions = function(linedownContent, options){
    return parseWithOptions(linedownContent, options);
};