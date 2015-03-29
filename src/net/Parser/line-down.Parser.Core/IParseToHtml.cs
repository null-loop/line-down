namespace line_down.Parser.Core
{
    public interface IParseToHtml
    {
        string ParseWithNoOptions(string lineDownContent);
        string ParseWithDefaultOptions(string lineDownContent);
        string ParseWithOptions(string lineDownContent, IParseToHtmlOptions options);
    }
}