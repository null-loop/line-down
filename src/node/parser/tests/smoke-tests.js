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
var h = require("./helpers.js");
var col = require("../lib/collections.js");

exports.describeTests = function(){
    describe('parser',function(){
        describe('parseWithNoOptions()',function(){
            it('Simple heading test',function(done){
                h.assertParseWithNoOptions(assert, '#Heading', '<h1>Heading</h1>', 'Simple heading test');
                done();
            });

            it('Simple paragraph test',function(done){
                h.assertParseWithNoOptions(assert, 'Paragraph', '<p>Paragraph\r\n</p>', 'Simple paragraph test');
                done();
            });

            it('Simple strong test',function(done){
                h.assertParseWithNoOptions(assert, '**Strong**', '<p><strong>Strong</strong>\r\n</p>', 'Simple strong test');
                done();
            });
        });
    });
};

exports.describeTests();