var assert = require("assert");
var h = require("./tests/helpers.js");
var col = require("lib/collections.js");

var cases = [
    { "i": '#Heading one', "o": '<h1>Heading one</h1>', "n": 'Single hash, no spacing' },
    { "i": '\r\n#Heading one', "o": '<h1>Heading one</h1>', "n": 'Single hash, newline before' },
    { "i": '\r\n#Heading one\r\n', "o": '<h1>Heading one</h1>', "n": 'Single hash, newline before and after' },
    { "i": '\r\n\r\n#Heading one\r\n', "o": '<h1>Heading one</h1>', "n": 'Single hash, two newlines before and one after' },
    { "i": '\r\n\r\n#Heading one\r\n\r\n', "o": '<h1>Heading one</h1>', "n": 'Single hash, two newlines before and two after' },
    { "i": '# Heading one', "o": '<h1>Heading one</h1>', "n": 'Single hash, spacing after',"s":["GR_IGNORE_LEADING_TRAILING_WHITESPACE"] },
    { "i": ' #Heading one', "o": '<h1>Heading one</h1>', "n": 'Single hash, spacing before' },
    { "i": '  #Heading one', "o": '<h1>Heading one</h1>', "n": 'Single hash, double spacing before' },
    { "i": '    #Heading one', "o": '<h1>Heading one</h1>', "n": 'Single hash, triple spacing before' },
    { "i": '          #Heading one', "o": '<h1>Heading one</h1>', "n": 'Single hash, 10 spaces before' },
    { "i": '#Heading one          ', "o": '<h1>Heading one</h1>', "n": 'Single hash, 10 spaces after' },
    { "i": '#          Heading one', "o": '<h1>Heading one</h1>', "n": 'Single hash, 10 spaces between' },
    { "i": '          #          Heading one', "o": '<h1>Heading one</h1>', "n": 'Single hash, 10 spaces before & between' },
    { "i": '#          Heading one          ', "o": '<h1>Heading one</h1>', "n": 'Single hash, 10 spaces between & after' },
    { "i": '          #          Heading one          ', "o": '<h1>Heading one</h1>', "n": 'Single hash, 10 spaces before, between & after' },
    { "i": '#\tHeading one', "o": '<h1>Heading one</h1>', "n": 'Single hash, tab between' },
    { "i": '#\tHeading one', "o": '<h1>Heading one</h1>', "n": 'Single hash, 2 tabs between' },
    { "i": '\t#Heading one', "o": '<h1>Heading one</h1>', "n": 'Single hash, single tab before' },
    { "i": '#Heading one\t', "o": '<h1>Heading one</h1>', "n": 'Single hash, single tab after' },
    { "i": '\t#Heading one\t', "o": '<h1>Heading one</h1>', "n": 'Single hash, single tab before and after' },
    { "i": ' # Heading one', "o": '<h1>Heading one</h1>', "n": 'Single hash, spacing before and after' },
    { "i": '#1Heading one', "o": '<h1>Heading one</h1>', "n":'Single hash, 1 depth, no spacing' },
    { "i": '#1 Heading one', "o": '<h1>Heading one</h1>', "n": 'Single hash, 1 depth, spacing after' },
    { "i": ' #1 Heading one', "o": '<h1>Heading one</h1>', "n": 'Single hash, 1 depth, spacing before' },
    { "i": '##Heading two', "o": '<h2>Heading two</h2>',"n":'Two hashes, no spacing,' },
    { "i": '## Heading two', "o": '<h2>Heading two</h2>', "n": 'Two hashes, spacing after' },
    { "i": ' ## Heading two', "o": '<h2>Heading two</h2>', "n": 'Two hashes, spacing before' },
    { "i": '#2 Heading two', "o": '<h2>Heading two</h2>', "n": 'Single hash, 2 depth, spacing after' },
    { "i": ' #2Heading two', "o": '<h2>Heading two</h2>', "n": 'Single hash, 2 depth, spacing before' },
    { "i": '#2Heading two', "o": '<h2>Heading two</h2>',"n":'Single hash, 2 depth, no spacing' },
    { "i": '#100Heading 100!', "o": '<h100>Heading 100!</h100>', "n": 'Single hash, 100 depth, no spacing' },
    { "i": ' #100Heading 100!', "o": '<h100>Heading 100!</h100>', "n": 'Single hash, 100 depth, spacing before' },
    { "i": '#100 Heading 100!', "o": '<h100>Heading 100!</h100>', "n": 'Single hash, 100 depth, spacing after' },
    { "i": '#@classy Heading one', "o": '<h1 class=\'classy\'>Heading one</h1>', "n":'Single hash, single class spec' },
    { "i": '#@classy@ Heading one', "o": '<h1 class=\'classy\'>Heading one</h1>', "n":'Single hash, single closed class spec with space' },
    { "i": '#@classy@Heading one', "o": '<h1 class=\'classy\'>Heading one</h1>', "n":'Single hash, single closed class spec without space' },
    { "i": '#@very&classy Heading one', "o": '<h1 class=\'very classy\'>Heading one</h1>', "n": 'Single hash, double class spec' },
    { "i": '#@very&classy&thing Heading one', "o": '<h1 class=\'very classy thing\'>Heading one</h1>', "n": 'Single hash, triple class spec' },
    { "i": '#@very&classy&thing@Heading one', "o": '<h1 class=\'very classy thing\'>Heading one</h1>', "n": 'Single hash, triple closed class spec without space' },
    { "i": '#@very&classy&thing@ Heading one', "o": '<h1 class=\'very classy thing\'>Heading one</h1>', "n": 'Single hash, triple closed class spec with space' },
    { "i": '#?classy Heading one', "o": '<h1 id=\'classy\'>Heading one</h1>', "n": 'Single hash, single id spec' },
    { "i": '#?classy? Heading one', "o": '<h1 id=\'classy\'>Heading one</h1>', "n": 'Single hash, single closed id spec with space' },
    { "i": '#?classy?Heading one', "o": '<h1 id=\'classy\'>Heading one</h1>', "n": 'Single hash, single closed id spec without space' },
    { "i": '#?very.classy Heading one', "o": '<h1 id=\'very.classy\'>Heading one</h1>', "n": 'Single hash, single class spec, dot means nothing' },
    { "i": '#2@classy?theHeading The heading', "o": '<h2 id=\'theHeading\' class=\'classy\'>The heading</h2>', "n":'Single hash, 2 depth, single class and id spec' },
    { "i": '#2?theHeading@classy The heading', "o": '<h2 id=\'theHeading\' class=\'classy\'>The heading</h2>', "n": 'Single hash, 2 depth, single id and class spec' },
    { "i": '#2?theHeading?@classy The heading', "o": '<h2 id=\'theHeading\' class=\'classy\'>The heading</h2>', "n": 'Single hash, 2 depth, single closed id and open class spec' },
    { "i": '#2?theHeading?@classy@ The heading', "o": '<h2 id=\'theHeading\' class=\'classy\'>The heading</h2>', "n": 'Single hash, 2 depth, single closed id and closed class spec with space' },
    { "i": '#2?theHeading?@classy@The heading', "o": '<h2 id=\'theHeading\' class=\'classy\'>The heading</h2>', "n": 'Single hash, 2 depth, single closed id and closed class spec without space' },
    { "i": '#2?theHeading@classy@The heading', "o": '<h2 id=\'theHeading\' class=\'classy\'>The heading</h2>', "n": 'Single hash, 2 depth, single open id and closed class spec without space' },
    { "i": '#2?theHeading@classy@ The heading', "o": '<h2 id=\'theHeading\' class=\'classy\'>The heading</h2>', "n": 'Single hash, 2 depth, single open id and closed class spec with space' },
    { "i": '#2@classy@?theHeading? The heading', "o": '<h2 id=\'theHeading\' class=\'classy\'>The heading</h2>', "n": 'Single hash, 2 depth, single closed class and closed id spec with space' },
    { "i": '#2@classy@?theHeading?The heading', "o": '<h2 id=\'theHeading\' class=\'classy\'>The heading</h2>', "n": 'Single hash, 2 depth, single closed class and closed id spec without space' },
    { "i": '#2@classy?theHeading?The heading', "o": '<h2 id=\'theHeading\' class=\'classy\'>The heading</h2>', "n": 'Single hash, 2 depth, single open class and closed id spec without space' },
    { "i": '#2@classy?theHeading? The heading', "o": '<h2 id=\'theHeading\' class=\'classy\'>The heading</h2>', "n": 'Single hash, 2 depth, single open class and closed id spec with space' },
    { "i": 'In a paragraph by default', "o": '<p>In a paragraph by default\r\n</p>', "n":'Default paragraph opening, single block closing'},
    { "i": 'Started on my own\r\nIn a paragraph', "o":'<p>Started on my own\r\nIn a paragraph\r\n</p>',"n":'Default paragraph open, two lines, single block closing'},
    { "i": 'Started on my own\r\nIn a paragraph\r\nKept on going', "o":'<p>Started on my own\r\nIn a paragraph\r\nKept on going\r\n</p>',"n":'Default paragraph open, three lines, single block closing'},
    { "i": 'Started on my own\r\nIn a paragraph\r\nKept on going\r\nEventually got closed', "o":'<p>Started on my own\r\nIn a paragraph\r\nKept on going\r\nEventually got closed\r\n</p>',"n":'Default paragraph open, four lines, single block closing'},
    { "i": 'Paragraph one\r\n\r\nParagraph two', "o":'<p>Paragraph one\r\n</p>\r\n<p>Paragraph two\r\n</p>',"n":'Two default paragraphs'},
    { "i": 'Paragraph one\r\n\r\nParagraph two\r\n\r\nParagraph three', "o":'<p>Paragraph one\r\n</p>\r\n<p>Paragraph two\r\n</p>\r\n<p>Paragraph three\r\n</p>',"n":'Three default paragraphs'},
    { "i": 'Paragraph one\r\n\r\n\r\nParagraph two',"o":'<p>Paragraph one\r\n</p>\r\n<p>Paragraph two\r\n</p>',"n":'Two default paragraphs, white line roll up between'},
    { "i": 'Something before the heading # Oh noes not a heading - but a paragraph', "o": '<p>Something before the heading # Oh noes not a heading - but a paragraph\r\n</p>', "n": 'Text before hash, space before and after' },
    { "i": 'Something before the heading #Oh noes not a heading - but a paragraph', "o": '<p>Something before the heading #Oh noes not a heading - but a paragraph\r\n</p>', "n": 'Text before hash, space before, no space after' },
    { "i": 'Something before the heading# Oh noes not a heading - but a paragraph', "o": '<p>Something before the heading# Oh noes not a heading - but a paragraph\r\n</p>', "n": 'Text before hash, no space before, space after' },
    { "i": 'Something before the heading#Oh noes not a heading - but a paragraph', "o": '<p>Something before the heading#Oh noes not a heading - but a paragraph\r\n</p>', "n": 'Text before hash, no space before or after' },
    { "i": '\"These quotes mean nothing to me\" the parser said.', "o": '<p>&#x22;These quotes mean nothing to me&#x22; the parser said.\r\n</p>',"n":'Single double quotes are ignored'},
    { "i": '\"\"A simple quote', "o":'<blockquote><p>A simple quote\r\n</p>\r\n</blockquote>', "n":'Double double quotes starts blockquote block over one line'},
    { "i": '\"\"\r\nA simple quote', "o":'<blockquote>\r\n<p>A simple quote\r\n</p>\r\n</blockquote>', "n":'Double double quotes starts blockquote block on new line over one line'},
    { "i": '\'\'A simple explicit paragraph', "o":'<p>A simple explicit paragraph\r\n</p>', "n":'Double single quote starts paragraph block over one line'},
    { "i": '\'These quotes mean nothing to me\' the parser said.', "o": '<p>&#x27;These quotes mean nothing to me&#x27; the parser said.\r\n</p>',"n":'Single quotes are ignored'},
    { "i": '\'\'\r\nA simple explicit paragraph', "o":'<p>\r\nA simple explicit paragraph\r\n</p>', "n":'Double single quote starts paragraph block on new line over one line'},
    { "i": '\'\'@explicit A simply classy explicit paragraph', "o":'<p class=\'explicit\'>A simply classy explicit paragraph\r\n</p>', "n":'Double single quote starts paragraph block over one line with open class spec'},
    { "i": '\'\'?summary This simple paragraph summarises everything', "o":'<p id=\'summary\'>This simple paragraph summarises everything\r\n</p>', "n":'Double single quote starts paragraph block over one line with id class spec'},
    { "i": '\'\'@explicit@?lead?This simple paragraph might be going somewhere', "o":'<p id=\'lead\' class=\'explicit\'>This simple paragraph might be going somewhere\r\n</p>', "n":'Double single quote starts paragraph block over one line with closed class and id spec with no space'},
    { "i": '\'\'@explicit@?lead?This longer paragraph is definitely going somwhere\r\nThis next line for example', "o":'<p id=\'lead\' class=\'explicit\'>This longer paragraph is definitely going somwhere\r\nThis next line for example\r\n</p>', "n":'Double single quote starts paragraph block over one line with closed class and id spec with no space'},
    { "i": '#?lead This is the lead\r\n#?lead This is not the lead',"o":'<h1 id=\'lead\'>This is the lead</h1>\r\n<h1>This is not the lead</h1>',"n":'Two headings, two uses of same id spec, second is ignored'},
    { "i": '#?lead@classy This is the lead\r\n#?lead@classy This is not the lead',"o":'<h1 id=\'lead\' class=\'classy\'>This is the lead</h1>\r\n<h1 class=\'classy\'>This is not the lead</h1>',"n":'Two headings, two uses of same id spec, same CSS spec, second Id spec is ignored'},
    { "i": '#?lead?@classy@This is the lead\r\n#?lead?@classy@This is not the lead',"o":'<h1 id=\'lead\' class=\'classy\'>This is the lead</h1>\r\n<h1 class=\'classy\'>This is not the lead</h1>',"n":'Two headings, two uses of same id spec, same CSS spec, second Id spec is ignored, closed specs no spaces'},
    { "i": '#?lead?@classy@ This is the lead\r\n#?lead?@classy@ This is not the lead',"o":'<h1 id=\'lead\' class=\'classy\'>This is the lead</h1>\r\n<h1 class=\'classy\'>This is not the lead</h1>',"n":'Two headings, two uses of same id spec, same CSS spec, second Id spec is ignored, closed specs with space'},
    { "i": '#?lead This is the lead\r\n#?lead This is not the lead\r\n#?lead Neither am I',"o":'<h1 id=\'lead\'>This is the lead</h1>\r\n<h1>This is not the lead</h1>\r\n<h1>Neither am I</h1>',"n":'Three headings, three uses of same id spec, second and third is ignored'},
    { "i": '#?lead This is the lead\r\n#?lead This is not the lead\r\n#?lead Neither am I\r\n#?follow I follow',"o":'<h1 id=\'lead\'>This is the lead</h1>\r\n<h1>This is not the lead</h1>\r\n<h1>Neither am I</h1>\r\n<h1 id=\'follow\'>I follow</h1>',"n":'Four headings, three uses of same id spec, one use of another, second and third use of first spec is ignored'},
    { "i": 'This paragraph\"\" has already started', "o":'<p>This paragraph&#x22;&#x22; has already started\r\n</p>', "n":'Block quote spec ignored in middle of line'},
    { "i": 'There are \"entities\" in here & over here!', "o":'<p>There are &#x22;entities&#x22; in here &#x26; over here!\r\n</p>',"n":'Double quotes replaced with &#x22; and & replaced with &#x26;'},
    { "i": '\"\"This block quote should be\r\n\r\nIntact, but with paragraphs', "o":'<blockquote><p>This block quote should be\r\n</p>\r\n<p>Intact, but with paragraphs\r\n</p>\r\n</blockquote>',"n":'Block quotes excluded from implicit close on blank line'},
    { "i": '\"\"This block quote should be\r\n\r\n\r\nIntact, but with paragraphs', "o":'<blockquote><p>This block quote should be\r\n</p>\r\n<p>Intact, but with paragraphs\r\n</p>\r\n</blockquote>',"n":'Block quotes excluded from implicit close on blank line, but respect multiple blank line roll up'},
    { "i": '\"\"#Blimey!', "o":'<blockquote><h1>Blimey!</h1>\r\n</blockquote>', "n":'H1 nested after block quote start on single line'},
    { "i": '\"\"?i# Paragraph',"o":'<blockquote id=\'i#\'><p>Paragraph\r\n</p>\r\n</blockquote>',"n":'Heading ignored as part of block quote Id spec'},
    { "i": '\"\"?i # Heading',"o":'<blockquote id=\'i\'><h1>Heading</h1>\r\n</blockquote>',"n":'Heading respected as separate from block quote Id spec'},
    { "i": '\"\"?i?#Heading',"o":'<blockquote id=\'i\'><h1>Heading</h1>\r\n</blockquote>',"n":'Heading respected after closed Id spec on block quote'},
    { "i": '\"\"?i?#?u?Heading',"o":'<blockquote id=\'i\'><h1 id=\'u\'>Heading</h1>\r\n</blockquote>',"n":'Heading (with Id closed spec) respected after closed Id spec on block quote'},
    { "i":'\"\"\r\n#Heading\r\nParagraph',"o":'<blockquote>\r\n<h1>Heading</h1>\r\n<p>Paragraph\r\n</p>\r\n</blockquote>',"n":'Implicit paragraph follows heading inside block quote'},
    { "i":'\'\'Paragraph\'\'',"o":'<p>Paragraph</p>',"n":'Explicit paragraph with explicit close on single line'},
    { "i":'\"\"Blockquote\"\"',"o":'<blockquote><p>Blockquote</p></blockquote>',"n":'Blockquote with explicit close on single line'},
    { "i":'\"\"#Heading\"\"',"o":'<blockquote><h1>Heading</h1></blockquote>',"n":'Blockquote with heading and explicit close on single line'},
    { "i":'\"\"#?lead Heading\"\"',"o":'<blockquote><h1 id=\'lead\'>Heading</h1></blockquote>',"n":'Blockquote with heading with open id spec and explicit close on single line'},
    { "i":'\"\"#?lead?Heading\"\"',"o":'<blockquote><h1 id=\'lead\'>Heading</h1></blockquote>',"n":'Blockquote with heading with closed id spec and explicit close on single line'},
    { "i":'\"\"Multiple quotes\"\"\r\n\"\"And another\"\"',"o":'<blockquote><p>Multiple quotes</p></blockquote>\r\n<blockquote><p>And another</p></blockquote>',"n":'Two block quotes explicitly closed inline'},
    { "i":'\"\"Multiple quotes\"\"\r\n\r\n\r\n\"\"And another\"\"',"o":'<blockquote><p>Multiple quotes</p></blockquote>\r\n<blockquote><p>And another</p></blockquote>',"n":'Two block quotes explicitly closed inline with multiple blank lines separating'},
    { "i":'\"\"#Heading   \"\"',"o":'<blockquote><h1>Heading</h1></blockquote>',"n":'Blockquote with heading and explicit close on single line with spacing before close'},
    { "i":'\"\"   #Heading   \"\"',"o":'<blockquote><h1>Heading</h1></blockquote>',"n":'Blockquote with heading and explicit close on single line with spacing before close and before heading spec'},
    { "i":'\"\"   #    Heading   \"\"',"o":'<blockquote><h1>Heading</h1></blockquote>',"n":'Blockquote with heading and explicit close on single line with spacing before close and before heading spec and multiple spaces after header spec'},
    { "i":'\'\'\r\nParagraph\r\n\'\'', "o":'<p>\r\nParagraph\r\n</p>',"n":'Paragraph block close not detected as paragraph start'},
    { "i":'\"\"\r\nBlockquote\r\n\"\"', "o":'<blockquote>\r\n<p>Blockquote\r\n</p></blockquote>',"n":'Block quote block close not detected as block quote start'},
    { "i":'\"\"\r\n\'\'Paragraph\"\"',"o":'<blockquote>\r\n<p>Paragraph</p></blockquote>',"n":'Explicitly open block quote and paragraph closed by explicit block quote close'},
    { "i":'\"\"\r\n\'\'Paragraph\r\n\"\"',"o":'<blockquote>\r\n<p>Paragraph\r\n</p></blockquote>',"n":'Explicitly open block quote and paragraph closed by explicit block quote close on new line'},
    { "i":'\"\"\r\n\'\'Paragraph\'\'\r\n\"\"',"o":'<blockquote>\r\n<p>Paragraph</p>\r\n</blockquote>',"n":'Explicitly open block quote and paragraph closed by explicit paragraph close inline and block quote close on new line'},
    { "i":'---',"o":'<hr/>',"n":'Simple horizontal rule on own line'},
    { "i":'  ---',"o":'<hr/>',"n":'Simple horizontal rule on own line with spacing before'},
    { "i":'---  ',"o":'<hr/>',"n":'Simple horizontal rule on own line with spacing after'},
    { "i":'---?rule',"o":'<hr id=\'rule\'/>',"n":'Simple horizontal rule on own line with open id spec'},
    { "i":'---?rule?',"o":'<hr id=\'rule\'/>',"n":'Simple horizontal rule on own line with closed id spec'},
    { "i":'---?rule@classy',"o":'<hr id=\'rule\' class=\'classy\'/>',"n":'Simple horizontal rule on own line with open id and CSS spec'},
    { "i":'---?rule?@classy@',"o":'<hr id=\'rule\' class=\'classy\'/>',"n":'Simple horizontal rule on own line with closed id and CSS spec'},
    { "i":'Haha --- Ignored!',"o":'<p>Haha --- Ignored!\r\n</p>',"n":'Horizontal rule is ignored when not first and last'},
    { "i":'Haha ---',"o":'<p>Haha ---\r\n</p>',"n":'Horizontal rule is ignored when not first'},
    { "i":'--- Ignored!',"o":'<p>--- Ignored!\r\n</p>',"n":'Horizontal rule is ignored when not last'},
    { "i":'\'\' Explicit paragraph\r\n---\r\nWith a HR!\'\'',"o":'<p>Explicit paragraph\r\n<hr/>\r\nWith a HR!</p>',"n":'Horizontal rule nested in explicit paragraph'},
    { "i":'\'\' Explicit paragraph\r\n---\r\nWith a HR!\r\n\'\'',"o":'<p>Explicit paragraph\r\n<hr/>\r\nWith a HR!\r\n</p>',"n":'Horizontal rule nested in explicit paragraph closed on new line'},
    { "i":'\"\" Explicit blockquote\r\n---\r\nWith a HR!\"\"',"o":'<blockquote><p>Explicit blockquote\r\n</p><hr/>\r\n<p>With a HR!</p></blockquote>',"n":'Horizontal rule nested in explicit blockquote'},
    { "i":'\"\" Explicit blockquote\r\n---\r\nWith a HR!\r\n\"\"',"o":'<blockquote><p>Explicit blockquote\r\n</p><hr/>\r\n<p>With a HR!\r\n</p></blockquote>',"n":'Horizontal rule nested in explicit blockquote closed on new line'},
];

