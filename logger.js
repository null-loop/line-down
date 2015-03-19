"use strict";
var INDENT = "  "
var report = console.log.bind(console)

function passed(message) {
    return message
}
function failed(message) {
    return message
}
function errored(message) {
    return message
}

function indent(message, indentation) {
    indentation = undefined === indentation ? INDENT : indentation
    message = message || ""
    return message.replace(/^/gm, indentation)
}

function Logger(options) {
    if (!(this instanceof Logger)) return new Logger(options)

    options = options || {}
    var print = options.print || report
    var indentation = options.indentation || ""
    var results = options.results || { passes: [], fails: [], errors: [] }
    this.passes = results.passes
    this.fails = results.fails
    this.errors = results.errors
    results = this


    this.pass = function pass(message) {
        results.passes.push(message)
        print(indent(passed(message), indentation))
    }

    this.fail = function fail(error) {
        results.fails.push(error)
        var message = error.message
        print(indent(failed(message), indentation))
    }

    this.error = function error(exception) {
        results.errors.push(exception)
        print(indent(errored(exception.stack || exception), indentation))
    }

    this.section = function section(title) {
        print(indent(title, indentation))
        return new Logger({
            print: print,
            indentation: indent(indentation),
            results: results
        })
    }

    this.report = function report() {
        print("Passed:" + results.passes.length +
        " Failed:" + results.fails.length +
        " Errors:" + results.errors.length)
    }
}

module.exports = Logger
