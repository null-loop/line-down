using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Reflection;
using System.Text;
using System.Threading.Tasks;
using FluentAssertions;
using line_down.Parser.Core;
using NUnit.Framework;

namespace line_down.Tests.Parser
{
    public abstract class HtmlParserBaseTestFixture
    {
        protected void AssertWithNoOptions(string input, string expectedOutput, string testName)
        {
            
        }

        protected void AssertWithOptions(string input, string expectedOutput, IParseToHtmlOptions options, string testName)
        {
            
        }

        protected void AssertWithDefaultOptions(string input, string expectedOutput, string testName)
        {
            
        }
    }
}
