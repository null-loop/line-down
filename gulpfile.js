//TODO:https://github.com/travis-ci/travis-ci/issues/538
//TODO:Get travis to build the .net projects
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
var p = require('./package.json');
var gulp = require('gulp');
var jshint = require('gulp-jshint');
var run = require('gulp-run');
var gutil = require('gulp-util');
var harp = require('harp');
var jeditor = require("gulp-json-editor");
var testGen = require("./src/tests/test-generator.js");
var fs = require("fs");
var msbuild = require("gulp-msbuild");
var col = require("./src/js/parser/lib/collections.js");
var masterVersion = p.version;
var parserScriptsRoot = 'src/js/parser/lib/';
var parserScriptsGlob = parserScriptsRoot + '*.js';
var parserTestScriptsGlob = 'src/js/parser/tests/*.js';
var parserTestJsonGlob = 'src/tests/*.json';
var nodeParserLib = 'src/node/parser/lib';
var nodeParserPackageFile = 'src/node/parser/package.json';
var nodeParserTests = 'src/node/parser/tests';
var jsParserTests = 'src/js/parser/tests';
var netParserTests = 'src/net/Tests/line-down.Tests.Parser/test-case-data';
var netParserTestProject = 'src/net/Tests/line-down.Tests.Parser/line-down.Tests.Parser.csproj';
var oldNetParserTests = 'src/net/Tests/line-down.Tests.Parser/test-case-data/*.json';
var webParserLib = './www/js/line-down.parser.js';
var harpRoot = 'www';
var webTestCases = 'www/test/cases';
var harpOutput = 'www/www';
var distDir = 'dist/' + masterVersion;
var _hs;

function checkParserJs(){
    gulp.src([parserScriptsGlob])
        .pipe(jshint())
        .pipe(jshint.reporter('default'))
        .pipe(jshint.reporter('fail'));
}

function compileHarp(done){
    harp.compile(harpRoot , undefined ,done);
}

function serveHarp(){
    gutil.log('Starting Harp on port 9000');
    _hs = harp.server(harpRoot, {port:9000});
}

function endServeHarp(){
    if(_hs){
        gutil.log('Closing Harp');
        _hs.close();
    }
}

gulp.task('update-versions', function() {
    gulp.src([nodeParserPackageFile]).pipe(jeditor({
        'version':masterVersion
    })).pipe(gulp.dest('src/node/parser'));
});

gulp.task('lint-js',function(){
    checkParserJs();
});

gulp.task('build-all',['build-js','build-dot-net','build-web'],function(done){
    done();
});

function generateParserTestCases()
{
    testGen.generateInlineSpecTestSetsFile([
        {spec:'**',element:'strong',name:'strong',preserveWhiteSpace:true},
        {spec:'//',element:'em',name:'emphasis',preserveWhiteSpace:true},
        {spec:'__',element:'u',name:'underline',preserveWhiteSpace:true},
        {spec:'^^',element:'sup',name:'superscript',preserveWhiteSpace:true},
        {spec:'!!',element:'sub',name:'subscript',preserveWhiteSpace:true},
        {spec:'>>',element:'small',name:'small',preserveWhiteSpace:true},
        {spec:'::',element:'code',name:'code',preserveWhiteSpace:true},
        {spec:'``',element:'span',name:'span',preserveWhiteSpace:true},
        {spec:'~~',element:'strike',name:'strike through',preserveWhiteSpace:true}
    ], './src/tests/*-generated-test-sets.json');
}

gulp.task('generate-parser-test-cases',function(done){
    generateParserTestCases();
    done();
});

gulp.task('build-dot-net',['inject-dot-net-test-cases'],function(done){
    return gulp.src("./src/net/line-down.sln").pipe(msbuild());
});

function getJsonFiles(directory)
{
    // find all the json files
    var files = fs.readdirSync(directory);
    var jsonFiles =[];
    col.each(files,function(k,v){
        if (v.length > 5)
        {
            var e = v.substring(v.length - 5);
            if (e.toLocaleLowerCase()==='.json')
            {
                jsonFiles.push(v);
            }
        }
    });
    return jsonFiles;
}

function generateInjected(allCsFiles){
    var output = [];
    col.each(allCsFiles,function(k,j){
        // <Compile Include="
        output.push('\t<Compile Include="test-case-data\\' + j + '" />');
    });
    return output;
}

function generateCsFilesFromJsonFiles(allJsonFiles){
    var output = [];
    col.each(allJsonFiles,function(k,v){
        // load the json
        var jsonObj = require('./src/net/Tests/line-down.Tests.Parser/test-case-data/' + v);
        // generate the CS output from the test cases
        var csContent = generateCsContent(jsonObj,v);
        // write it
        var sName = v + ".Generated.cs";
        var csFile = './src/net/Tests/line-down.Tests.Parser/test-case-data/' + sName;
        fs.writeFileSync(csFile, csContent);
        // push the file name onto output
        output.push(sName);
    });
    return output;
}

