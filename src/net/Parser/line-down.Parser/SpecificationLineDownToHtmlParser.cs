using System;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using line_down.Parser.Core;

namespace line_down.Parser
{
    public class SpecificationLineDownToHtmlParser : IParseToHtml
    {
        public IParseToHtmlOptions DefaultOptions { get; private set; }

        public SpecificationLineDownToHtmlParser(IParseToHtmlOptions defaultOptions)
        {
            DefaultOptions = defaultOptions;
        }

        public string ParseWithNoOptions(string lineDownContent)
        {
            throw new NotImplementedException();
        }

        public string ParseWithDefaultOptions(string lineDownContent)
        {
            throw new NotImplementedException();
        }

        public string ParseWithOptions(string lineDownContent, IParseToHtmlOptions options)
        {
            throw new NotImplementedException();
        }
    }
}