function buildInlineTestCases(spec,element,text,name,commonSpec)
{
    var a = [
        { "i":'' + spec + '' + text + '',"o":'<p><' + element + '>' + text + '</' + element + '>\r\n</p>',"n":name + ' implicitly closed on one line at start of line'},
        { "i":'\'\'' + spec + '' + text + '',"o":'<p><' + element + '>' + text + '</' + element + '>\r\n</p>',"n":name + ' implicitly closed on one line at start of line after explicit paragraph open',"s":["IS_FORMAT_SECTION_OF_LINE"]},
        { "i":'\'\'' + spec + '' + text + '\'\'',"o":'<p><' + element + '>' + text + '</' + element + '></p>',"n":name + ' implicitly closed on one line at start of line after explicit paragraph open and explicit inline close',"s":["IS_FORMAT_SECTION_OF_LINE"]},
        { "i":'#' + spec + '' + text + '',"o":'<h1><' + element + '>' + text + '</' + element + '></h1>',"n":name + ' implicitly closed on one line at start of line after h1 open',"s":["IS_FORMAT_SECTION_OF_LINE"]},
        { "i":'#2' + spec + '' + text + '',"o":'<h2><' + element + '>' + text + '</' + element + '></h2>',"n":name + ' implicitly closed on one line at start of line after h2 (by depth) open',"s":["IS_FORMAT_SECTION_OF_LINE"]},
        { "i":'\'\'#' + spec + '' + text + '',"o":'<p><h1><' + element + '>' + text + '</' + element + '></h1>\r\n</p>',"n":name + ' implicitly closed on one line at start of line after h1 open after explicit paragraph open',"s":["IS_FORMAT_SECTION_OF_LINE"]},
        { "i":'\'\'#2' + spec + '' + text + '',"o":'<p><h2><' + element + '>' + text + '</' + element + '></h2>\r\n</p>',"n":name + ' implicitly closed on one line at start of line after h2 (by depth) open after explicit paragraph open',"s":["IS_FORMAT_SECTION_OF_LINE"]},
        { "i":'\'\'#' + spec + '' + text + '\'\'',"o":'<p><h1><' + element + '>' + text + '</' + element + '></h1></p>',"n":name + ' implicitly closed on one line at start of line after h1 open after explicit paragraph open with explicit inline close',"s":["IS_FORMAT_SECTION_OF_LINE"]},
        { "i":'\'\'#2' + spec + '' + text + '\'\'',"o":'<p><h2><' + element + '>' + text + '</' + element + '></h2></p>',"n":name + ' implicitly closed on one line at start of line after h2 (by depth) open after explicit paragraph open with explicit inline close',"s":["IS_FORMAT_SECTION_OF_LINE"]},
        { "i":'' + spec + '?me?' + text + '',"o":'<p><' + element + ' id=\'me\'>' + text + '</' + element + '>\r\n</p>',"n":name + ' implicitly closed on one line at start of line with closed id spec no space'},
        { "i":'' + spec + '$spec=test$' + text + '',"o":'<p><' + element + ' data-spec=\'test\'>' + text + '</' + element + '>\r\n</p>',"n":name + ' implicitly closed on one line at start of line with closed data spec no space'},
        { "i":'' + spec + '$spec=test ' + text + '',"o":'<p><' + element + ' data-spec=\'test\'> ' + text + '</' + element + '>\r\n</p>',"n":name + ' implicitly closed on one line at start of line with implicitly closed data spec'},
        { "i":'' + spec + '$spec=test?me ' + text + '',"o":'<p><' + element + ' id=\'me\' data-spec=\'test\'> ' + text + '</' + element + '>\r\n</p>',"n":name + ' implicitly closed on one line at start of line with implicitly closed data spec and id spec no space'},
        { "i":'' + spec + '$spec=test$?me?' + text + '',"o":'<p><' + element + ' id=\'me\' data-spec=\'test\'>' + text + '</' + element + '>\r\n</p>',"n":name + ' implicitly closed on one line at start of line with explicitly closed data spec and id spec no space'},
        { "i":'' + spec + '$spec=test&parent=otherTest$?me?' + text + '',"o":'<p><' + element + ' id=\'me\' data-spec=\'test\' data-parent=\'otherTest\'>' + text + '</' + element + '>\r\n</p>',"n":name + ' implicitly closed on one line at start of line with explicitly closed multiple data spec and id spec no space'},
        { "i":'\'\'' + spec + '?me?' + text + '',"o":'<p><' + element + ' id=\'me\'>' + text + '</' + element + '>\r\n</p>',"n":name + ' implicitly closed on one line at start of line with closed id spec no space after explicit paragraph open'},
        { "i":'\'\'' + spec + '?me?' + text + '\'\'',"o":'<p><' + element + ' id=\'me\'>' + text + '</' + element + '></p>',"n":name + ' implicitly closed on one line at start of line with closed id spec no space after explicit paragraph open and explicit inline close'},
        { "i":'' + spec + '?me? ' + text + '',"o":'<p><' + element + ' id=\'me\'> ' + text + '</' + element + '>\r\n</p>',"n":name + ' implicitly closed on one line at start of line with closed id spec with space'},
        { "i":'' + spec + '?me ' + text + '',"o":'<p><' + element + ' id=\'me\'> ' + text + '</' + element + '>\r\n</p>',"n":name + ' implicitly closed on one line at start of line with open id spec'},
        { "i":'' + spec + '@classy@' + text + '',"o":'<p><' + element + ' class=\'classy\'>' + text + '</' + element + '>\r\n</p>',"n":name + ' implicitly closed on one line at start of line with closed class spec no space'},
        { "i":'' + spec + '@classy@$spec=test$' + text + '',"o":'<p><' + element + ' class=\'classy\' data-spec=\'test\'>' + text + '</' + element + '>\r\n</p>',"n":name + ' implicitly closed on one line at start of line with closed class and data spec no space'},
        { "i":'' + spec + '@classy@ ' + text + '',"o":'<p><' + element + ' class=\'classy\'> ' + text + '</' + element + '>\r\n</p>',"n":name + ' implicitly closed on one line at start of line with closed class spec with space'},
        { "i":'' + spec + '@classy@$spec=test$ ' + text + '',"o":'<p><' + element + ' class=\'classy\' data-spec=\'test\'> ' + text + '</' + element + '>\r\n</p>',"n":name + ' implicitly closed on one line at start of line with closed class and data spec with space'},
        { "i":'' + spec + '@classy ' + text + '',"o":'<p><' + element + ' class=\'classy\'> ' + text + '</' + element + '>\r\n</p>',"n":name + ' implicitly closed on one line at start of line with open class spec'},
        { "i":'' + spec + '?me?@classy@' + text + '',"o":'<p><' + element + ' id=\'me\' class=\'classy\'>' + text + '</' + element + '>\r\n</p>',"n":name + ' implicitly closed on one line at start of line with closed id and class spec no space'},
        { "i":'' + spec + '?me?@classy@$spec=test$' + text + '',"o":'<p><' + element + ' id=\'me\' class=\'classy\' data-spec=\'test\'>' + text + '</' + element + '>\r\n</p>',"n":name + ' implicitly closed on one line at start of line with closed id, class and data spec no space'},
        { "i":'' + spec + '@classy@?me?' + text + '',"o":'<p><' + element + ' id=\'me\' class=\'classy\'>' + text + '</' + element + '>\r\n</p>',"n":name + ' implicitly closed on one line at start of line with closed class and id spec no space'},
        { "i":'' + spec + '@classy@?me?$spec=test$' + text + '',"o":'<p><' + element + ' id=\'me\' class=\'classy\' data-spec=\'test\'>' + text + '</' + element + '>\r\n</p>',"n":name + ' implicitly closed on one line at start of line with closed id, class and data spec no space, different order one'},
        { "i":'' + spec + '@classy@?me?$specKey=test$' + text + '',"o":'<p><' + element + ' id=\'me\' class=\'classy\' data-spec-key=\'test\'>' + text + '</' + element + '>\r\n</p>',"n":name + ' implicitly closed on one line at start of line with closed id, class and data spec no space, different order one with data key capitalisation'},
        { "i":'' + spec + '@classy@?me?$spec.key=test$' + text + '',"o":'<p><' + element + ' id=\'me\' class=\'classy\' data-spec-key=\'test\'>' + text + '</' + element + '>\r\n</p>',"n":name + ' implicitly closed on one line at start of line with closed id, class and data spec no space, different order one with data key dot'},
        { "i":'' + spec + '@classy@?me?$spec#key=test$' + text + '',"o":'<p><' + element + ' id=\'me\' class=\'classy\' data-spec-key=\'test\'>' + text + '</' + element + '>\r\n</p>',"n":name + ' implicitly closed on one line at start of line with closed id, class and data spec no space, different order one with data key hash'},
        { "i":'' + spec + '@classy@?me?$spec##key=test$' + text + '',"o":'<p><' + element + ' id=\'me\' class=\'classy\' data-spec-key=\'test\'>' + text + '</' + element + '>\r\n</p>',"n":name + ' implicitly closed on one line at start of line with closed id, class and data spec no space, different order one with data key double hash'},
        { "i":'' + spec + '@classy@?me?$spec###key=test$' + text + '',"o":'<p><' + element + ' id=\'me\' class=\'classy\' data-spec-key=\'test\'>' + text + '</' + element + '>\r\n</p>',"n":name + ' implicitly closed on one line at start of line with closed id, class and data spec no space, different order one with data key triple hash'},
        { "i":'' + spec + '@classy@?me?$spec£key=test$' + text + '',"o":'<p><' + element + ' id=\'me\' class=\'classy\' data-spec-key=\'test\'>' + text + '</' + element + '>\r\n</p>',"n":name + ' implicitly closed on one line at start of line with closed id, class and data spec no space, different order one with data key pound'},
        { "i":'' + spec + '@classy@?me?$spec_key=test$' + text + '',"o":'<p><' + element + ' id=\'me\' class=\'classy\' data-spec-key=\'test\'>' + text + '</' + element + '>\r\n</p>',"n":name + ' implicitly closed on one line at start of line with closed id, class and data spec no space, different order one with data key underscore'},
        { "i":'' + spec + '@classy@?me?$spec-key=test$' + text + '',"o":'<p><' + element + ' id=\'me\' class=\'classy\' data-spec-key=\'test\'>' + text + '</' + element + '>\r\n</p>',"n":name + ' implicitly closed on one line at start of line with closed id, class and data spec no space, different order one with data key dash'},
        { "i":'' + spec + '@classy@$spec=test$?me?' + text + '',"o":'<p><' + element + ' id=\'me\' class=\'classy\' data-spec=\'test\'>' + text + '</' + element + '>\r\n</p>',"n":name + ' implicitly closed on one line at start of line with closed id, class and data spec no space, different order two'},
        { "i":'' + spec + '$spec=test$@classy@?me?' + text + '',"o":'<p><' + element + ' id=\'me\' class=\'classy\' data-spec=\'test\'>' + text + '</' + element + '>\r\n</p>',"n":name + ' implicitly closed on one line at start of line with closed id, class and data spec no space, different order three'},
        { "i":'' + spec + '@classy@ ' + text + '',"o":'<p><' + element + ' class=\'classy\'> ' + text + '</' + element + '>\r\n</p>',"n":name + ' implicitly closed on one line at start of line with closed class spec with space'},
        { "i":'' + spec + '@classy ' + text + '',"o":'<p><' + element + ' class=\'classy\'> ' + text + '</' + element + '>\r\n</p>',"n":name + ' implicitly closed on one line at start of line with open class spec'},
        { "i":'Something' + spec + '' + text + '',"o":'<p>Something<' + element + '>' + text + '</' + element + '>\r\n</p>',"n":name + ' implicitly closed on one line after content with no spacing',"s":["IS_FORMAT_SECTION_OF_LINE"]},
        { "i":'Something ' + spec + '' + text + '',"o":'<p>Something <' + element + '>' + text + '</' + element + '>\r\n</p>',"n":name + ' implicitly closed on one line after content with spacing',"s":["IS_FORMAT_SECTION_OF_LINE"]},
        { "i":'Something' + spec + '' + text + '' + spec,"o":'<p>Something<' + element + '>' + text + '</' + element + '>\r\n</p>',"n":name + ' explicitly closed on one line after content with no spacing',"s":["IS_FORMAT_SECTION_OF_LINE"]},
        { "i":'Something ' + spec + '' + text + '' + spec,"o":'<p>Something <' + element + '>' + text + '</' + element + '>\r\n</p>',"n":name + ' explicitly closed on one line after content with spacing',"s":["IS_FORMAT_SECTION_OF_LINE"]},
        { "i":'Something ' + spec + ' ' + text + ' ' + spec,"o":'<p>Something <' + element + '> ' + text + ' </' + element + '>\r\n</p>',"n":name + ' explicitly closed on one line after content with spacing in ' + name + ' before and after',"s":["IS_FORMAT_SECTION_OF_LINE"]},
        { "i":'Something ' + spec + ' ' + text + ' ' + spec + ' And more!',"o":'<p>Something <' + element + '> ' + text + ' </' + element + '> And more!\r\n</p>',"n":name + ' explicitly closed on one line before and after content with spacing in ' + name + ' before and after',"s":["IS_FORMAT_SECTION_OF_LINE"]},
    ];
    col.each(a,function(k,v){
        if (!v.s)
        {
            v.s =[];
        }
        v.s.push(commonSpec);
    });
    return a;
}

