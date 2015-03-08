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

    function diffResult(expected, actual) {
        var diff = JsDiff['diffChars'](expected, actual);
        var fragment = document.createDocumentFragment();
        for (var i=0; i < diff.length; i++) {

            if (diff[i].added && diff[i + 1] && diff[i + 1].removed) {
                var swap = diff[i];
                diff[i] = diff[i + 1];
                diff[i + 1] = swap;
            }

            var node;
            if (diff[i].removed) {
                node = document.createElement('del');
                node.appendChild(document.createTextNode(diff[i].value));
            } else if (diff[i].added) {
                node = document.createElement('ins');
                node.appendChild(document.createTextNode(diff[i].value));
            } else {
                node = document.createTextNode(diff[i].value);
            }
            fragment.appendChild(node);
        }
        return fragment;
    }

    function runTests() {

        var warmUp = linedown.parse('#100 Warmup');
        warmUp = linedown.parse('# Warmup');
        warmUp = linedown.parse('\"\"#100 Warmup');
        warmUp = linedown.parse('\'\'#100 Warmup');

        var model = linedown.testsModel;

        model.totalParserExecutionTime(0);
        model.run(0);
        model.passed(0);
        model.failed(0);
        model.failedTests.removeAll();

        $.each(model.tests(), function (k, v) {
            var startTime = window.performance.now();
            var html = linedown.parseNoOptions(v.linedownInput);
            var endTime = window.performance.now();
            var executionTime = Math.floor((endTime - startTime)*1000)/1000;
            var expected = v.expectedHtmlOutput;
            var match = (html == expected);

            v.actualHtmlOutput(html);
            v.run(true);
            v.passed(match);
            v.result(match ? 'Passed' : 'Failed');
            v.executionTime(executionTime);

            model.totalParserExecutionTime(Math.floor((model.totalParserExecutionTime() + executionTime)*1000)/1000);

            model.run(model.run() + 1);
            if (match) model.passed(model.passed() + 1);
            else {
                var diffFragment = diffResult(expected, html);
                var element = document.createElement('div');
                element.appendChild(diffFragment);
                var diff = $(element);
                v.resultDiff(diff.html());
                model.failed(model.failed() + 1);
                model.failedTests.push(v);
            }
        });

    }


    $('#runTests').click(function() {
        runTests();
    });
    var testsModel = function() {
        this.tests = ko.observableArray([]);
        this.failedTests = ko.observableArray([]);
        this.passed = ko.observable(0);
        this.failed = ko.observable(0);
        this.run = ko.observable(0);
        this.totalParserExecutionTime = ko.observable(0);
    }
    ld.testsModel = new testsModel();

    $.each(ld.testCases.reverse(), function(k, v) {
        ld.testsModel.tests.push({
            linedownInput: v.i,
            expectedHtmlOutput: v.o,
            actualHtmlOutput :ko.observable('Not Run'),
            resultDiff: ko.observable('Not Run'),
            run: ko.observable(false),
            passed: ko.observable(false),
            result: ko.observable('Not Run'),
            description :v.n,
            executionTime : ko.observable(0)
        });
    });

    ld.testsModel.passed(0);
    ld.testsModel.failed(0);
    ld.testsModel.run(0);

    ko.applyBindings(linedown.testsModel, $('#testRunOutput')[0]);
    ko.applyBindings(linedown.testsModel, $('#testRunStats')[0]);

})(window.linedown = window.linedown || {}, jQuery)
