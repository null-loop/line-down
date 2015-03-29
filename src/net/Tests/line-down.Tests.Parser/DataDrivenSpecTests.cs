using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using line_down.Parser.Core;
using NUnit.Framework;

namespace line_down.Tests.Parser
{
    [TestFixture]
    public class DataDrivenSpecTests
    {
        [TestCaseSource("JsonTestSpecs")]
        public void TestHtmlParserAgainstSpecification(string input, string output, string testName, IParseToHtmlOptions options = null)
        {
            
        }

        public static IEnumerable<object[]> JsonTestSpecs()
        {
            // enumerate manifest streams
            // read content as JSON
            // emit test objects...
            // profit!
        }
    }
}
