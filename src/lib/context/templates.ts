import { parse as parseYaml } from "yaml";

export type TemplateSection = { label: string; required: boolean; description?: string };

export type IssueTemplate = {
  name: string;
  title?: string;
  labels: string[];
  kind: "markdown" | "form";
  sections: TemplateSection[];
  body?: string;
};

function baseName(path: string): string {
  return path.split("/").pop()!.replace(/\.(md|ya?ml)$/i, "");
}

function toLabels(value: unknown): string[] {
  if (Array.isArray(value)) return value.map(String);
  if (typeof value === "string") return value.split(",").map((l) => l.trim()).filter(Boolean);
  return [];
}

export function parseMarkdownTemplate(path: string, text: string): IssueTemplate {
  const fm = text.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?/);
  const meta = (fm ? parseYaml(fm[1]) : null) ?? {};
  const body = fm ? text.slice(fm[0].length) : text;
  const sections: TemplateSection[] = [];
  for (const line of body.split(/\r?\n/)) {
    const m = line.match(/^#{1,6}\s+(.+?)\s*$/) ?? line.match(/^\*\*(.+?)\*\*:?\s*$/);
    if (m) sections.push({ label: m[1].trim(), required: false });
  }
  return {
    name: meta.name ?? baseName(path),
    title: meta.title || undefined,
    labels: toLabels(meta.labels),
    kind: "markdown",
    sections,
    body: body.trim(),
  };
}

type FormItem = {
  type: string;
  attributes?: { label?: string; description?: string; options?: (string | { label: string })[] };
  validations?: { required?: boolean };
};

export function parseFormTemplate(path: string, text: string): IssueTemplate {
  const doc = parseYaml(text) ?? {};
  const sections: TemplateSection[] = [];
  for (const item of (doc.body ?? []) as FormItem[]) {
    if (item.type === "markdown" || !item.attributes?.label) continue;
    const options = item.attributes.options?.map((o) => (typeof o === "string" ? o : o.label));
    const description = [item.attributes.description, options && `Options: ${options.join(", ")}`]
      .filter(Boolean)
      .join(" ");
    sections.push({
      label: item.attributes.label,
      required: item.validations?.required === true,
      ...(description && { description }),
    });
  }
  return {
    name: doc.name ?? baseName(path),
    title: doc.title || undefined,
    labels: toLabels(doc.labels),
    kind: "form",
    sections,
  };
}

export function pickBugTemplate(templates: IssueTemplate[]): IssueTemplate | null {
  return templates.find((t) => /bug/i.test(t.name) || t.labels.some((l) => /bug/i.test(l))) ?? templates[0] ?? null;
}
