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

var gutil = require("gulp-util");
var fs = require("fs");
var templates = require("./test-generator-templates.json");
var col = require("../js/parser/lib/collections.js");

function exportJsonResult(sg, targetFile){
    var s = sg();
    var json = JSON.stringify(s,null,'  ');
    fs.writeFile(targetFile, json);
}

function replaceAll(find, replace, str) {
    return str.replace(new RegExp(find, 'g'), replace);
}

function generateInlineTestCasesForSpec(s, allInlineSpecs){
    var g = generateSimpleOneLineImplicitParagraphWithNestedOpenInlineSpecTestCase;
    var cases = [];
    var generating = true;
    var n = [];
    var originalNests = allInlineSpecs.slice(0);
    // remove ourselves
    var ourIndex = originalNests.indexOf(s);
    if (ourIndex > -1){
        originalNests.splice(ourIndex,1);
    }
    var forwards = true;
    var remainingNests = originalNests.slice(0);

    while(generating){

        cases.push(g('##Inline', '<p><##>Inline</##>\r\n</p>','Inline ## taking up whole line with no spaces',s,n));
        cases.push(g('\r\n##Inline', '<p><##>Inline</##>\r\n</p>','Inline ## taking up whole line with no spaces and leading empty line',s,n));
        cases.push(g('\r\n\r\n##Inline', '<p><##>Inline</##>\r\n</p>','Inline ## taking up whole line with no spaces and two leading empty line',s,n));
        cases.push(g('\r\n\r\n\r\n##Inline', '<p><##>Inline</##>\r\n</p>','Inline ## taking up whole line with no spaces and three leading empty line',s,n));
        cases.push(g('##Inline\r\n', '<p><##>Inline</##>\r\n</p>','Inline ## taking up whole line with no spaces and trailing line',s,n));
        cases.push(g('##Inline\r\n\r\n', '<p><##>Inline</##>\r\n</p>','Inline ## taking up whole line with no spaces and two trailing lines',s,n));
        cases.push(g('##Inline\r\n\r\n\r\n', '<p><##>Inline</##>\r\n</p>','Inline ## taking up whole line with no spaces and three trailing lines',s,n));
        cases.push(g('\r\n##Inline\r\n', '<p><##>Inline</##>\r\n</p>','Inline ## taking up whole line with no spaces and leading and trailing line',s,n));
        cases.push(g('\r\n\r\n##Inline\r\n\r\n', '<p><##>Inline</##>\r\n</p>','Inline ## taking up whole line with no spaces and two leading trailing lines',s,n));
        cases.push(g('\r\n\r\n\r\n##Inline\r\n\r\n\r\n', '<p><##>Inline</##>\r\n</p>','Inline ## taking up whole line with no spaces and three leading and trailing lines',s,n));
        cases.push(g(' ##Inline', '<p><##>Inline</##>\r\n</p>','Inline ## taking up whole line with leading space',s,n));
        cases.push(g('\t##Inline', '<p><##>Inline</##>\r\n</p>','Inline ## taking up whole line with leading tab',s,n));
        cases.push(g('   ##Inline', '<p><##>Inline</##>\r\n</p>','Inline ## taking up whole line with leading spaces',s,n));
        cases.push(g('\t\t##Inline', '<p><##>Inline</##>\r\n</p>','Inline ## taking up whole line with two leading tabs',s,n));

        cases.push(g('##Inline ', '<p><##>Inline</##>\r\n</p>','Inline ## taking up whole line with trailing space',s,n));
        cases.push(g('##Inline\t', '<p><##>Inline</##>\r\n</p>','Inline ## taking up whole line with trailing tab',s,n));
        cases.push(g(' ##Inline ', '<p><##>Inline</##>\r\n</p>','Inline ## taking up whole line with trailing space and leading space',s,n));
        cases.push(g(' ##Inline\t', '<p><##>Inline</##>\r\n</p>','Inline ## taking up whole line with trailing tab and leading space',s,n));
        cases.push(g('   ##Inline ', '<p><##>Inline</##>\r\n</p>','Inline ## taking up whole line with trailing space and leading spaces',s,n));
        cases.push(g('   ##Inline\t', '<p><##>Inline</##>\r\n</p>','Inline ## taking up whole line with trailing tab and leading spaces',s,n));

        cases.push(g('##Inline  ', '<p><##>Inline</##>\r\n</p>','Inline ## taking up whole line with trailing spaces',s,n));
        cases.push(g('##Inline\t\t', '<p><##>Inline</##>\r\n</p>','Inline ## taking up whole line with trailing tabs',s,n));
        cases.push(g(' ##Inline  ', '<p><##>Inline</##>\r\n</p>','Inline ## taking up whole line with trailing and leading space',s,n));
        cases.push(g('\t##Inline\t\t', '<p><##>Inline</##>\r\n</p>','Inline ## taking up whole line with trailing and leading tab',s,n));
        cases.push(g('   ##Inline  ', '<p><##>Inline</##>\r\n</p>','Inline ## taking up whole line with trailing and leading spaces',s,n));
        cases.push(g('\t\t##Inline\t\t', '<p><##>Inline</##>\r\n</p>','Inline ## taking up whole line with trailing and leading tabs and spaces',s,n));
        cases.push(g('\t \t##Inline\t \t', '<p><##>Inline</##>\r\n</p>','Inline ## taking up whole line with trailing and leading tabs and spaces',s,n));
        cases.push(g(' \t \t ##Inline \t \t ', '<p><##>Inline</##>\r\n</p>','Inline ## taking up whole line with trailing and leading tabs and spaces in interlace',s,n));
        cases.push(g('\r\n \t \t ##Inline \t \t ', '<p><##>Inline</##>\r\n</p>','Inline ## taking up whole line with trailing and leading tabs and spaces in interlace with leading empty line',s,n));
        cases.push(g('\r\n \t \t ##Inline \t \t \r\n', '<p><##>Inline</##>\r\n</p>','Inline ## taking up whole line with trailing and leading tabs and spaces in interlace with leading and trailing empty line',s,n));
        cases.push(g('\r\n\r\n \t \t ##Inline \t \t \r\n\r\n', '<p><##>Inline</##>\r\n</p>','Inline ## taking up whole line with trailing and leading tabs and spaces in interlace with leading and trailing empty lines',s,n));

        cases.push(g('##?me Inline', '<p><## id=\'me\'> Inline</##>\r\n</p>','Inline ## with open id spec taking up whole line with space preserved',s,n));
        cases.push(g('##?me@classy Inline', '<p><## id=\'me\' class=\'classy\'> Inline</##>\r\n</p>','Inline ## with open id & CSS spec taking up whole line with space preserved',s,n));
        cases.push(g('##?me@classy&trash Inline', '<p><## id=\'me\' class=\'classy trash\'> Inline</##>\r\n</p>','Inline ## with open id & multiple CSS spec taking up whole line with space preserved',s,n));
        cases.push(g('##@classy?me Inline', '<p><## id=\'me\' class=\'classy\'> Inline</##>\r\n</p>','Inline ## with open CSS & id spec taking up whole line with space preserved',s,n));
        cases.push(g('##@classy&trash?me Inline', '<p><## id=\'me\' class=\'classy trash\'> Inline</##>\r\n</p>','Inline ## with open multiple CSS & id spec taking up whole line with space preserved',s,n));
        cases.push(g('##?me@@btn-large Inline', '<p><## id=\'me\' class=\'btn btn-large\'> Inline</##>\r\n</p>','Inline ## with open id & base CSS spec taking up whole line with space preserved',s,n));
        cases.push(g('##@@btn-large?me Inline', '<p><## id=\'me\' class=\'btn btn-large\'> Inline</##>\r\n</p>','Inline ## with open base & id CSS spec taking up whole line with space preserved',s,n));
        cases.push(g('##?me@@btn-large&trash Inline', '<p><## id=\'me\' class=\'btn btn-large trash\'> Inline</##>\r\n</p>','Inline ## with open id & base multiple CSS spec taking up whole line with space preserved',s,n));
        cases.push(g('##@@trash&btn-large?me Inline', '<p><## id=\'me\' class=\'btn trash btn-large\'> Inline</##>\r\n</p>','Inline ## with open base multiple CSS spec & id spec taking up whole line with space preserved',s,n));
        cases.push(g('##@@label-trash&btn-large?me Inline', '<p><## id=\'me\' class=\'label btn label-trash btn-large\'> Inline</##>\r\n</p>','Inline ## with open multiple base CSS spec & id spec taking up whole line with space preserved',s,n));
        cases.push(g('##@@label-error&label-trash&btn-large?me Inline', '<p><## id=\'me\' class=\'label btn label-error label-trash btn-large\'> Inline</##>\r\n</p>','Inline ## with open multiple (two same base) base CSS spec & id spec taking up whole line with space preserved',s,n));
        cases.push(g('##@@btn-once&label-error&label-trash&btn-large?me Inline', '<p><## id=\'me\' class=\'btn label btn-once label-error label-trash btn-large\'> Inline</##>\r\n</p>','Inline ## with open multiple (two same base, another two same different base - mixed orders) base CSS spec & id spec taking up whole line with space preserved',s,n));
        cases.push(g('##?me@classy$spec=test Inline', '<p><## id=\'me\' class=\'classy\' data-spec=\'test\'> Inline</##>\r\n</p>','Inline ## with open id, CSS & data spec taking up whole line with space preserved',s,n));
        cases.push(g('##@classy$spec=test?me Inline', '<p><## id=\'me\' class=\'classy\' data-spec=\'test\'> Inline</##>\r\n</p>','Inline ## with open CSS, data & id spec taking up whole line with space preserved',s,n));
        cases.push(g('##$spec=test@classy?me Inline', '<p><## id=\'me\' class=\'classy\' data-spec=\'test\'> Inline</##>\r\n</p>','Inline ## with open data, CSS & id spec taking up whole line with space preserved',s,n));
        cases.push(g('##?me? Inline', '<p><## id=\'me\'> Inline</##>\r\n</p>','Inline ## with closed id spec taking up whole line with space preserved',s,n));
        cases.push(g('##?me?@classy@ Inline', '<p><## id=\'me\' class=\'classy\'> Inline</##>\r\n</p>','Inline ## with closed id & CSS spec taking up whole line with space preserved',s,n));
        cases.push(g('##@classy@?me? Inline', '<p><## id=\'me\' class=\'classy\'> Inline</##>\r\n</p>','Inline ## with closed CSS & id spec taking up whole line with space preserved',s,n));
        cases.push(g('##?me?@@btn-large@ Inline', '<p><## id=\'me\' class=\'btn btn-large\'> Inline</##>\r\n</p>','Inline ## with closed id & base CSS spec taking up whole line with space preserved',s,n));
        cases.push(g('##@@btn-large@?me? Inline', '<p><## id=\'me\' class=\'btn btn-large\'> Inline</##>\r\n</p>','Inline ## with closed base & id CSS spec taking up whole line with space preserved',s,n));
        cases.push(g('##?me?@@btn-large&trash@ Inline', '<p><## id=\'me\' class=\'btn btn-large trash\'> Inline</##>\r\n</p>','Inline ## with closed id & base multiple CSS spec taking up whole line with space preserved',s,n));
        cases.push(g('##@@trash&btn-large@?me? Inline', '<p><## id=\'me\' class=\'btn trash btn-large\'> Inline</##>\r\n</p>','Inline ## with closed base multiple CSS spec & id spec taking up whole line with space preserved',s,n));
        cases.push(g('##@@label-trash&btn-large@?me? Inline', '<p><## id=\'me\' class=\'label btn label-trash btn-large\'> Inline</##>\r\n</p>','Inline ## with closed multiple base CSS spec & id spec taking up whole line with space preserved',s,n));
        cases.push(g('##@@label-error&label-trash&btn-large@?me? Inline', '<p><## id=\'me\' class=\'label btn label-error label-trash btn-large\'> Inline</##>\r\n</p>','Inline ## with closed multiple (two same base) base CSS spec & id spec taking up whole line with space preserved',s,n));
        cases.push(g('##@@btn-once&label-error&label-trash&btn-large@?me? Inline', '<p><## id=\'me\' class=\'btn label btn-once label-error label-trash btn-large\'> Inline</##>\r\n</p>','Inline ## with closed multiple (two same base, another two same different base - mixed orders) base CSS spec & id spec taking up whole line with space preserved',s,n));
        cases.push(g('##?me?@classy@$spec=test$ Inline', '<p><## id=\'me\' class=\'classy\' data-spec=\'test\'> Inline</##>\r\n</p>','Inline ## with closed id, CSS & data spec taking up whole line with space preserved',s,n));
        cases.push(g('##@classy@$spec=test$?me? Inline', '<p><## id=\'me\' class=\'classy\' data-spec=\'test\'> Inline</##>\r\n</p>','Inline ## with closed CSS, data & id spec taking up whole line with space preserved',s,n));
        cases.push(g('##$spec=test$@classy@?me? Inline', '<p><## id=\'me\' class=\'classy\' data-spec=\'test\'> Inline</##>\r\n</p>','Inline ## with closed data, CSS & id spec taking up whole line with space preserved',s,n));

        cases.push(g('##?me?Inline', '<p><## id=\'me\'>Inline</##>\r\n</p>','Inline ## with closed id spec taking up whole line with space collapsed',s,n));
        cases.push(g('##?me?@classy@Inline', '<p><## id=\'me\' class=\'classy\'>Inline</##>\r\n</p>','Inline ## with closed id & CSS spec taking up whole line with space collapsed',s,n));
        cases.push(g('##@classy@?me?Inline', '<p><## id=\'me\' class=\'classy\'>Inline</##>\r\n</p>','Inline ## with closed CSS & id spec taking up whole line with space collapsed',s,n));
        cases.push(g('##?me?@@btn-large@Inline', '<p><## id=\'me\' class=\'btn btn-large\'>Inline</##>\r\n</p>','Inline ## with closed id & base CSS spec taking up whole line with space collapsed',s,n));
        cases.push(g('##@@btn-large@?me?Inline', '<p><## id=\'me\' class=\'btn btn-large\'>Inline</##>\r\n</p>','Inline ## with closed base & id CSS spec taking up whole line with space collapsed',s,n));
        cases.push(g('##?me?@classy@$spec=test$Inline', '<p><## id=\'me\' class=\'classy\' data-spec=\'test\'>Inline</##>\r\n</p>','Inline ## with closed id, CSS & data spec taking up whole line with space collapsed',s,n));
        cases.push(g('##@classy@$spec=test$?me?Inline', '<p><## id=\'me\' class=\'classy\' data-spec=\'test\'>Inline</##>\r\n</p>','Inline ## with closed CSS, data & id spec taking up whole line with space collapsed',s,n));
        cases.push(g('##$spec=test$@classy@?me?Inline', '<p><## id=\'me\' class=\'classy\' data-spec=\'test\'>Inline</##>\r\n</p>','Inline ## with closed data, CSS & id spec taking up whole line with space collapsed',s,n));

        if (remainingNests.length == 0 && forwards){
            forwards = false;
            remainingNests = originalNests.slice(0);
            remainingNests.reverse();
            n = [];
        }
        if (remainingNests.length > 0){
            var nextNest = remainingNests.pop();
            n.push(nextNest);
        }
        else if (remainingNests.length == 0){
            generating = false;
        }
    }

    return cases;
}

