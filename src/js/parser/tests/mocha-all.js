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
var assert = require("assert");
var linedown = require("../lib/parser.js");
var col = require("../lib/collections.js");
var fs = require("fs");
var files = fs.readdirSync('./');
var jsonFiles = [];

if (col.contains(files,'bin'))
{
    files = fs.readdirSync('./tests');
}

var objectLookup = {
    "parser":"parser"
};

var methodLookup = {
    "parse-no-options":"parseWithNoOptions",
    "parse-default-options":"parseWithDefaultOptions",
    "parse-options":"parseWithOptions"
};

var methodRunnerLookup = {
    "parser.parseWithNoOptions":function(testCase){
        var input = testCase.i;
        var expectedOutput = testCase.o;
        var testCaseName = testCase.n;
        var actualOutput = linedown.parser.parseWithNoOptions(input);
        if (actualOutput!==expectedOutput)
        {
            assert.fail(actualOutput, expectedOutput,testCaseName,"==");
        }
        else
        {
            assert.equal(actualOutput, expectedOutput, testCaseName);
        }
    },
    "parser.parseWithOptions":function(testCase){
        var input = testCase.i;
        var expectedOutput = testCase.o;
        var testCaseName = testCase.n;
        var options = testCase.opt;
        var actualOutput = linedown.parser.parseWithOptions(input,options);
        if (actualOutput!==expectedOutput)
        {
            assert.fail(actualOutput, expectedOutput,testCaseName,"==");
        }
        else
        {
            assert.equal(actualOutput, expectedOutput, testCaseName);
        }
    }
};

function lookupObject(objectName)
{
    return objectLookup[objectName];
}

function lookupMethod(methodName)
{
    return methodLookup[methodName];
}

function runMethod(fullName, testCase)
{
    var mf = methodRunnerLookup[fullName];
    mf(testCase);
}

// look for .json files in our directory
col.each(files,function(k,v){
    var l = v.length;
    if (l > 14)
    {
        var e = v.substring(l - 14, l);
        if (e.toLocaleLowerCase()==='test-sets.json')
        {
            jsonFiles.push(v);
        }
    }
});

// for each json file we need to describe to mocha the tests contained within...
col.each(jsonFiles,function(k,testFile)
{
    var json = require('./' + testFile);
    var testFileName = json.name;
    var testFileObject = json.object;
    var targetObject = lookupObject(testFileObject);
    var testSets = json.testSets;

    describe(targetObject, function(){
        col.each(testSets,function(k,testSet){

            var testSetName = testSet.name;
            var testSetMethod = testSet.method;
            var testCases = testSet.testCases;
            var targetMethod = lookupMethod(testSetMethod);

            describe(targetMethod,function(){
                col.each(testCases, function(k,testCase){
                    var fullName = targetObject + "." + targetMethod;
                    it('should handle the case \'' + testCase.n + '\'',function(){
                        runMethod(fullName, testCase);
                    });
                });
            });


        });
    });


});

