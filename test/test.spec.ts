import { expect } from 'chai'
import { Element } from 'hast'
import { fromMarkdown } from 'mdast-util-from-markdown'
import 'mocha'
import remarkParse from 'remark-parse'
import { read } from 'to-vfile'

import rehypeDocument from 'rehype-document'
import rehypeFormat from 'rehype-format'
import rehypeStringify from 'rehype-stringify'

import { Handler, toHast } from 'mdast-util-to-hast'
import remarkRehype from 'remark-rehype'

import { toHtml } from 'hast-util-to-html'
// @ts-ignore
import { rehypeInlineCodeClassNamePlugin } from '../src/plugin/index.ts'

// import { use } from 'chai'
import { unified } from 'unified'

describe('Test rehypeInlineCodeClassNamePlugin', () => {
  it('should test plugin', async () => {
    const result = await unified()
      .use(remarkParse)
      .use(remarkRehype)
      .use(rehypeInlineCodeClassNamePlugin)
      .use(rehypeDocument)
      .use(rehypeFormat)
      .use(rehypeStringify)
      .process(await read('./test/example.md'))

    // console.log(transformedAst.children[0].children)

    console.error(JSON.stringify(result, undefined, 4))
    expect(String(result.value)).to.include(
      '<code class="dart">const inline = "code";</code>'
    )
    expect(result.value).to.include(
      '<pre><code class="language-js">Maybe block code\n\n</code></pre>'
    )
    // console.log(String(result))
  })

  it('should test plugin with custom separator', async () => {
    const result = await unified()
      .use(remarkParse)
      .use(remarkRehype)
      .use(rehypeInlineCodeClassNamePlugin, { separator: '*' })
      .use(rehypeDocument)
      .use(rehypeFormat)
      .use(rehypeStringify)
      .process(await read('./test/example.md'))

    console.log(JSON.stringify(result.value))

    expect(String(result.value)).to.include(
      '<code class="dart">code with custom separator</code>'
    )
    // console.log(String(result))
  })

  it('should test handler', async () => {
    const markdown = String(await read('./test/example.md'))
    const mdast = fromMarkdown(markdown)

    const handler: Handler = (h, node, parent) => {
      //console.log({ node })
      if (node.value.includes('^')) {
        const [lang, value] = node.value.split('^')
        const element: Element = {
          type: 'element',
          tagName: 'code',
          properties: {
            className: ['language-' + lang],
          },
          children: [
            {
              type: 'text',
              value: value,
            },
          ],
        }
        return element
      }
      return toHast(node) as import('hast').Element
    }

    const handlers: Record<string, Handler> = {
      inlineCode: handler,
    }

    const hast = toHast(mdast, { handlers: { inlineCode: handler } })
    const html = toHtml(hast as import('hast').Root)

    // console.log(JSON.stringify(hast, undefined, 4))
    // console.log(JSON.stringify(hast, undefined, 4))
    // console.log(html)
  })
})
