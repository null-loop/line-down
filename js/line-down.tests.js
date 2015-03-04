(function (ld, $, undefined) {

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
        { i: 'Paragraph one\r\n\r\n\r\nParagraph two',o:'<p>Paragraph one\r\n</p>\r\n<p>Paragraph two\r\n</p>',n:'Two default paragraphs, white line roll up between'}
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
