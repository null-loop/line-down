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
var bb = require('buildbranch');
var wrapper = require('gulp-module-wrapper');
var ugly = require('gulp-uglify');
var run = require('gulp-run');
var gutil = require('gulp-util');
var harp = require('harp');
var jeditor = require("gulp-json-editor");

var masterVersion = p.version;
var parserScriptsRoot = 'src/js/parser/lib/';
var parserScriptsGlob = parserScriptsRoot + '*.js';
var parserTestScriptsGlob = 'src/js/parser/tests/*.js';
var nodeParserLib = 'src/node/parser/lib';
var nodeParserPackageFile = 'src/node/parser/package.json';
var nodeParserTests = 'src/node/parser/tests';
var webParserLib = './www/js/line-down.parser.js';
var harpRoot = 'www';
var harpOutput = 'www/www';
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

gulp.task('updateVersions', function() {
    gulp.src([nodeParserPackageFile]).pipe(jeditor({
        'version':masterVersion
    })).pipe(gulp.dest('src/node/parser'));
});

gulp.task('lint',function(){
    checkParserJs();
});

gulp.task('buildAll',['buildJs','buildWeb'],function(done){
    done();
});

gulp.task('buildJs',function(done){
    checkParserJs();

    // wrap for node
    gulp.src([parserScriptsGlob])
        .pipe(wrapper({type:'commonjs',exports:false}))
        .pipe(ugly())
        .pipe(gulp.dest(nodeParserLib));

    // copy tests for node
    gulp.src([parserTestScriptsGlob])
        .pipe(gulp.dest(nodeParserTests));

    run('browserify ' + parserScriptsRoot + 'parser-www-export.js -o ' + webParserLib).exec('',done);
});

gulp.task('buildWeb',['buildJs'], function(done){
    compileHarp(done);
});

gulp.task('buildWebContent',function(done){
    compileHarp(done);
});

gulp.task('testJs',['testJsParser','testNpmParser'],function(done){
    done();
});

gulp.task('testWeb',['buildWeb'],function(done){
    serveHarp();
    endServeHarp();
    done();
});

gulp.task('testJsParser',['buildJs'],function(done){
    run('mocha src/js/parser/tests/*.js -R dot').exec('',done);
});

gulp.task('testNpmParser',['buildJs','testJsParser'],function(done){
   run('npm test',{cwd:'src/node/parser'}).exec('',done);
});

gulp.task('installAll',['installNpmParser'],function(done){
    done();
});

gulp.task('installNpmParser',function(done){
    run('npm install',{cwd:'src/node/parser'}).exec('',done);
});

gulp.task('testAll',['testJs'], function(done){
    done();
});

gulp.task('gh', function(done){
    // Publish the current www/www to the gh-pages branch
    bb({
        branch:'gh-pages',
        ignore:['.git','node_modules'],
        folder:harpOutput
    }, done);
});