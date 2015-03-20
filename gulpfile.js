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
var watch = require('gulp-watch');
var jshint = require('gulp-jshint');
var bb = require('buildbranch');
var wrapper = require('gulp-module-wrapper');
var harp = require('harp');
var ugly = require('gulp-uglify');
var run = require('gulp-run');
var gutil = require('gulp-util');

var parserScriptsGlob = 'src/js/parser/lib/*.js';
var parserTestScriptsGlob = 'src/js/parser/tests/*.js';
var nodeParserLib = 'src/node/parser/lib';
var nodeParserTests = 'src/node/parser/tests';
var webParserLib = 'www/js/parser';

var Logger = require("./logger.js");


gulp.task('updateVersions', function() {

});

gulp.task('lint',function(){
    checkParserJs();
});

function checkParserJs(){
    gulp.src([parserScriptsGlob])
        .pipe(jshint())
        .pipe(jshint.reporter('default'))
        .pipe(jshint.reporter('fail'));
}

gulp.task('buildAll',['buildJs','buildWeb'],function(){

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

    // wrap for web
    gulp.src([parserScriptsGlob])
        .pipe(wrapper({type:'amd',exports:false}))
        .pipe(ugly())
        .pipe(gulp.dest(webParserLib));

    done();
});

gulp.task('buildWeb',['buildJs'], function(done){
    done();
});

gulp.task('testJs',['testJsParser'],function(done){
    done();
});

gulp.task('testWeb',['buildWeb'],function(done){
    done();
});

gulp.task('testJsParser',['buildJs'],function(done){
    run('mocha src/js/parser/tests/*.js -R dot').exec('',done);
});

gulp.task('testAll',['buildAll','testJs'], function(done){
    done();
});

gulp.task('gh',['buildWeb'], function(done){
    //

    // Publish to the gh-pages branch
    bb({
        branch:'gh-pages',
        ignore:['.git','node_modules'],
        folder:'www'
    }, done);
});