var generatedTests =
    buildInlineTestCases('**', 'strong', 'Strong', 'Strong','IS_STRONG').concat(
        buildInlineTestCases('//', 'em', 'Emphasis', 'Emphasis','IS_EMPHASIS').concat(
            buildInlineTestCases('__', 'u', 'Underlined', 'Underlined','IS_UNDERLINE').concat(
                buildInlineTestCases('^^', 'sup', 'Super', 'Superscript','IS_SUPERSCRIPT').concat(
                    buildInlineTestCases('>>', 'small', 'Small', 'Small','IS_SMALL').concat(
                        buildInlineTestCases('~~', 'strike', 'Striken', 'Strikethrough','IS_STRIKE').concat(
                            buildInlineTestCases('!!', 'sub', 'Beneath', 'Subscript','IS_SUBSCRIPT').concat(
                                buildInlineTestCases('::', 'code', 'Codified', 'Inline Code','IS_CODE').concat(
                                    buildInlineTestCases('``', 'span', 'Spanned', 'span','IS_SPAN')
                                )
                            )
                        )
                    )
                )
            )
        )
    )

function pushCase(groupName){
    return function(k,v){
        v.groupName = groupName;
        cases.push(v);
    }
}

col.each(generatedTests,pushCase("Inline generated tests"));


