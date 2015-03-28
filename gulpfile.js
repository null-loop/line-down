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

var masterVersion = p.version;
var parserScriptsRoot = 'src/js/parser/lib/';
var parserScriptsGlob = parserScriptsRoot + '*.js';
var parserTestScriptsGlob = 'src/js/parser/tests/*.js';
var parserTestJsonGlob = 'src/tests/*.json';
var nodeParserLib = 'src/node/parser/lib';
var nodeParserPackageFile = 'src/node/parser/package.json';
var nodeParserTests = 'src/node/parser/tests';
var jsParserTests = 'src/js/parser/tests';
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

gulp.task('lint',function(){
    checkParserJs();
});

gulp.task('build-all',['build-js','build-web'],function(done){
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

gulp.task('build-js',['generate-parser-test-cases'],function(done){
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

gulp.task('dist',['clean-dist','build-all'],function(done){
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

gulp.task('install-all',['install-npm-parser'],function(done){
    done();
});

gulp.task('install-npm-parser',function(done){
    run('npm install',{cwd:'src/node/parser'}).exec('',done);
});

gulp.task('test-all',['test-js'], function(done){
    done();
});
