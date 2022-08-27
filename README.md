# rehype-inline-code-classname

A [unified](http://unifiedjs.com/explore/package/unified/)([rehype](http://unifiedjs.com/explore/project/rehypejs/rehype/)) plugin to support adding className to inline code blocks

## Description

This plugin takes inline code blocks in Markdown, and allows users to add a class name to it:

The following Markdown:

```md
`highlighted^const inline = "code";`
```

Gets converted to:

```html
<code class="highlighted"> const inline = "code"; </code>
```

The separator by default is `^`, but it can be changed in the configuration.

### Configuration

- config.separator: [String] The character that separates the class name from the content.
- config.trailing: [Boolean] If true, it will try to find the class name at the end of the string.

#### Option: separator

Using a custom separator:

```js
const result = await unified()
  // using '*' as the separator
  .use(rehypeInlineCodeClassNamePlugin, { separator: "*" });
```

The markdown:

```md
`highlighted*const inline = "code";`
```

Is parsed as:

```html
<code class="highlighted">const inline = "code";</code>
```

#### Option: trailing

```js
const result = await unified()
  // using '*' as the separator
  .use(rehypeInlineCodeClassNamePlugin, { trailing: true });
```

The markdown:

```md
`const inline = "code";^highlighted`
```

Is parsed as:

```html
<code class="highlighted">const inline = "code";</code>
```

### Using unified

```js
import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkRehype from "remark-rehype";
import { read } from "to-vfile";

import rehypeInlineCodeClassNamePlugin from "rehype-inline-code-classname";

const result = await unified()
  .use(remarkParse)
  .use(remarkRehype)
  .use(rehypeInlineCodeClassNamePlugin)
  // add more plugins
  .process(await read("./test/example.md"));
```

### Using MDX factory (for Next.js)

```js
import withMDXFactory from "@next/mdx";
import rehypeInlineCodeClassNamePlugin from "rehype-inline-code-classname";

const withMDX = withMDXFactory({
  extension: /\.mdx?$/,
  options: {
    rehypePlugins: [rehypeInlineCodeClassNamePlugin],
    providerImportSource: "@mdx-js/react",
  },
});

const nextConfig = withMDX({
  // next.js configuration
});

export default nextConfig;
```
