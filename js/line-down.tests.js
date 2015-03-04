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

    // define the most evil test cases we can, i: 'input line-down', o: 'expected html out', n: 'Test name/description'

    var testCases = [
        { i: '#Heading one', o: '<h1>Heading one</h1>', n: 'Single hash, no spacing' },
        { i: '\r\n#Heading one', o: '<h1>Heading one</h1>', n: 'Single hash, newline before' },
        { i: '\r\n#Heading one\r\n', o: '<h1>Heading one</h1>', n: 'Single hash, newline before and after' },
        { i: '\r\n\r\n#Heading one\r\n', o: '<h1>Heading one</h1>', n: 'Single hash, two newlines before and one after' },
        { i: '\r\n\r\n#Heading one\r\n\r\n', o: '<h1>Heading one</h1>', n: 'Single hash, two newlines before and two after' },
        { i: '# Heading one', o: '<h1>Heading one</h1>', n: 'Single hash, spacing after' },
        { i: ' #Heading one', o: '<h1>Heading one</h1>', n: 'Single hash, spacing before' },
        { i: '  #Heading one', o: '<h1>Heading one</h1>', n: 'Single hash, double spacing before' },
        { i: '    #Heading one', o: '<h1>Heading one</h1>', n: 'Single hash, triple spacing before' },
        { i: '          #Heading one', o: '<h1>Heading one</h1>', n: 'Single hash, 10 spaces before' },
        { i: '#Heading one          ', o: '<h1>Heading one</h1>', n: 'Single hash, 10 spaces after' },
        { i: '#          Heading one', o: '<h1>Heading one</h1>', n: 'Single hash, 10 spaces between' },
        { i: '          #          Heading one', o: '<h1>Heading one</h1>', n: 'Single hash, 10 spaces before & between' },
        { i: '#          Heading one          ', o: '<h1>Heading one</h1>', n: 'Single hash, 10 spaces between & after' },
        { i: '          #          Heading one          ', o: '<h1>Heading one</h1>', n: 'Single hash, 10 spaces before, between & after' },
        { i: '#\tHeading one', o: '<h1>Heading one</h1>', n: 'Single hash, tab between' },
        { i: '#\tHeading one', o: '<h1>Heading one</h1>', n: 'Single hash, 2 tabs between' },
        { i: '\t#Heading one', o: '<h1>Heading one</h1>', n: 'Single hash, single tab before' },
        { i: '#Heading one\t', o: '<h1>Heading one</h1>', n: 'Single hash, single tab after' },
        { i: '\t#Heading one\t', o: '<h1>Heading one</h1>', n: 'Single hash, single tab before and after' },
        { i: ' # Heading one', o: '<h1>Heading one</h1>', n: 'Single hash, spacing before and after' },
        { i: '#1Heading one', o: '<h1>Heading one</h1>', n:'Single hash, 1 depth, no spacing' },
        { i: '#1 Heading one', o: '<h1>Heading one</h1>', n: 'Single hash, 1 depth, spacing after' },
        { i: ' #1 Heading one', o: '<h1>Heading one</h1>', n: 'Single hash, 1 depth, spacing before' },
        { i: '##Heading two', o: '<h2>Heading two</h2>',n:'Two hashes, no spacing,' },
        { i: '## Heading two', o: '<h2>Heading two</h2>', n: 'Two hashes, spacing after' },
        { i: ' ## Heading two', o: '<h2>Heading two</h2>', n: 'Two hashes, spacing before' },
        { i: '#2 Heading two', o: '<h2>Heading two</h2>', n: 'Single hash, 2 depth, spacing after' },
        { i: ' #2Heading two', o: '<h2>Heading two</h2>', n: 'Single hash, 2 depth, spacing before' },
        { i: '#2Heading two', o: '<h2>Heading two</h2>',n:'Single hash, 2 depth, no spacing' },
        { i: '#100Heading 100!', o: '<h100>Heading 100!</h100>', n: 'Single hash, 100 depth, no spacing' },
        { i: ' #100Heading 100!', o: '<h100>Heading 100!</h100>', n: 'Single hash, 100 depth, spacing before' },
        { i: '#100 Heading 100!', o: '<h100>Heading 100!</h100>', n: 'Single hash, 100 depth, spacing after' },
        { i: '#@classy Heading one', o: '<h1 class=\'classy\'>Heading one</h1>', n:'Single hash, single class spec' },
        { i: '#@classy@ Heading one', o: '<h1 class=\'classy\'>Heading one</h1>', n:'Single hash, single closed class spec with space' },
        { i: '#@classy@Heading one', o: '<h1 class=\'classy\'>Heading one</h1>', n:'Single hash, single closed class spec without space' },
        { i: '#@very.classy Heading one', o: '<h1 class=\'very classy\'>Heading one</h1>', n: 'Single hash, double class spec' },
        { i: '#@very.classy.thing Heading one', o: '<h1 class=\'very classy thing\'>Heading one</h1>', n: 'Single hash, triple class spec' },
        { i: '#@very.classy.thing@Heading one', o: '<h1 class=\'very classy thing\'>Heading one</h1>', n: 'Single hash, triple closed class spec without space' },
        { i: '#@very.classy.thing@ Heading one', o: '<h1 class=\'very classy thing\'>Heading one</h1>', n: 'Single hash, triple closed class spec with space' },
        { i: '#?classy Heading one', o: '<h1 id=\'classy\'>Heading one</h1>', n: 'Single hash, single id spec' },
        { i: '#?classy? Heading one', o: '<h1 id=\'classy\'>Heading one</h1>', n: 'Single hash, single closed id spec with space' },
        { i: '#?classy?Heading one', o: '<h1 id=\'classy\'>Heading one</h1>', n: 'Single hash, single closed id spec without space' },
        { i: '#?very.classy Heading one', o: '<h1 id=\'very.classy\'>Heading one</h1>', n: 'Single hash, single class spec, dot means nothing' },
        { i: '#2@classy?theHeading The heading', o: '<h2 id=\'theHeading\' class=\'classy\'>The heading</h2>', n:'Single hash, 2 depth, single class and id spec' },
        { i: '#2?theHeading@classy The heading', o: '<h2 id=\'theHeading\' class=\'classy\'>The heading</h2>', n: 'Single hash, 2 depth, single id and class spec' },
        { i: '#2?theHeading?@classy The heading', o: '<h2 id=\'theHeading\' class=\'classy\'>The heading</h2>', n: 'Single hash, 2 depth, single closed id and open class spec' },
        { i: '#2?theHeading?@classy@ The heading', o: '<h2 id=\'theHeading\' class=\'classy\'>The heading</h2>', n: 'Single hash, 2 depth, single closed id and closed class spec with space' },
        { i: '#2?theHeading?@classy@The heading', o: '<h2 id=\'theHeading\' class=\'classy\'>The heading</h2>', n: 'Single hash, 2 depth, single closed id and closed class spec without space' },
        { i: '#2?theHeading@classy@The heading', o: '<h2 id=\'theHeading\' class=\'classy\'>The heading</h2>', n: 'Single hash, 2 depth, single open id and closed class spec without space' },
        { i: '#2?theHeading@classy@ The heading', o: '<h2 id=\'theHeading\' class=\'classy\'>The heading</h2>', n: 'Single hash, 2 depth, single open id and closed class spec with space' },
        { i: '#2@classy@?theHeading? The heading', o: '<h2 id=\'theHeading\' class=\'classy\'>The heading</h2>', n: 'Single hash, 2 depth, single closed class and closed id spec with space' },
        { i: '#2@classy@?theHeading?The heading', o: '<h2 id=\'theHeading\' class=\'classy\'>The heading</h2>', n: 'Single hash, 2 depth, single closed class and closed id spec without space' },
        { i: '#2@classy?theHeading?The heading', o: '<h2 id=\'theHeading\' class=\'classy\'>The heading</h2>', n: 'Single hash, 2 depth, single open class and closed id spec without space' },
        { i: '#2@classy?theHeading? The heading', o: '<h2 id=\'theHeading\' class=\'classy\'>The heading</h2>', n: 'Single hash, 2 depth, single open class and closed id spec with space' },
        { i: 'In a paragraph by default', o: '<p>In a paragraph by default\r\n</p>', n:'Default paragraph opening, single block closing'},
        { i: 'Started on my own\r\nIn a paragraph', o:'<p>Started on my own\r\nIn a paragraph\r\n</p>',n:'Default paragraph open, two lines, single block closing'},
        { i: 'Started on my own\r\nIn a paragraph\r\nKept on going', o:'<p>Started on my own\r\nIn a paragraph\r\nKept on going\r\n</p>',n:'Default paragraph open, three lines, single block closing'},
        { i: 'Started on my own\r\nIn a paragraph\r\nKept on going\r\nEventually got closed', o:'<p>Started on my own\r\nIn a paragraph\r\nKept on going\r\nEventually got closed\r\n</p>',n:'Default paragraph open, four lines, single block closing'},
        { i: 'Paragraph one\r\n\r\nParagraph two', o:'<p>Paragraph one\r\n</p>\r\n<p>Paragraph two\r\n</p>',n:'Two default paragraphs'},
        { i: 'Paragraph one\r\n\r\nParagraph two\r\n\r\nParagraph three', o:'<p>Paragraph one\r\n</p>\r\n<p>Paragraph two\r\n</p>\r\n<p>Paragraph three\r\n</p>',n:'Three default paragraphs'},
        { i: 'Paragraph one\r\n\r\n\r\nParagraph two',o:'<p>Paragraph one\r\n</p>\r\n<p>Paragraph two\r\n</p>',n:'Two default paragraphs, white line roll up between'},
        { i: 'Something before the heading # Oh noes not a heading - but a paragraph', o: '<p>Something before the heading # Oh noes not a heading - but a paragraph\r\n</p>', n: 'Text before hash, space before and after' },
        { i: 'Something before the heading #Oh noes not a heading - but a paragraph', o: '<p>Something before the heading #Oh noes not a heading - but a paragraph\r\n</p>', n: 'Text before hash, space before, no space after' },
        { i: 'Something before the heading# Oh noes not a heading - but a paragraph', o: '<p>Something before the heading# Oh noes not a heading - but a paragraph\r\n</p>', n: 'Text before hash, no space before, space after' },
        { i: 'Something before the heading#Oh noes not a heading - but a paragraph', o: '<p>Something before the heading#Oh noes not a heading - but a paragraph\r\n</p>', n: 'Text before hash, no space before or after' },
        { i: '\"\"A simple quote', o:'<blockquote><p>A simple quote\r\n</p>\r\n</blockquote>', n:'Double double quotes starts blockquote block over one line'},
        { i: '\"\"\r\nA simple quote', o:'<blockquote>\r\n<p>A simple quote\r\n</p>\r\n</blockquote>', n:'Double double quotes starts blockquote block on new line over one line'},
        { i: '\'\'A simple explicit paragraph', o:'<p>A simple explicit paragraph\r\n</p>', n:'Double single quote starts paragraph block over one line'},
        { i: '\'\'\r\nA simple explicit paragraph', o:'<p>\r\nA simple explicit paragraph\r\n</p>', n:'Double single quote starts paragraph block on new line over one line'},
        { i: '\'\'@explicit A simply classy explicit paragraph', o:'<p class=\'explicit\'>A simply classy explicit paragraph\r\n</p>', n:'Double single quote starts paragraph block over one line with open class spec'},
        { i: '\'\'?summary This simple paragraph summarises everything', o:'<p id=\'summary\'>This simple paragraph summarises everything\r\n</p>', n:'Double single quote starts paragraph block over one line with id class spec'},
        { i: '\'\'@explicit@?lead?This simple paragraph might be going somewhere', o:'<p id=\'lead\' class=\'explicit\'>This simple paragraph might be going somewhere\r\n</p>', n:'Double single quote starts paragraph block over one line with closed class and id spec with no space'},
        { i: '\'\'@explicit@?lead?This longer paragraph is definitely going somwhere\r\nThis next line for example', o:'<p id=\'lead\' class=\'explicit\'>This longer paragraph is definitely going somwhere\r\nThis next line for example\r\n</p>', n:'Double single quote starts paragraph block over one line with closed class and id spec with no space'}
    ];

    function htmlEncode(value) {
        return $('<div/>').text(value).html();
    }

    function runTests() {

        var model = linedown.testsModel;

        model.run(0);
        model.passed(0);
        model.failed(0);
        model.failedTests.removeAll();

        $.each(model.tests(), function (k, v) {
            var html = linedown.parse(v.linedownInput);
            var expected = v.expectedHtmlOutput;
            var match = (html == expected);

            v.actualHtmlOutput(html);
            v.run(true);
            v.passed(match);
            v.result(match ? 'Passed' : 'Failed');

            model.run(model.run() + 1);
            if (match) model.passed(model.passed() + 1);
            else {
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
    }
    ld.testsModel = new testsModel();

    $.each(testCases.reverse(), function(k, v) {
        ld.testsModel.tests.push({
            linedownInput: v.i,
            expectedHtmlOutput: v.o,
            actualHtmlOutput :ko.observable('Not Run'),
            run: ko.observable(false),
            passed: ko.observable(false),
            result: ko.observable('Not Run'),
            description :v.n
        });
    });

    ld.testsModel.passed(0);
    ld.testsModel.failed(0);
    ld.testsModel.run(0);

    ko.applyBindings(linedown.testsModel, $('#testRunOutput')[0]);
    ko.applyBindings(linedown.testsModel, $('#testRunStats')[0]);

})(window.linedown = window.linedown || {}, jQuery)
