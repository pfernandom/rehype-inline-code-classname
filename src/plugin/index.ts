import { Element, Root, Text } from 'hast'
import { Transformer } from 'unified'
import visit from 'unist-util-visit'

export function rehypeInlineCodeClassNamePlugin(
  options?: Options
): void | Transformer<Root, Root> {
  return function (root) {
    visit(
      root,
      'element',
      function visitor(node: Element, i: number, parent: any) {
        if (node.tagName !== 'code') return
        if (!parent || parent.tagName === 'pre') return

        const separator = options?.separator ?? '^'

        const [{ value, ...rest }] = node.children as Text[]
        if (value.includes(separator)) {
          const [classname, content] = value.split(separator)
          node.children = [{ value: content, ...rest }] as Text[]
          node.properties = {
            className: classname,
          }
        }
      }
    )

    return root
  }
}
export type Options =
  | {
      separator: string
      trailing: boolean
    }
  | void
  | undefined
