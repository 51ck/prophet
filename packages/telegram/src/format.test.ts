import { describe, expect, test } from "bun:test";
import { escapeHtml, toTelegramHtml } from "./format.ts";

describe("escapeHtml", () => {
  test("escapes <>&", () => {
    expect(escapeHtml(`a <b> & "c"`)).toBe("a &lt;b&gt; &amp; \"c\"");
  });
});

describe("toTelegramHtml", () => {
  test("converts **bold** and *italic*", () => {
    expect(toTelegramHtml("Say **hello** and *softly*")).toBe(
      "Say <b>hello</b> and <i>softly</i>",
    );
  });

  test("converts __bold__ and _italic_", () => {
    expect(toTelegramHtml("Say __hello__ and _softly_")).toBe(
      "Say <b>hello</b> and <i>softly</i>",
    );
  });

  test("escapes raw HTML that is not converted markup", () => {
    expect(toTelegramHtml("use <script> & tags")).toBe(
      "use &lt;script&gt; &amp; tags",
    );
  });

  test("escapes content inside emphasis without double-escaping tags", () => {
    expect(toTelegramHtml("**a <b> & c**")).toBe("<b>a &lt;b&gt; &amp; c</b>");
  });

  test("leaves plain prose unchanged aside from escaping", () => {
    expect(toTelegramHtml("The cards wait.")).toBe("The cards wait.");
  });

  test("does not treat unmatched single star as markup", () => {
    expect(toTelegramHtml("rate * 2")).toBe("rate * 2");
  });
});
