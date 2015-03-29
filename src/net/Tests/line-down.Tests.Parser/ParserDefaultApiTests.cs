using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using FluentAssertions;
using NUnit.Framework;

namespace line_down.Tests.Parser
{
    [TestFixture]
    public class ParserDefaultApiTests
    {
        [Test]
        public void EnsureDefaultHtmlParserAvailable()
        {
            line_down.Parser.Default.HtmlParser.Should().NotBeNull();
        }

        [Test]
        public void EnsureDefaultHtmlParseOptionsAvailable()
        {
            line_down.Parser.Default.DefaultHtmlParserOptions.Should().NotBeNull();
        }

        [Test]
        public void EnsureDefaultHtmlParseOptionsSetCorrectly()
        {
            var options = line_down.Parser.Default.DefaultHtmlParserOptions;

            options.AutodetectHyperlinks.Should().BeFalse();
            options.GenerateIds.Should().Be(false);
            options.ImplicitBaseCssClasses.Should().BeNull();
            options.ImplicitDataBlockCapture.Should().BeFalse();
            options.LinkFormatters.Should().BeNull();
            options.OutputComments.Should().BeFalse();

            options.CssBlacklist.Should().BeNull();
            options.CssWhitelist.Should().BeNull();
            options.IdBlacklist.Should().BeNull();
            options.IdWhitelist.Should().BeNull();

            options.DeprecatedTags.Should().HaveCount(2);
            options.DeprecatedTags["u"].Tag.Should().Be("span");
            options.DeprecatedTags["u"].CssSpec.Should().Be("underline");
            options.DeprecatedTags["strike"].Tag.Should().Be("span");
            options.DeprecatedTags["strike"].CssSpec.Should().Be("strikethrough");
        }
    }
}
