/**
 * Created by Daniel Gray on 08/03/2015.
 */
/**
 * Created by Daniel Gray on 07/03/2015.
 */
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

(function (ld, $, undefined) {

    function splitLines(content)
    {
        var re = /\r\n|\n\r|\n|\r/g;
        var lines = content.replace(re, "\n").split("\n");
        return lines;
    }

    function init(target, onchangeFunc){
        //TODO:Hook up the editor here!
        var jt = $(target);
        jt.bind('input propertychange', function() {
            var linedown = jt.val();
            // update line count
            var lines = splitLines(linedown);
            var lineCount = lines.length;
            // run on the onchangeFunc
            onchangeFunc();
        });
    }

    ld.editor = ld.editor || {};
    ld.editor.init = init;

})(window.linedown = window.linedown || {}, jQuery)
