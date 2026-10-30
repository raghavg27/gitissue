import { describe, expect, it } from "vitest";
import { parseFormTemplate, parseMarkdownTemplate, pickBugTemplate } from "./templates";

const md = `---
name: Bug report
about: Create a report to help us improve
title: "[BUG] "
labels: bug, needs-triage
---

**Describe the bug**
A clear description.

## Steps to reproduce
1. Go to

## Expected behavior
`;

const form = `name: Bug Report
description: File a bug report
title: "[Bug]: "
labels: ["bug"]
body:
  - type: markdown
    attributes:
      value: Thanks for taking the time!
  - type: textarea
    id: what-happened
    attributes:
      label: What happened?
      description: Also tell us what you expected.
    validations:
      required: true
  - type: dropdown
    id: platform
    attributes:
      label: Platform
      options: [iOS, Android]
  - type: input
    attributes:
      label: App version
    validations:
      required: true
`;

describe("parseMarkdownTemplate", () => {
  it("reads frontmatter and heading/bold sections", () => {
    const t = parseMarkdownTemplate(".github/ISSUE_TEMPLATE/bug.md", md);
    expect(t.name).toBe("Bug report");
    expect(t.title).toBe("[BUG] ");
    expect(t.labels).toEqual(["bug", "needs-triage"]);
    expect(t.kind).toBe("markdown");
    expect(t.sections.map((s) => s.label)).toEqual(["Describe the bug", "Steps to reproduce", "Expected behavior"]);
    expect(t.body).toContain("## Steps to reproduce");
  });

  it("falls back to filename when there is no frontmatter", () => {
    const t = parseMarkdownTemplate("ISSUE_TEMPLATE.md", "### Summary\n");
    expect(t.name).toBe("ISSUE_TEMPLATE");
    expect(t.sections).toEqual([{ label: "Summary", required: false }]);
  });
});

describe("parseFormTemplate", () => {
  it("skips markdown blocks and keeps required flags", () => {
    const t = parseFormTemplate(".github/ISSUE_TEMPLATE/bug.yml", form);
    expect(t.kind).toBe("form");
    expect(t.labels).toEqual(["bug"]);
    expect(t.sections).toEqual([
      { label: "What happened?", required: true, description: "Also tell us what you expected." },
      { label: "Platform", required: false, description: "Options: iOS, Android" },
      { label: "App version", required: true },
    ]);
  });
});

describe("pickBugTemplate", () => {
  const base = { kind: "markdown" as const, sections: [], labels: [] };
  it("prefers a bug template", () => {
    const picked = pickBugTemplate([
      { ...base, name: "Feature request" },
      { ...base, name: "Report a problem", labels: ["bug"] },
    ]);
    expect(picked?.name).toBe("Report a problem");
  });
  it("falls back to the first, or null", () => {
    expect(pickBugTemplate([{ ...base, name: "A" }, { ...base, name: "B" }])?.name).toBe("A");
    expect(pickBugTemplate([])).toBeNull();
  });
});
