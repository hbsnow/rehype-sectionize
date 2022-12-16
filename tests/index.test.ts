import { expect, test } from "vitest";
import { rehype } from "rehype";
import { readSync } from "to-vfile";
import rehypeMinifyWhitespace from "rehype-minify-whitespace";
import rehypeSectionize, { type RehypeSectionizeOptions } from "../src";
import { toHtml } from "hast-util-to-html";

const planeProcessor = rehype()
  .data("settings", { fragment: true })
  .use(rehypeMinifyWhitespace);

const run = (name: string, options?: RehypeSectionizeOptions) => {
  const processor = rehype()
    .data("settings", { fragment: true })
    .use(rehypeSectionize, options)
    .use(rehypeMinifyWhitespace);

  const input = toHtml(
    processor.runSync(
      planeProcessor.parse(readSync(`./tests/fixtures/${name}/input.html`)),
    ),
  );

  const output = toHtml(
    planeProcessor.runSync(
      planeProcessor.parse(readSync(`./tests/fixtures/${name}/output.html`)),
    ),
  );

  test(name, () => {
    expect(input).toBe(output);
  });
};

run("basic");
run("complexNests");
run("headingId");
run("enableRootSection", { enableRootSection: true });
run("properties", { properties: { className: ["changed"] } });
run("idPropertyName", { idPropertyName: "dataChanged" });
run("rankPropertyName", { rankPropertyName: "dataChanged" });
run("nonRankPropertyName", { rankPropertyName: undefined });