var moreCases = [
    { "i":'**//Nested inlines',"o":'<p><strong><em>Nested inlines</em></strong>\r\n</p>',"n":'Emphasis nested in strong, implicit close'},
    { "i":'**Strongly //Nested inlines',"o":'<p><strong>Strongly <em>Nested inlines</em></strong>\r\n</p>',"n":'Part emphasis nested in strong, implicit close'},
    { "i":'//Emphasised **Nested inlines',"o":'<p><em>Emphasised <strong>Nested inlines</strong></em>\r\n</p>',"n":'Part strong nested in emphasis, implicit close'},
    { "i":'//Emphasised **Nested inlines//',"o":'<p><em>Emphasised <strong>Nested inlines</strong></em>\r\n</p>',"n":'Part strong nested in emphasis, explicit emphasis closes strong'},
    { "i":'//Emphasised **Nested ~~strikeout//',"o":'<p><em>Emphasised <strong>Nested <strike>strikeout</strike></strong></em>\r\n</p>',"n":'Part strong & strikethrough nested in emphasis, explicit emphasis closes strong & strikethrough in order'},
    { "i":'//Emphasised **Nested ~~strikeout//Following on from that',"o":'<p><em>Emphasised <strong>Nested <strike>strikeout</strike></strong></em>Following on from that\r\n</p>',"n":'Part strong & strikethrough nested in emphasis, explicit emphasis closes strong & strikethrough in order with following text on same line with no space'},
    { "i":'//Emphasised **Nested ~~strikeout// Following on from that',"o":'<p><em>Emphasised <strong>Nested <strike>strikeout</strike></strong></em> Following on from that\r\n</p>',"n":'Part strong & strikethrough nested in emphasis, explicit emphasis closes strong & strikethrough in order with following text on same line with space'},
    { "i":'//Emphasised**Nested~~strikeout//Following on from that',"o":'<p><em>Emphasised<strong>Nested<strike>strikeout</strike></strong></em>Following on from that\r\n</p>',"n":'Part strong & strikethrough nested in emphasis, explicit emphasis closes strong & strikethrough in order with following text on same line with no spacing at all'},
    { "i":'\'\'//Emphasised**Nested~~strikeout//Following on from that',"o":'<p><em>Emphasised<strong>Nested<strike>strikeout</strike></strong></em>Following on from that\r\n</p>',"n":'Part strong & strikethrough nested in explicit paragraph (implicit close) and nested emphasis, explicit emphasis closes strong & strikethrough in order with following text on same line with no spacing at all'},
    { "i":'\'\'//Emphasised**Nested~~strikeout//Following on from that\'\'',"o":'<p><em>Emphasised<strong>Nested<strike>strikeout</strike></strong></em>Following on from that</p>',"n":'Part strong & strikethrough nested in explicit paragraph (explicit inline close) and nested emphasis, explicit emphasis closes strong & strikethrough in order with following text on same line with no spacing at all'},
    { "i":'**Strong\r\n//Emphasised\r\n__Underlined\r\n^^Superscript\r\n>>Small\r\n~~Strike through\r\"n"::Code\r\n!!Subscript\r\n``Spanned',"o":'<p><strong>Strong</strong>\r\n<em>Emphasised</em>\r\n<u>Underlined</u>\r\n<sup>Superscript</sup>\r\n<small>Small</small>\r\n<strike>Strike through</strike>\r\n<code>Code</code>\r\n<sub>Subscript</sub>\r\n<span>Spanned</span>\r\n</p>',"n":'All inline specs on new lines, no spacing'},
    { "i":'This paragraph\r\n\'\'Just got closed',"o":'<p>This paragraph\r\n</p><p>Just got closed\r\n</p>',"n":'Implicit paragraph closed by explicit paragraph'},
    { "i":'This paragraph\r\n\"\"Just got closed',"o":'<p>This paragraph\r\n</p><blockquote><p>Just got closed\r\n</p>\r\n</blockquote>',"n":'Implicit paragraph closed by explicit block quote'},
    { "i":'This paragraph\r\n---\r\nJust got closed',"o":'<p>This paragraph\r\n</p><hr/>\r\n<p>Just got closed\r\n</p>',"n":'Implicit paragraph closed by horizontal rule'},
    { "i":'!"£$%^&*()_+-=[]{}:@~#\';?><,./\\|`¬',"o":'<p>!&#x22;&#xA3;$%^&#x26;*()_+-=[]{}:@~#&#x27;;?&#x3E;&#x3C;,./\\|&#x60;&#xAC;\r\n</p>',"n":'All simple special characters'}
];

