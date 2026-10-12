import { describe, expect, it } from "vitest";
import { cn, formatNumber, slugify } from "../src/lib/utils";

describe("shared utility functions", () => {
  it("merges conditional classes and resolves Tailwind conflicts", () => {
    expect(cn("px-2 text-red-500", false, ["font-bold", "px-4"])).toBe(
      "text-red-500 font-bold px-4",
    );
  });

  it("formats ordinary and thousand-scale numbers", () => {
    expect(formatNumber(999)).toBe("999");
    expect(formatNumber(1000)).toBe("1.0k");
    expect(formatNumber(12550)).toBe("12.6k");
  });

  it("creates lowercase URL slugs without punctuation", () => {
    expect(slugify("  Hello, Modern Web!  ")).toBe("-hello-modern-web-");
    expect(slugify("React   Native")).toBe("react-native");
  });
});
