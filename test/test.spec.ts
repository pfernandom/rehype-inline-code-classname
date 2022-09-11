import { expect } from "chai";
import { Element } from "hast";
import { fromMarkdown } from "mdast-util-from-markdown";
import "mocha";
import remarkParse from "remark-parse";
import { read } from "to-vfile";

import rehypeDocument from "rehype-document";
import rehypeFormat from "rehype-format";
import rehypeStringify from "rehype-stringify";

import debug from "debug";
import { Handler, toHast } from "mdast-util-to-hast";
import remarkRehype from "remark-rehype";

import { toHtml } from "hast-util-to-html";
// @ts-ignore
import { rehypeInlineCodeClassNamePlugin } from "../src/plugin/index.ts";

// import { use } from 'chai'
import { unified } from "unified";

import { compile } from "@mdx-js/mdx";
import { readFile } from "fs/promises";
import { getMDXComponent } from "mdx-bundler/client/index.js";
import { bundleMDX } from "mdx-bundler/dist/index.js";
import { mdxToMd } from "mdx-to-md";
import path from "path";
import { createElement } from "react";
import { renderToStaticMarkup, renderToString } from "react-dom/server";

const log = debug("test.spec.js");

describe("Test rehypeInlineCodeClassNamePlugin", () => {
  it("should test plugin", async () => {
    const result = await unified()
      .use(remarkParse)
      .use(remarkRehype)
      .use(rehypeInlineCodeClassNamePlugin)
      .use(rehypeDocument)
      .use(rehypeFormat)
      .use(rehypeStringify)
      .process(await read("./test/example.md"));

    log(JSON.stringify(result, undefined, 4));

    expect(String(result.value)).to.include(
      '<code class="dart">const inline = "code";</code>'
    );
    expect(result.value).to.include(
      '<pre><code class="language-js">Maybe block code\n\n</code></pre>'
    );

    expect(result.value).to.include("<code>^</code>");
  });

  it("should test plugin with custom separator", async () => {
    const result = await unified()
      .use(remarkParse)
      .use(remarkRehype)
      .use(rehypeInlineCodeClassNamePlugin, { separator: "*" })
      .use(rehypeDocument)
      .use(rehypeFormat)
      .use(rehypeStringify)
      .process(await read("./test/example.md"));

    log(JSON.stringify(result, undefined, 4));

    expect(String(result.value)).to.include(
      '<code class="dart">code with custom separator</code>'
    );
  });

  it("should test plugin with trailing class", async () => {
    const result = await unified()
      .use(remarkParse)
      .use(remarkRehype)
      .use(rehypeInlineCodeClassNamePlugin, { trailing: true })
      .use(rehypeDocument)
      .use(rehypeFormat)
      .use(rehypeStringify)
      .process(await read("./test/example.md"));

    log(JSON.stringify(result, undefined, 4));

    expect(String(result.value)).to.include(
      '<code class="dart">code with trailing</code>'
    );
  });

  it("should test plugin with mdx", async () => {
    // const { load, getFormat, transformSource } = createLoader(/* Options… */);
    // console.log(path.resolve("./test/example.md"));
    // const file = await load(path.resolve("./test/example.md"), {}, () => {});

    const f = await read("./test/example2.mdx");
    const v = await compile(String(f.value), {
      outputFormat: "function-body",
      useDynamicImport: true,
      jsx: true,
    });

    const p = path.resolve("./test/example2.mdx");
    const contents = await readFile(p, "utf-8");
    const { code } = await bundleMDX({
      source: contents,
      cwd: path.dirname(p),
    });
    const cmp = getMDXComponent(code);
    const element = createElement(cmp);
    const html = renderToString(element);
    const html2 = renderToStaticMarkup(element);
    // console.log({ element });
    // console.log({ html });
    // console.log({ html2 });

    const markdown = await mdxToMd(path.resolve("./test/example2.mdx"));

    // console.log({ markdown });

    const result = await unified()
      .use(remarkParse)
      .use(remarkRehype)
      // .use(rehypeInlineCodeClassNamePlugin, { trailing: true })
      .use(rehypeDocument)
      .use(rehypeFormat)
      .use(rehypeStringify)
      .process(await read("./test/example2.mdx"));

    // console.log(JSON.stringify(result, undefined, 4));
  });

  it("should test plugin with trailing class and custom separator", async () => {
    const result = await unified()
      .use(remarkParse)
      .use(remarkRehype)
      .use(rehypeInlineCodeClassNamePlugin, { trailing: true, separator: "*" })
      .use(rehypeDocument)
      .use(rehypeFormat)
      .use(rehypeStringify)
      .process(await read("./test/example.md"));

    log(JSON.stringify(result, undefined, 4));

    expect(String(result.value)).to.include(
      '<code class="dart">code with trailing and custom separator</code>'
    );
  });

  // it("mast and hast trees", async () => {
  //   const markdown = String(await read("./test/example.md"));
  //   const mdast = fromMarkdown(markdown);

  //   const hast = toHast(mdast);

  //   console.log(JSON.stringify(mdast, undefined, 4));
  //   console.log(JSON.stringify(hast, undefined, 4));
  // });

  it("should test handler", async () => {
    const markdown = String(await read("./test/example.md"));
    const mdast = fromMarkdown(markdown);

    const handler: Handler = (h, node, parent) => {
      //console.log({ node })
      if (node.value.includes("^")) {
        const [lang, value] = node.value.split("^");
        const element: Element = {
          type: "element",
          tagName: "code",
          properties: {
            className: ["language-" + lang],
          },
          children: [
            {
              type: "text",
              value: value,
            },
          ],
        };
        return element;
      }
      return toHast(node) as import("hast").Element;
    };

    const handlers: Record<string, Handler> = {
      inlineCode: handler,
    };

    const hast = toHast(mdast, { handlers: { inlineCode: handler } });
    const html = toHtml(hast as import("hast").Root);

    // console.log(JSON.stringify(hast, undefined, 4))
    // console.log(JSON.stringify(hast, undefined, 4))
    // console.log(html)
  });
});