col.each(moreCases,pushCase("More tests cases"));

var bugs = [
    { "i":'::h2::',"o":'<p><code>h2</code>\r\n</p>',"n":'h2 in code inline spec bug'},
    { "i":'::h3::',"o":'<p><code>h3</code>\r\n</p>',"n":'h2 in code inline spec bug - h3'},
    { "i":'**h2**',"o":'<p><strong>h2</strong>\r\n</p>',"n":'h2 in strong inline spec'},
    { "i":'\"\"//\"Emphasised?\"// - Missing quote',"o":'<blockquote><p><em>&#x22;Emphasised?&#x22;</em> - Missing quote\r\n</p>\r\n</blockquote>',"n":'Emphasised question mark & quote missing from block quote'}
];

col.each(bugs,pushCase("Bug tests"));

var casesWithOptions =[

];

col.each(casesWithOptions,pushCase("Tests with options"));

var listCases = [
    {"i":'%&\r\n%&',"o":'<ul>\r\n</ul>',"n":'Empty unordered list'},
    {"i":'%&\r\n& An item\r\n%&',"o":'<ul>\r\n<li>An item</li>\r\n</ul>',"n":'Single item explicit unordered list'},
    {"i":'%+\r\n%+',"o":'<ol>\r\n</ol>',"n":'Empty ordered list'},
    {"i":'%+\r\n+ An item\r\n%+',"o":'<ol>\r\n<li>An item</li>\r\n</ol>',"n":'Single item explicit ordered list'},
    {"i":'%+50\r\n%+',"o":'<ol start=\'50\'>\r\n</ol>',"n":'Empty ordered list with start'},
    {"i":'%+50\r\n+Testing testing\r\n%+',"o":'<ol start=\'50\'>\r\n<li>Testing testing</li>\r\n</ol>',"n":'Single ordered list with start'},
    {"i":'%+50\r\n+First\r\n+Second\r\n%+',"o":'<ol start=\'50\'>\r\n<li>First</li>\r\n<li>Second</li>\r\n</ol>',"n":'Two item ordered list with start'},
    {"i":'%+50?lead\r\n%+',"o":'<ol id=\'lead\' start=\'50\'>\r\n</ol>',"n":'Empty ordered list with start and id spec'},
    {"i":'%+50?lead@trash\r\n%+',"o":'<ol id=\'lead\' class=\'trash\' start=\'50\'>\r\n</ol>',"n":'Empty ordered list with start, id spec and css spec'},
    {"i":'&Implicit unordered item list',"o":'<ul><li>Implicit unordered item list</li>\r\n</ul>',"n":'Implicit unordered list from single line item'},
    {"i":'+Implicit ordered item list',"o":'<ol><li>Implicit ordered item list</li>\r\n</ol>',"n":'Implicit ordered list from single line item'}
];

