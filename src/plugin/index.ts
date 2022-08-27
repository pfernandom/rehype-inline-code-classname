import { Element, Root, Text } from "hast";
import { Transformer } from "unified";
import visit from "unist-util-visit";

export function rehypeInlineCodeClassNamePlugin(
  options?: Options
): void | Transformer<Root, Root> {
  const separator = options?.separator ?? "^";
  const trailing = options?.trailing ?? false;

  return function (root) {
    function extract(value: String) {
      const [part1, part2] = value.split(separator);

      return trailing
        ? { className: part2, content: part1 }
        : { className: part1, content: part2 };
    }

    visit(
      root,
      "element",
      function visitor(node: Element, i: number, parent: any) {
        if (node.tagName !== "code") return;
        if (!parent || parent.tagName === "pre") return;

        const [{ value, ...rest }] = node.children as Text[];
        if (value.includes(separator)) {
          const { className, content } = extract(value);
          node.children = [{ value: content, ...rest }] as Text[];
          node.properties = {
            className: className,
          };
        }
      }
    );

    return root;
  };
}
export type Options =
  | {
      separator: string;
      trailing: boolean;
    }
  | void
  | undefined;
