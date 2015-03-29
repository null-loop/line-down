using System.Collections.Generic;
using line_down.Parser.Core;

namespace line_down.Parser
{
    public static class Default
    {
        static Default()
        {
            DefaultHtmlParserOptions = new SpecificationHtmlParserOptions()
            {
                DeprecatedTags = new Dictionary<string, ReplacementTag>()
                {
                    {"u",new ReplacementTag()
                    {
                        CssSpec = "underline",
                        Tag = "span"
                    }},
                    {"strike",new ReplacementTag()
                    {
                        CssSpec = "strikethrough",
                        Tag = "span"
                    }}
                }
            };
            HtmlParser = new SpecificationLineDownToHtmlParser(DefaultHtmlParserOptions);
        }

        public static IParseToHtml HtmlParser { get; private set; }
        public static IParseToHtmlOptions DefaultHtmlParserOptions { get; private set; }
    }
}