col.each(listCases,pushCase("Tests about lists"));

var cssSpecCases = [
    {"i":'``@@label-danger@Danger danger``',"o":'<p><span class=\'label label-danger\'>Danger danger</span>\r\n</p>',"n":'Inferred CSS base classes'},
    {"i":'``@@label&label-danger@Danger danger``',"o":'<p><span class=\'label label-danger\'>Danger danger</span>\r\n</p>',"n":'Inferred CSS base class ignores already defined base class'},
    {"i":'``@@label&label-danger&btn&btn-danger&btn-large@Danger danger``',"o":'<p><span class=\'label label-danger btn btn-danger btn-large\'>Danger danger</span>\r\n</p>',"n":'Inferred CSS base class ignores multiple already defined base classes'},
    {"i":'``@@label-danger&btn-danger@Danger danger``',"o":'<p><span class=\'label btn label-danger btn-danger\'>Danger danger</span>\r\n</p>',"n":'Inferred multiple CSS base classes'},
    {"i":'``@@btn-danger&btn-large@Danger danger``',"o":'<p><span class=\'btn btn-danger btn-large\'>Danger danger</span>\r\n</p>',"n":'Inferred multiple CSS base classes - single base only used once'},
    {"i":'``@@btn-danger&btn-large@?lead?Danger danger``',"o":'<p><span id=\'lead\' class=\'btn btn-danger btn-large\'>Danger danger</span>\r\n</p>',"n":'Inferred multiple CSS base classes with closed id spec after - single base only used once'},
    {"i":'``?lead?@@btn-danger&btn-large@Danger danger``',"o":'<p><span id=\'lead\' class=\'btn btn-danger btn-large\'>Danger danger</span>\r\n</p>',"n":'Inferred multiple CSS base classes with closed id spec before - single base only used once'},
    {"i":'``?lead@@btn-danger&btn-large@Danger danger``',"o":'<p><span id=\'lead\' class=\'btn btn-danger btn-large\'>Danger danger</span>\r\n</p>',"n":'Inferred multiple CSS base classes with open id spec before - single base only used once'}
];

