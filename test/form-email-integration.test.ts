import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("public form email verification integration", () => {
  it.each([
    ["Hire Me", "src/components/ui/HireMeModal.tsx"],
    ["feedback", "src/components/sections/Testimonials.tsx"],
  ])(
    "%s form verifies the mail domain before accepting a submission",
    (_name, file) => {
      const source = readFileSync(file, "utf8");
      // Quote-agnostic so formatter changes (' vs ") don't break the guard.
      expect(source).toMatch(
        /import \{ verifyEmailAddress \} from ["']@\/lib\/email-verification["']/,
      );
      expect(source).toContain("await verifyEmailAddress(formData.email)");
      expect(source).toContain("verification.normalizedEmail");
    },
  );
});
