#!/usr/bin/env node
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
/* Structure taken from https://www.npmjs.com/package/he */
(function() {

    var fs = require('fs');
    var ld = require('../lib/parser.js');
    var strings = process.argv.splice(2);
    var stdin = process.stdin;
    var data;
    var timeout;
    var action;
    var options = {};
    var log = console.log;

    var main = function() {
        var option = strings[0];
        var count = 0;

        if (/^(?:-h|--help|undefined)$/.test(option)) {
            log(
                'line-down v%s - null-loop.github.io/line-down',
                ld.parser.version
            );
            //TODO:Make this work............
            log([
                '\nUsage:\n',
                '\tline-down --input source-file.ld --output output-file.html',
                '\the [-v | --version]',
                '\the [-h | --help]',
            ].join('\n'));
            return process.exit(1);
        }

        if (/^(?:-v|--version)$/.test(option)) {
            log('v%s', ld.parser.version);
            return process.exit(1);
        }

        strings.forEach(function(string) {
            // Process options
            /*
            if (string == '--escape') {
                action = 'escape';
                return;
            }
            if (string == '--encode') {
                action = 'encode';
                return;
            }
            if (string == '--use-named-refs') {
                action = 'encode';
                options.useNamedReferences = true;
                return;
            }
            if (string == '--everything') {
                action = 'encode';
                options.encodeEverything = true;
                return;
            }
            if (string == '--allow-unsafe') {
                action = 'encode';
                options.allowUnsafeSymbols = true;
                return;
            }
            if (string == '--decode') {
                action = 'decode';
                return;
            }
            if (string == '--attribute') {
                action = 'decode';
                options.isAttributeValue = true;
                return;
            }
            if (string == '--strict') {
                action = 'decode';
                options.strict = true;
                return;
            }*/
            // Process string(s)
            var result;

            try {
                if (!action)
                {
                    result = ld.parser.parseWithDefaultOptions(string);
                }
                log(result);
                count++;
            } catch(error) {
                log(error.message + '\n');
                log('If you think this is a bug in line-down, please report it:');
                log('https://github.com/null-loop/line-down/issues/new');
                log(
                    '\nStack trace using line-down@%s:\n',
                    ld.parser.version
                );
                log(error.stack);
                return process.exit(1);
            }
        });
        if (!count) {
            log('Error: line-down requires a string argument.');
            log('Try `he --help` for more information.');
            return process.exit(1);
        }
        // Return with exit status 0 outside of the `forEach` loop, in case
        // multiple strings were passed in.
        return process.exit(0);
    };

    if (stdin.isTTY) {
        // handle shell arguments
        main();
    } else {
        // Either the script is called from within a non-TTY context, or `stdin`
        // content is being piped in.
        if (!process.stdout.isTTY) {
            // The script was called from a non-TTY context. This is a rather uncommon
            // use case we don’t actively support. However, we don’t want the script
            // to wait forever in such cases, so…
            timeout = setTimeout(function() {
                // …if no piped data arrived after a whole minute, handle shell
                // arguments instead.
                main();
            }, 60000);
        }
        data = '';
        stdin.on('data', function(chunk) {
            clearTimeout(timeout);
            data += chunk;
        });
        stdin.on('end', function() {
            strings.push(data.trim());
            main();
        });
        stdin.resume();
    }

}());