function generateCsContent(jsonObj,fileName){
    var namespaces = ["System","System.Collections.Generic","System.IO","System.Linq","System.Reflection",
                      "System.Text","System.Threading.Tasks","FluentAssertions","NUnit.Framework","line_down.Parser.Core"];

    var namespaceHeader = '';

    col.each(namespaces,function(k,n){
       namespaceHeader=namespaceHeader+"using " + n + ";\r\n";
    });

    var namespaceDeclaration = "namespace line_down.Tests.Parser.DataDriven {\r\n";

    var csContent = namespaceHeader + "\r\n" + namespaceDeclaration + "\r\n}";

    return csContent;
}

function injectJsonTestCases()
{
    var allJson = getJsonFiles(netParserTests);
    var allCsFiles = generateCsFilesFromJsonFiles(allJson);
    var csProj = fs.readFileSync(netParserTestProject, {encoding:'utf8'});
    var re = /\r\n|\n\r|\n|\r/g;

    var csProjLines = csProj.replace(re, "\n").split("\n");
    var newCsProjLines = [];
    var injectedJson = false;
    col.each(csProjLines,function(k,line){
        var trimmed = line.trim();
        if (trimmed.length === 0) {
            newCsProjLines.push('');
        } else if (trimmed.length > 32) {
            var last = trimmed.substring(trimmed.length-9);
            if (trimmed.substring(0,32)==='<Compile Include="test-case-data'){
                // ignore this line
                if (!injectedJson){
                    var injected = generateInjected(allCsFiles);
                    col.each(injected, function(ki,injectedLine){
                       newCsProjLines.push(injectedLine);
                    });
                    injectedJson = true;
                }
            }
            else if (trimmed.substring(0,18)==='<Compile Include="'){
                if (!injectedJson){
                    var injected = generateInjected(allJson);
                    col.each(injected, function(ki,injectedLine){
                        newCsProjLines.push(injectedLine);
                    });
                    injectedJson = true;
                }
                newCsProjLines.push(line);
            }
            else {
                newCsProjLines.push(line);
            }
        }
        else {
            newCsProjLines.push(line);
        }
    });

    fs.writeFileSync(netParserTestProject, newCsProjLines.join('\r\n'));
}

gulp.task('inject-dot-net-test-cases',['generate-parser-test-cases'],function(done){
    gulp.src([parserTestJsonGlob])
        .pipe(gulp.dest(netParserTests));
    injectJsonTestCases();
    done();
});

gulp.task('build-js',['lint-js','generate-parser-test-cases'],function(done){
    checkParserJs();

    // wrap for node
    gulp.src([parserScriptsGlob])
        .pipe(gulp.dest(nodeParserLib));

    // copy json for js
    gulp.src([parserTestJsonGlob])
        .pipe(gulp.dest(jsParserTests));

    // copy json for node
    gulp.src([parserTestJsonGlob])
        .pipe(gulp.dest(nodeParserTests));

    // copy tests for node
    gulp.src([parserTestScriptsGlob])
        .pipe(gulp.dest(nodeParserTests));

    // browersify for the web
    run('browserify ' + parserScriptsRoot + 'parser-www-export.js -o ' + webParserLib).exec('',done);
});

gulp.task('build-web',['build-js'], function(done){
    compileHarp(done);
});

gulp.task('test-js',['test-js-parser','test-npm-parser'],function(done){
    done();
});

gulp.task('test-web',['build-web'],function(done){
    serveHarp();
    endServeHarp();
    done();
});

gulp.task('clean-dist',function(done){
    if (fs.existsSync(distDir)) {
        fs.rmdirSync(distDir);
    }
   done();
});

gulp.task('dist',['update-versions','clean-dist','build-all'],function(done){
    if (!fs.existsSync('dist')) {
        fs.mkdirSync('dist');
    }
    fs.mkdirSync(distDir);
    // build a distribution package - dist/masterVersion
    // of
    // changelog
    // readme
    // license
    // /www - web version
    // /npm - npm version
    // /tests - test cases
    // /doc - documentation & specification
});


//gulp.task('testJsParser',['testJsParserNoCoverage'],function(done){
    //--reporter mocha-lcov-reporter > ./artifacts/parser-testscases-coverage.js
//    run('mocha mocha-all.js --require blanket',
//        {cwd:'src/js/parser/tests'}).exec('',done);
//});

gulp.task('test-js-parser',['build-js'],function(done){
    run('mocha mocha-all.js -R dot',
        {cwd:'src/js/parser/tests'}).exec('',done);
});

gulp.task('test-npm-parser',['build-js','test-js-parser'],function(done){
   run('npm test',{cwd:'src/node/parser'}).exec('',done);
});

gulp.task('install-all',['install-npm-parser','install-gulp-line-down','install-dot-net-parser'],function(done){
    done();
});

gulp.task('install-npm-parser',function(done){
    run('npm install',{cwd:'src/node/parser'}).exec('',done);
});

gulp.task('install-gulp-line-down',function(done){
    run('npm install',{cwd:'src/node/gulp-line-down'}).exec('',done);
});

gulp.task('install-dot-net-parser',function(done){
    //TODO:Hook nuget!
});

gulp.task('test-all',['test-js','test-web'], function(done){
    done();
});
