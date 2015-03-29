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
A cmd-line version and a gulp wrapper are in the works, but are little way off.