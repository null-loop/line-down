[![CI Status](https://travis-ci.org/null-loop/line-down.svg?branch=master)](https://travis-ci.org/null-loop/line-down)
[![Dependency Status](https://david-dm.org/null-loop/line-down.svg)](https://david-dm.org/null-loop/line-down)
[![devDependency Status](https://david-dm.org/null-loop/line-down/dev-status.svg)](https://david-dm.org/null-loop/line-down#info=devDependencies)
[![Code Quality](https://img.shields.io/codacy/22102be6eccf4cd8a97c7506c5d322d2.svg)](https://www.codacy.com/public/nullloop/line-down)

The world needs another markdown-like language - no really it does...

Visit [http://null-loop.github.io/line-down/](http://null-loop.github.io/line-down/) for a working example

## Getting started

If you just want to use the current line-down parser the best way to get it right now is as a node package:

```npm install line-down --save```

Then from a node script

```javascript
var ld = require('line-down');
var p = ld.parser;
var html = p.parseWithNoOptions('#This is awesome');
console.info(html);
```
writes the following to the console:
```
<h1>This is awesome</h1>
```
A cmd-line version and a gulp wrapper are in the works, but are a little way off.

### Working with the source

If you want to get down and dirty with the actual source of line-down - these are the places to start

* `src/tests` - JSON files containing test cases
* `src/js/parser` - base javascript implementation
* `src/node/parser` - extensions / pieces for node environment
* `src/net` - .NET Solution

We run our build chain using `gulp`, with the main top level tasks being:

* `build-all` - Builds all the components
* `test-all` - Tests all the components
* `install-all` - Installs all packages for sub-components
