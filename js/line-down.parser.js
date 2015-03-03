(function (ld, $, undefined) {

    var digits = '0123456789';

    function startsWith(symbol, line) {
        var doesStartWith = false;
        var r = line;
        var count = 0;
        var f = false;
        var numberCount = '';
        var inClasses = false;
        var inId = false;
        var classes = '';
        var id = '';

        while (r.length > 0 && !f) {
            var c = r[0];
            if (c == symbol) {
                count++;
                doesStartWith = true;
                r = r.substring(1);
            }
            else if ($.inArray(c, digits) != -1 && !inClasses) {
                numberCount = numberCount + c;
                r = r.substring(1);
            }
            else if (c == '@') {
                inClasses = true;
                inId = false;
                r = r.substring(1);
            }
            else if (c == '?') {
                inId = true;
                inClasses = false;
                r = r.substring(1);
            }
            else if (inClasses && c != ' ' && c!='?') {
                classes = classes + c;
                r = r.substring(1);
            }
            else if (inId && c != ' ' && c!='@') {
                id = id + c;
                r = r.substring(1);
            }
            else if (count > 0) {
                f = true;
            } else {
                doesStartWith = false;
                f = true;
            }
        }

        if (numberCount.length > 0) {
            count = parseInt(numberCount);
        }
        r = r.trim();

        return {
            id:id,
            classes:classes,
            startsWith: doesStartWith,
            symbol: symbol,
            symbolCount: count,
            remaingLine: r
        };
    }


    function buildLine(lineIndex, lineContent, scope) {

        var lineElement = '';
        var trimmedContent = lineContent.trim();
        var classes = '';
        var id = '';

        // detect headings
        var headings = startsWith('#', trimmedContent);
        if (headings.startsWith) {
            lineElement = 'h' + headings.symbolCount;
            trimmedContent = headings.remaingLine;
            classes = headings.classes;
            id = headings.id;
        } else {

        }

        // remove whitespace

        // respect escapings

        //TODO:For laters
        var ignoreTrim = false;
        var finalLineContent = ignoreTrim ? lineContent : trimmedContent;

        return {
            classes:classes,
            lineIndex: lineIndex,
            lineContent: finalLineContent,
            lineElement: lineElement,
            id: id,
            result:function() {
                if (this.lineElement != '') {
                    return this.open() + finalLineContent + this.close();
                }
                return finalLineContent;
            },
            open: function () {

                var o = '<' + this.lineElement;

                if (this.id.length > 0) {
                    o = o + ' id=\'' + this.id + '\'';
                }
                if (this.classes.length > 0) {
                    o = o + ' class=\'' + this.classes.replace('.', ' ') + '\'';
                }

                o = o + '>';

                return o;
            },
            close:function() {
                return '</' + this.lineElement + '>';
            }
        }
    }

    function parse(linedownContent) {

        var lines = linedownContent.match(/[^\r\n]+/g);
        var lineIndex = 0;

        var builder = {
            _outputLines: [],
            addLine: function(line) {
                this._outputLines.push(line);
            },
            result: function () {
                var s = '';
                $.each(this._outputLines, function (key, value) {
                    var r = value.result();
                    if (key > 0) s = s + '\r\n';
                    s = s + r;
                });
                return s;
            }
        }

        var scope = {
            _scopeStack: []
        };

        while (lineIndex < lines.length) {
            var lineText = lines[lineIndex];
            var line = buildLine(lineIndex, lineText, scope);
            builder.addLine(line);
            lineIndex++;
        }

        return builder.result();
    }

    ld.parse = parse;

    $('#regenerateLinedown').click(function() {
        var linedownContent = $('#linedownInput')[0].value;
        var html = parse(linedownContent);
        $('#linedownOutput')[0].value = html;
    });

})(window.linedown = window.linedown || {}, jQuery)
