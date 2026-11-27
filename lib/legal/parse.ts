// lib/legal/parse.ts
//
// Server-only: reads `content/legal/*.md` at build time. The markup is a
// deliberately tiny subset — `#` title (skipped, the page renders its own),
// `##` section, `###` subsection, `- ` list item, everything else a paragraph —
// so the legal wording never passes through a general-purpose markdown engine
// that could reinterpret it.

import fs from "node:fs";
import path from "node:path";

export interface LegalLine {
  /** Stable anchor, e.g. `section-13-2-1`, when the line starts with a clause number. */
  id?: string;
  /** The clause number ("13.2.1") split off for styling; `text` holds the rest. */
  number?: string;
  text: string;
}

export type LegalBlock =
  | ({ kind: "subheading" } & LegalLine)
  | ({ kind: "paragraph" } & LegalLine)
  | { kind: "list"; lettered: boolean; items: LegalLine[] };

export interface LegalSection extends LegalLine {
  blocks: LegalBlock[];
}

export interface ParsedLegalDocument {
  intro: LegalBlock[];
  sections: LegalSection[];
}

const CLAUSE = /^(\d+(?:\.\d+)*)\.?\s+(.*)$/;
const LETTERED = /^[a-z]\.\s/;

export const anchorFor = (number: string) => `section-${number.replace(/\./g, "-")}`;

function toLine(text: string): LegalLine {
  const m = CLAUSE.exec(text);
  return m ? { id: anchorFor(m[1]), number: m[1], text: m[2] } : { text };
}

export function loadLegalDocument(file: string): ParsedLegalDocument {
  const raw = fs
    .readFileSync(path.join(process.cwd(), "content", "legal", file), "utf8")
    .replace(/\r\n/g, "\n");

  const intro: LegalBlock[] = [];
  const sections: LegalSection[] = [];
  const target = () => (sections.length ? sections[sections.length - 1].blocks : intro);

  for (const rawLine of raw.split("\n")) {
    const line = rawLine.trim();
    if (!line || line.startsWith("<!--") || line.startsWith("# ")) continue;

    if (line.startsWith("## ")) {
      sections.push({ ...toLine(line.slice(3)), blocks: [] });
      continue;
    }

    const blocks = target();

    if (line.startsWith("### ")) {
      blocks.push({ kind: "subheading", ...toLine(line.slice(4)) });
      continue;
    }

    if (line.startsWith("- ")) {
      const text = line.slice(2);
      const lettered = LETTERED.test(text);
      const last = blocks[blocks.length - 1];
      if (last?.kind === "list" && last.lettered === lettered) last.items.push({ text });
      else blocks.push({ kind: "list", lettered, items: [{ text }] });
      continue;
    }

    blocks.push({ kind: "paragraph", ...toLine(line) });
  }

  return { intro, sections };
}
