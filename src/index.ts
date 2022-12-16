import { Plugin } from "unified";
import { headingRank } from "hast-util-heading-rank";
import { heading } from "hast-util-heading";
import type { Root, RootContent } from "hast";
import type { Properties } from "hastscript";
import type { Element } from "hastscript/lib/core";

export type RehypeSectionizeOptions = {
  properties?: Properties | undefined;
  enableRootSection?: boolean | undefined;
  rankPropertyName?: string | undefined;
  idPropertyName?: string | undefined;
};

const defaultOptions: Required<RehypeSectionizeOptions> = {
  properties: {},
  enableRootSection: false,
  rankPropertyName: "dataHeadingRank",
  idPropertyName: "dataHeadingId",
};

const wrappingRank = (
  rootContent: RootContent | undefined,
  rankPropertyName: RehypeSectionizeOptions["rankPropertyName"],
) => {
  if (
    rootContent == null ||
    rankPropertyName == null ||
    !("properties" in rootContent)
  ) {
    throw new Error("rootContent and rankPropertyName must have value");
  }

  const rank = rootContent.properties?.[rankPropertyName];
  if (typeof rank !== "number") {
    throw new Error(`rankPropertyName(${rankPropertyName}) must be number`);
  }

  return rank;
};

const createElement = (
  rank: number,
  options: Pick<
    RehypeSectionizeOptions,
    "properties" | "rankPropertyName" | "idPropertyName"
  >,
  children: Element[] = [],
) => {
  const { properties, rankPropertyName, idPropertyName } = options;

  if (properties && rankPropertyName && rankPropertyName in properties) {
    throw new Error(
      `rankPropertyName(${rankPropertyName}) dataHeadingRank must exist`,
    );
  }

  const id = children.at(0)?.properties?.id;
  const element: Element = {
    type: "element",
    tagName: "section",
    properties: {
      className: ["heading"],
      ...(rankPropertyName ? { [rankPropertyName]: rank } : {}),
      ...(idPropertyName && typeof id === "string"
        ? { [idPropertyName]: id }
        : {}),
      ...(properties ? properties : {}),
    },
    children,
  };

  return element;
};

const sectionize: Plugin<[RehypeSectionizeOptions?], Root> = (
  options = defaultOptions,
) => {
  const { enableRootSection, ...rest } = { ...defaultOptions, ...options };

  return (root) => {
    const rootWrapper = createElement(0, rest);

    const wrapperStack: RootContent[] = [];
    wrapperStack.push(rootWrapper);

    const lastStackItem = () => {
      const last = wrapperStack.at(-1);
      if (last == null || last.type !== "element") {
        throw new Error("lastStackItem must be Element");
      }
      return wrapperStack.at(-1) as Element;
    };

    for (const rootContent of root.children) {
      if (heading(rootContent)) {
        const rank = headingRank(rootContent);
        if (rank == null) {
          throw new Error("heading or headingRank is not working");
        }

        if (rank > wrappingRank(lastStackItem(), rest.rankPropertyName)) {
          const childWrapper = createElement(rank, rest, [rootContent]);
          lastStackItem().children.push(childWrapper);
          wrapperStack.push(childWrapper);
        } else if (
          rank <= wrappingRank(lastStackItem(), rest.rankPropertyName)
        ) {
          while (rank <= wrappingRank(lastStackItem(), rest.rankPropertyName)) {
            wrapperStack.pop();
          }
          const siblingWrapper = createElement(rank, rest, [rootContent]);

          lastStackItem().children.push(siblingWrapper);
          wrapperStack.push(siblingWrapper);
        }
      } else {
        if (rootContent.type === "doctype") {
          throw new Error("must be used in a fragment");
        }
        lastStackItem().children.push(rootContent);
      }
    }

    return {
      ...root,
      children: enableRootSection ? [rootWrapper] : rootWrapper.children,
    };
  };
};

export default sectionize;