col.each(cssSpecCases,pushCase("Tests about base css specs"));

var dataSpecCases = [
    {"i":'``$myKey=something',"o":'<p><span data-my-key=\'something\'></span>\r\n</p>',"n":'Data spec key formatting from capitalisation'},
    {"i":'``$myKeyTheFirstOne=something',"o":'<p><span data-my-key-the-first-one=\'something\'></span>\r\n</p>',"n":'Data spec key formatting from capitalisation, longer'},
    {"i":'``$myKeyTheFirstOneWeThoughtOfNoReallyHonest=something',"o":'<p><span data-my-key-the-first-one-we-thought-of-no-really-honest=\'something\'></span>\r\n</p>',"n":'Data spec key formatting from capitalisation, very long'},
    {"i":'``$my-Key=something',"o":'<p><span data-my-key=\'something\'></span>\r\n</p>',"n":'Data spec key preserves existing, but lower'},
    {"i":'``$my--Key=something',"o":'<p><span data-my-key=\'something\'></span>\r\n</p>',"n":'Data spec key preserves existing, but lower, with double dashes removed'},
    {"i":'``$my---Key=something',"o":'<p><span data-my-key=\'something\'></span>\r\n</p>',"n":'Data spec key preserves existing, but lower, with triple dashes removed'},
    {"i":'``$my.Key=something',"o":'<p><span data-my-key=\'something\'></span>\r\n</p>',"n":'Data spec key preserves existing, but lower, with dot replaced with dash'},
    {"i":'``$my_Key=something',"o":'<p><span data-my-key=\'something\'></span>\r\n</p>',"n":'Data spec key preserves existing, but lower, with underscore replaced with dash'},
    {"i":'``$my\'Key=something',"o":'<p><span data-my-key=\'something\'></span>\r\n</p>',"n":'Data spec key preserves existing, but lower, with apostrophe replaced with dash'},
    {"i":'``$my£Key=something',"o":'<p><span data-my-key=\'something\'></span>\r\n</p>',"n":'Data spec key preserves existing, but lower, with pound replaced with dash'},
    {"i":'``$my#Key=something',"o":'<p><span data-my-key=\'something\'></span>\r\n</p>',"n":'Data spec key preserves existing, but lower, with hash replaced with dash'},
    {"i":'``$my!Key=something',"o":'<p><span data-my-key=\'something\'></span>\r\n</p>',"n":'Data spec key preserves existing, but lower, with bang replaced with dash'},
    {"i":'``$my"Key=something',"o":'<p><span data-my-key=\'something\'></span>\r\n</p>',"n":'Data spec key preserves existing, but lower, with double quotes replaced with dash'},

    {"i":'``$MY-KEY=something',"o":'<p><span data-my-key=\'something\'></span>\r\n</p>',"n":'Data spec key preserves existing, all caps'},
    {"i":'``$MY--KEY=something',"o":'<p><span data-my-key=\'something\'></span>\r\n</p>',"n":'Data spec key preserves existing, all caps, with double dashes removed'},
    {"i":'``$MY---KEY=something',"o":'<p><span data-my-key=\'something\'></span>\r\n</p>',"n":'Data spec key preserves existing, all caps, with triple dashes removed'},
    {"i":'``$MY.KEY=something',"o":'<p><span data-my-key=\'something\'></span>\r\n</p>',"n":'Data spec key preserves existing, all caps, with dot replaced with dash'},
    {"i":'``$MY_KEY=something',"o":'<p><span data-my-key=\'something\'></span>\r\n</p>',"n":'Data spec key preserves existing, all caps, with underscore replaced with dash'},

    {"i":'``$my-key=something',"o":'<p><span data-my-key=\'something\'></span>\r\n</p>',"n":'Data spec key preserves existing'}
];

col.each(dataSpecCases,pushCase("Tests about data specs"));

