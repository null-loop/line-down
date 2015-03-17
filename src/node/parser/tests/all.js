var parserSmokeTests = require('./smoke-tests.js');
var testCases = require('./testcases.js');

function mergeTests(all,testSet)
{
    for(var n in testSet)
    {
        if (testSet.hasOwnProperty(n)){
            all[n]=testSet[n];
        }
    }
}

if (module == require.main)
{
    var allTests={};

    console.log(testCases.length);

    mergeTests(allTests,parserSmokeTests);
    mergeTests(allTests,testCases);

    require('test').run(allTests);
}