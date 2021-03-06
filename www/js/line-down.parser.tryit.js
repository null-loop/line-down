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

    if ($('#linedownInput').length==0) return;
    function updateFromLinedown(linedown){
        if (!linedown) {
            linedown = $('#linedownInput')[0].value;
        }

        var outputComments = $('#options-outputComments').is(':checked');
        var generateIds = $('#options-generateIds').is(':checked');

        var html ='';
        var startTime = window.performance.now();

        if (outputComments || generateIds)
        {
            html = ld.parser.parseWithOptions(linedown,{
                outputComments:outputComments,
                generateIds:generateIds
            });
        }
        else
        {
            html = ld.parser.parseWithNoOptions(linedown);
        }

        var endTime = window.performance.now();
        var executionTime = Math.floor((endTime - startTime)*1000)/1000;

        $('#linedownOutput').text(html);

        var dom = $(html);
        $('#linedownHtml').empty();
        $('#linedownHtml').append(dom);

        $('#htmlGenerationTime').text('HTML generation took ' + executionTime + "ms");
    }
    updateFromLinedown();

    $('#options-outputComments').change(function(){
        updateFromLinedown();
    });

    $('#options-generateIds').change(function(){
        updateFromLinedown();
    });

    ld.editor.init($('#linedownInput'), updateFromLinedown);

})(window.linedown = window.linedown || {}, jQuery)