var dataBlockSpecs = [
    {"i":'$$$$?spec-Data@json\r\n$$$$',"o":'<script id=\'spec-Data\' type=\'application/json\'>\r\n</script>',"n":'Empty data block - json'},
    {"i":'$$$$?spec-Data@jsonp\r\n$$$$',"o":'<script id=\'spec-Data\' type=\'application/javascript\'>\r\n</script>',"n":'Empty data block - jsonp'},
    {"i":'$$$$?spec-Data@xml\r\n$$$$',"o":'<script id=\'spec-Data\' type=\'application/xml\'>\r\n</script>',"n":'Empty data block - xml'},
    {"i":'$$$$?spec-Data\r\n$$$$',"o":'<script id=\'spec-Data\' type=\'application/json\'>\r\n</script>',"n":'Empty data block - defaults to json'},

    {"i":'$$$$?spec-Data@json\r\nTesting testing\r\n$$$$',"o":'<p>Testing testing\r\n</p>\r\n<script id=\'spec-Data\' type=\'application/json\'>\r\n</script>',"n":'Empty data block comes after content - json'},
    {"i":'$$$$?spec-Data@jsonp\r\nTesting testing\r\n$$$$',"o":'<p>Testing testing\r\n</p>\r\n<script id=\'spec-Data\' type=\'application/javascript\'>\r\n</script>',"n":'Empty data block comes after content - jsonp'},
    {"i":'$$$$?spec-Data@xml\r\nTesting testing\r\n$$$$',"o":'<p>Testing testing\r\n</p>\r\n<script id=\'spec-Data\' type=\'application/xml\'>\r\n</script>',"n":'Empty data block comes after content - xml'},
    {"i":'$$$$?spec-Data\r\nTesting testing\r\n$$$$',"o":'<p>Testing testing\r\n</p>\r\n<script id=\'spec-Data\' type=\'application/json\'>\r\n</script>',"n":'Empty data block comes after content - defaults to json'},
    {"i":'$$$$\r\n$$$$',"o":'<script id=\'data-block-1\' type=\'application/json\'>\r\n</script>',"n":'Empty data block, auto generated id - defaults to json'},
    {"i":'$$$$\r\n$$$$\r\n$$$$\r\n$$$$',"o":'<script id=\'data-block-1\' type=\'application/json\'>\r\n</script>\r\n<script id=\'data-block-2\' type=\'application/json\'>\r\n</script>',"n":'2 Empty data blocks, auto generated id - defaults to json'},

    {"i":'$$$$@xml\r\n$$$$',"o":'<script id=\'data-block-1\' type=\'application/xml\'>\r\n</script>',"n":'Empty data block, auto generated id - explicit xml'},
    {"i":'$$$$@xml\r\n$$$$\r\n$$$$@xml\r\n$$$$',"o":'<script id=\'data-block-1\' type=\'application/xml\'>\r\n</script>\r\n<script id=\'data-block-2\' type=\'application/xml\'>\r\n</script>',"n":'2 Empty data blocks, auto generated id - explicit xml'},
    {"i":'$$$$\r\n$$$$\r\n$$$$@xml\r\n$$$$',"o":'<script id=\'data-block-1\' type=\'application/json\'>\r\n</script>\r\n<script id=\'data-block-2\' type=\'application/xml\'>\r\n</script>',"n":'2 Empty data blocks, auto generated id - explicit xml for second, default json for first'},

    {"i":'$$$$\r\n#Global Rules\r\n$$$$',"o":'<h1 id=\'global-rules\'>Global Rules</h1>\r\n<script id=\'data-block-1\' type=\'application/json\'>\r\n</script>',"n":'Data block causes auto id generation in heading'}
];

col.each(dataBlockSpecs,pushCase("Tests about data block specs"));

var autoIdGenerationCases = [
    {"i":'# First Heading',"o":'<h1 id=\'first-heading\'>First Heading</h1>',"n":'Generate id from heading with space in content',"opt":{generateIds:true}},
    {"i":'# FirstHeading',"o":'<h1 id=\'first-heading\'>FirstHeading</h1>',"n":'Generate id from heading without space in content',"opt":{generateIds:true}},
    {"i":'# Firstheading',"o":'<h1 id=\'firstheading\'>Firstheading</h1>',"n":'Generate id from heading without space in content, no capitalisation',"opt":{generateIds:true}},
    {"i":'#Firstheading',"o":'<h1 id=\'firstheading\'>Firstheading</h1>',"n":'Generate id from heading without space in content, none after line spec, no capitalisation',"opt":{generateIds:true}},
    {"i":'#FirstHeading',"o":'<h1 id=\'first-heading\'>FirstHeading</h1>',"n":'Generate id from heading without space in content, none after line spec',"opt":{generateIds:true}},
    {"i":'#First Heading',"o":'<h1 id=\'first-heading\'>First Heading</h1>',"n":'Generate id from heading with space in content, without after line spec',"opt":{generateIds:true}},
    {"i":'#?ignored?Not Generated',"o":'<h1 id=\'ignored\'>Not Generated</h1>',"n":'Heading with explicit id doesn\'t have new id generated',"opt":{generateIds:true}},
    {"i":'# First Heading\r\n# First Heading',"o":'<h1 id=\'first-heading\'>First Heading</h1>\r\n<h1 id=\'first-heading-1\'>First Heading</h1>',"n":'Duplicate headings generate unique ids',"opt":{generateIds:true}},
    {"i":'# First Heading\r\n# First Heading\r\n# First Heading',"o":'<h1 id=\'first-heading\'>First Heading</h1>\r\n<h1 id=\'first-heading-1\'>First Heading</h1>\r\n<h1 id=\'first-heading-2\'>First Heading</h1>',"n":'Duplicate headings generate unique ids three times',"opt":{generateIds:true}},
    {"i":'# First Heading\r\n# First Heading\r\n# First Heading\r\n# First Heading',"o":'<h1 id=\'first-heading\'>First Heading</h1>\r\n<h1 id=\'first-heading-1\'>First Heading</h1>\r\n<h1 id=\'first-heading-2\'>First Heading</h1>\r\n<h1 id=\'first-heading-3\'>First Heading</h1>',"n":'Duplicate headings generate unique ids four times',"opt":{generateIds:true}},
    {"i":'\'\'First Paragraph',"o":'<p id=\'first-paragraph\'>First Paragraph\r\n</p>',"n":'Generate id from paragraph with space in content',"opt":{generateIds:true}},
    {"i":'\'\'Only Takes The First Hundred Characters Into Account For The Id When Autogenerating Ids From The Content Inside',"o":'<p id=\'only-takes-the-first-hundred-characters-into-account-for-the-id-when-autogenerating-ids-from-the-con\'>Only Takes The First Hundred Characters Into Account For The Id When Autogenerating Ids From The Content Inside\r\n</p>',"n":'Generate id from paragraph with space in content limited to 100 characters from content',"opt":{generateIds:true}},
    {"i":'&First List Item',"o":'<ul><li id=\'first-list-item\'>First List Item</li>\r\n</ul>',"n":'Generate id from unordered list item with spaces in content',"opt":{generateIds:true}},
    {"i":'+First List Item',"o":'<ol><li id=\'first-list-item\'>First List Item</li>\r\n</ol>',"n":'Generate id from ordered list item with spaces in content',"opt":{generateIds:true}},
];

//col.each(autoIdGenerationCases,pushCase("Tests about auto id generation"));

//var describe = require("mocha");

exports.describeTests = function(){
    describe('parser',function(){
        describe('parseWithNoOptions()',function(){
            col.each(cases, function(k,v){
                it(v.n,function(done){
                    h.assertParseWithNoOptions(assert, v.i, v.o, v.n);
                    done();
                });
            });
        });
    });
};

exports.describeTests();