using System.Collections.Generic;

namespace line_down.Parser.Core
{
    public interface IParseToHtmlOptions
    {
        Dictionary<string, ReplacementTag> DeprecatedTags { get; set; }
        bool GenerateIds { get; set; }
        bool AutodetectHyperlinks { get; set; }
        bool ImplicitDataBlockCapture { get; set; }
        List<string> ImplicitBaseCssClasses { get; set; }
        Dictionary<string, ILinkFormatter> LinkFormatters { get; set; }
        bool OutputComments { get; set; }

        List<string> CssWhitelist { get; set; }
        List<string> IdWhitelist { get; set; }
        List<string> CssBlacklist { get; set; }
        List<string> IdBlacklist { get; set; }
    }
}