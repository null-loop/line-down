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
            $(specItem).prepend($(html));
        });
    };

    ld.hideTestsForSpecs = function(){
        var specItems = $('[data-spec]');
        $.each(specItems,function(k,specItem){
            $(specItem).find('.test').remove();
        });
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

    // Add to pill to run tests

})(window.linedown = window.linedown || {}, jQuery)
