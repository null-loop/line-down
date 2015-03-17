var parserSmokeTests = require('./smoke-tests.js');

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

    mergeTests(allTests,parserSmokeTests);

    require('test').run(allTests);
}