function generateSimpleOneLineImplicitParagraphWithNestedOpenInlineSpecTestCase(input,output,name,spec,nestedSpecs){

    if (nestedSpecs && nestedSpecs.length > 0){
        var nestedPrefix ='';
        col.each(nestedSpecs,function(k,v){nestedPrefix=nestedPrefix+v.spec});
        input = replaceAll('##',nestedPrefix+spec.spec,input);
        output = replaceAll('##',spec.element,output);
        var nestedStartHtml = '';
        var nestedEndHtml = '';
        col.each(nestedSpecs,function(k,v){
            nestedStartHtml=nestedStartHtml+"<"+ v.element + ">";
            nestedEndHtml="</"+ v.element + ">" + nestedEndHtml;
        });
        output = replaceAll('<p>','<p>' + nestedStartHtml,output);
        output = replaceAll('</' + spec.element + '>\r\n</p>','</' + spec.element + '>' + nestedEndHtml + '\r\n</p>',output);
        var nestedName = '';

        col.each(nestedSpecs,function(k,v){
           nestedName = ', nested in a ' + v.name + nestedName;
        });
        name = replaceAll('##',spec.name,name) + nestedName;

    }
    else{
        input = replaceAll('##',spec.spec,input);
        output = replaceAll('##',spec.element,output);
        name = replaceAll('##',spec.name,name);
    }
    return{
        n:name,
        i:input,
        o:output
    }
}

module.exports.generateInlineSpecTestSetsFile = function(inlineSpecs, targetFile){
    col.each(inlineSpecs,function(k,spec){
        var myFile = replaceAll('\\*',spec.element,targetFile);
        exportJsonResult(function(){
            var sets = {
                name:"Test inline specs",
                object:"parser",
                testSets:[]
            };
            var testSet = {
                name:"Test " + spec.name + " inline specification",
                method:"parse-no-options",
                testCases:generateInlineTestCasesForSpec(spec, inlineSpecs)
            };
            sets.testSets.push(testSet);
            gutil.log('Writing inline spec tests for ' + spec.element + ' to ' + myFile);
            return sets;
        },myFile);
    });
};