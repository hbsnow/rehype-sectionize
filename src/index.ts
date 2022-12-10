import { Plugin } from "unified";
import { headingRank } from "hast-util-heading-rank";
import { heading } from "hast-util-heading";
import type { Root, RootContent } from "hast";
import type { Properties } from "hastscript";
import type { Element } from "hastscript/lib/core";

export type RehypeSectionizeOptions = {
  properties?: Properties;
  enableRootSection?: boolean;
};

const defaultOptions: RehypeSectionizeOptions = {
  properties: undefined,
  enableRootSection: false,
};

const wrappingRank = (rootContent: RootContent | undefined) => {
  if (
    rootContent == null ||
    !("properties" in rootContent) ||
    typeof rootContent.properties?.dataHeadingRank !== "number"
  ) {
    throw new Error("dataHeadingRank must be number");
  }

  return rootContent.properties.dataHeadingRank;
};

const createElement = (
  rank: number,
  properties: Properties = {},
  children: Element[] = [],
) => {
  if ("dataHeadingRank" in properties) {
    throw new Error("dataHeadingRank must exist");
  }

  const element: Element = {
    type: "element",
    tagName: "section",
    properties: {
      className: ["heading"],
      dataHeadingRank: rank,
      ...properties,
    },
    children,
  };

  return element;
};

const sectionize: Plugin<[RehypeSectionizeOptions?], Root> = (
  options = defaultOptions,
) => {
  const { properties, enableRootSection } = options;

  return (root) => {
    const rootWrapper = createElement(0, properties);

    const wrapperStack: RootContent[] = [];
    wrapperStack.push(rootWrapper);

    for (const rootContent of root.children) {
      const lastStackItem = wrapperStack.at(-1);
      if (lastStackItem == null || lastStackItem.type !== "element") {
        throw new Error("lastStackItem must be Element");
      }

      if (heading(rootContent)) {
        const rank = headingRank(rootContent);
        if (rank == null) {
          throw new Error("heading or headingRank is not working");
        }

        if (rank > wrappingRank(lastStackItem)) {
          const childWrapper = createElement(rank, properties, [rootContent]);
          lastStackItem.children.push(childWrapper);
          wrapperStack.push(childWrapper);
        } else if (rank <= wrappingRank(lastStackItem)) {
          while (rank <= wrappingRank(lastStackItem)) {
            wrapperStack.pop();
          }
          const siblingWrapper = createElement(rank, properties, [rootContent]);
          lastStackItem.children.push(siblingWrapper);
          wrapperStack.push(siblingWrapper);
        }
      } else {
        if (rootContent.type === "doctype") {
          throw new Error("must be used in a fragment");
        }
        lastStackItem.children.push(rootContent);
      }
    }

    return {
      ...root,
      children: enableRootSection ? [rootWrapper] : rootWrapper.children,
    };
  };
};

export default sectionize;
