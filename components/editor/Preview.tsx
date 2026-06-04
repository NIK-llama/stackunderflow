import { Code } from "bright";
import { MDXRemote } from "next-mdx-remote/rsc";

Code.theme = {
  light: "github-light",
  dark: "github-dark",
  lightSelector: "html.light",
};

const escapeMdxElements = (markdown: string) => {
  const parts = markdown.split("```");
  const processedParts = parts.map((part, index) => {
    if (index % 2 === 1) {
      // Inside fenced code block
      return part;
    }

    const subParts = part.split("`");
    const processedSubParts = subParts.map((subPart, subIndex) => {
      if (subIndex % 2 === 1) {
        // Inside inline code
        return subPart;
      }

      // Outside code blocks, escape curly braces and HTML-like tags
      return subPart
        .replace(/{/g, "&#123;")
        .replace(/}/g, "&#125;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");
    });

    return processedSubParts.join("`");
  });
  return processedParts.join("```");
};

export const Preview = ({ content }: { content: string }) => {
  const escapedContent = escapeMdxElements(content);
  const formattedContent = escapedContent.replace(/\\/g, "").replace(/&#x20;/g, "");

  return (
    <section className="markdown prose grid break-words">
      <MDXRemote
        source={formattedContent}
        components={{
          pre: (props) => (
            <Code
              {...props}
              lineNumbers
              className="shadow-light-200 dark:shadow-dark-200"
            />
          ),
        }}
      />
    </section>
  );
};
