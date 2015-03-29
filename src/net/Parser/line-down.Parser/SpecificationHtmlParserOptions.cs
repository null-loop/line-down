using System.Collections.Generic;
using line_down.Parser.Core;

namespace line_down.Parser
{
    public class SpecificationHtmlParserOptions : IParseToHtmlOptions
    {
        public Dictionary<string, ReplacementTag> DeprecatedTags { get; set; }
        public bool GenerateIds { get; set; }
        public bool AutodetectHyperlinks { get; set; }
        public bool ImplicitDataBlockCapture { get; set; }
        public List<string> ImplicitBaseCssClasses { get; set; }
        public Dictionary<string, ILinkFormatter> LinkFormatters { get; set; }
        public bool OutputComments { get; set; }
        public List<string> CssWhitelist { get; set; }
        public List<string> IdWhitelist { get; set; }
        public List<string> CssBlacklist { get; set; }
        public List<string> IdBlacklist { get; set; }
    }
}