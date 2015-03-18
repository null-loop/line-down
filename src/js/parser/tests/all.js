var parserSmokeTests = require('./smoke-tests.js');
var testCases = require('./testcases.js');

if (module == require.main)
{
    var allTests={
        smokeTests:parserSmokeTests.testParseWithNoOptions,
        testCases:testCases.testCases
    };

    require('test').run(allTests);
}