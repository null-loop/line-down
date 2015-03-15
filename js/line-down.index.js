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

    ld.showTestsForSpecs = function(){
        var specItems = $('[data-spec]');
        var specSections = $('[data-spec-section]');
        var warn = 10;
        var ok = 20;
        var good = 50;

        $.each(specItems,function(k,specItem){
            var id = $(specItem).data('spec');
            var specItemTests = [];
            $.each(linedown.testCases,function(tk,testCase){
                if (testCase.s){
                    var ms = ld.contains(testCase.s,id);
                    if(ms){
                        specItemTests.push(testCase);
                    }
                }
            })
            var cssClass = 'danger';
            var l = specItemTests.length;
            var s = l == 1 ? '' : 's';
            if (l >= warn && l < ok) cssClass = 'warning';
            else if (l >= ok && l < good) cssClass='info';
            else if (l >= good) cssClass = 'success';
            var html = '<span class=\'label label-' + cssClass + ' test\'>' + l + ' test' + s + '</span>';
            //TODO:attach specs!?
            if ($(specItem).prop("tagName")=="TR")
            {
                $(specItem).find("td").last().prepend($(html));
            }
            else
            {
                $(specItem).prepend($(html));
            }
        });

        $.each(specSections,function(k,specSection){
            var id = $(specSection).data('spec-section');
            var specSectionTests = [];
            $.each(linedown.testCases,function(tk,testCase){
                var hasCase=false;
                if (testCase.s){
                    $.each(testCase.s, function(sk,spec){
                        if (spec.length >= id.length)
                        {
                            var s = spec.substring(0, id.length);
                            if (s==id) hasCase = true;
                        }
                    });
                }
                if (hasCase){
                    specSectionTests.push(testCase);
                }
            });
            var l = specSectionTests.length;
            var s = l == 1 ? '' : 's';
            var cssClass = 'danger';
            var html = '<span class=\'label label-' + cssClass + ' testSection\'>' + l + ' test' + s + '</span>';

            $(specSection).prepend($(html));


        });

        //TODO:Wire in spec-section as sum
    };


    /*
    ld.hideTestsForSpecs = function(){
        $('.test').remove();
        $('.testSection').remove();

    };

    var showTestConnectionsButton = $('#showTestConnectionsButton');
    var hideTestConnectionsButton = $('#hideTestConnectionsButton');

    showTestConnectionsButton.click(function(){
        ld.showTestsForSpecs();
        showTestConnectionsButton.addClass('disabled');
        hideTestConnectionsButton.removeClass('disabled');
    });

    hideTestConnectionsButton.click(function(){
        ld.hideTestsForSpecs();
        hideTestConnectionsButton.addClass('disabled');
        showTestConnectionsButton.removeClass('disabled');
    });

    // Add Pill with count

    // Add to pill to run tests*/

    $.get('linedown-spec.ld.txt',function(content){
       var html = ld.parseNoOptions(content);
        console.log(html);
        $('#lineDownOutput').html(html);
    });

    // render the linedown spec as html

})(window.linedown = window.linedown || {}, jQuery)
