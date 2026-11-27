// components/legal/LegalDocumentPage.tsx
//
// Server component shared by /terms, /privacy and /provider-agreement. Renders
// the verbatim legal text with a sticky table of contents and a stable,
// linkable anchor on every numbered clause (the instructor app deep-links
// into these).

import React from "react";
import Link from "next/link";
import type { Metadata } from "next";
import { FileText, Mail, Phone, Link2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  LEGAL_LAST_UPDATED,
  versionLabel,
  type LegalDocumentMeta,
} from "@/lib/legal/documents";
import { loadLegalDocument, type LegalBlock, type LegalLine } from "@/lib/legal/parse";

export const legalMetadata = (doc: LegalDocumentMeta): Metadata => ({
  title: `${doc.title} | Elan Road Test Rental`,
  description: doc.summary,
  alternates: { canonical: doc.path },
});

/** ToS headings are ALL CAPS; the sidebar reads better in sentence case. Mixed-case titles pass through. */
const tocLabel = (t: string) =>
  t === t.toUpperCase() ? t.charAt(0) + t.slice(1).toLowerCase().replace(/drivetest/g, "DriveTest") : t;

function Clause({ line }: { line: LegalLine }) {
  if (!line.number) return <>{line.text}</>;
  return (
    <>
      <a
        href={`#${line.id}`}
        className="font-semibold text-gray-900 tabular-nums mr-1.5 hover:text-[#0C8B44] no-underline"
        aria-label={`Link to section ${line.number}`}
      >
        {line.number}
      </a>
      {line.text}
    </>
  );
}

function Block({ block }: { block: LegalBlock }) {
  switch (block.kind) {
    case "subheading":
      return (
        <h3 id={block.id} className="scroll-mt-28 text-lg font-semibold text-gray-900 pt-2">
          <Clause line={block} />
        </h3>
      );
    case "paragraph":
      return (
        <p id={block.id} className="scroll-mt-28">
          <Clause line={block} />
        </p>
      );
    case "list":
      return block.lettered ? (
        <ul className="space-y-1.5 pl-4 sm:pl-6">
          {block.items.map((item, i) => {
            const m = /^([a-z])\.\s+(.*)$/.exec(item.text);
            return (
              <li key={i} className="flex gap-2">
                <span className="font-medium text-gray-500 shrink-0">{m ? `${m[1]}.` : ""}</span>
                <span>{m ? m[2] : item.text}</span>
              </li>
            );
          })}
        </ul>
      ) : (
        <ul className="list-disc space-y-1.5 pl-6 sm:pl-8 marker:text-[#0C8B44]">
          {block.items.map((item, i) => (
            <li key={i}>{item.text}</li>
          ))}
        </ul>
      );
  }
}

export default function LegalDocumentPage({ doc }: { doc: LegalDocumentMeta }) {
  const { intro, sections } = loadLegalDocument(doc.file);

  return (
    <main className="bg-white">
      {/* Hero */}
      <section className="bg-[#0C8B44]/5 py-14 md:py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-[#0C8B44]/10 mb-6">
            <FileText className="h-6 w-6 text-[#0C8B44]" aria-hidden="true" />
          </div>
          <h1 className="text-3xl md:text-5xl font-bold mb-5">{doc.title}</h1>
          <p className="text-base md:text-lg text-gray-700 mb-5 max-w-2xl mx-auto">{doc.summary}</p>
          <p className="text-sm text-gray-500">
            {versionLabel(doc.version)} · Last updated {LEGAL_LAST_UPDATED}
          </p>
        </div>
      </section>

      {/* Content */}
      <section className="py-12 md:py-16 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
        <div className="grid lg:grid-cols-[280px_1fr] gap-10">
          <aside className="lg:sticky lg:top-24 lg:self-start lg:max-h-[calc(100vh-8rem)] lg:overflow-y-auto pr-2">
            <h2 className="text-sm font-medium text-[#0C8B44] mb-4 uppercase tracking-wide">
              On this page
            </h2>
            <nav aria-label={`${doc.title} sections`}>
              <ol className="space-y-2 text-sm">
                {sections.map((s, i) => (
                  <li key={s.id ?? i}>
                    <a href={`#${s.id}`} className="text-gray-600 hover:text-[#0C8B44] flex gap-2">
                      <span className="text-gray-400 tabular-nums w-5 shrink-0">{s.number ?? ""}</span>
                      <span>{tocLabel(s.text)}</span>
                    </a>
                  </li>
                ))}
              </ol>
            </nav>
          </aside>

          <div className="min-w-0 text-gray-700 leading-relaxed">
            {intro.length > 0 && (
              <div className="space-y-4 mb-12">
                {intro.map((b, i) => (
                  <Block key={i} block={b} />
                ))}
              </div>
            )}

            <div className="space-y-12">
              {sections.map((s, i) => (
                <article key={s.id ?? i} id={s.id} className="scroll-mt-28">
                  <h2 className="group text-xl md:text-2xl font-bold text-gray-900 mb-4 flex items-start gap-3">
                    {s.number && (
                      <span className="w-8 h-8 bg-[#0C8B44] rounded-full flex items-center justify-center text-white text-sm shrink-0 mt-0.5">
                        {s.number}
                      </span>
                    )}
                    <span className="flex-1">{s.text}</span>
                    {s.id && (
                      <a
                        href={`#${s.id}`}
                        className="opacity-0 group-hover:opacity-100 focus:opacity-100 text-gray-400 hover:text-[#0C8B44] transition-opacity mt-1"
                        aria-label={`Link to section ${s.number}`}
                      >
                        <Link2 className="h-4 w-4" aria-hidden="true" />
                      </a>
                    )}
                  </h2>
                  <div className="space-y-4">
                    {s.blocks.map((b, j) => (
                      <Block key={j} block={b} />
                    ))}
                  </div>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Contact — site chrome, not part of the legal text */}
      <section className="py-16 bg-gray-50 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-6">Questions about this document?</h2>
          <div className="flex flex-col sm:flex-row justify-center gap-6 mb-10">
            <div className="bg-white p-6 rounded-lg shadow-sm flex flex-col items-center">
              <div className="w-12 h-12 bg-[#0C8B44]/10 rounded-full flex items-center justify-center mb-4">
                <Phone className="h-5 w-5 text-[#0C8B44]" aria-hidden="true" />
              </div>
              <h3 className="font-medium mb-2">Call Us</h3>
              <p className="text-gray-600">+1 (416) 407-4757</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm flex flex-col items-center">
              <div className="w-12 h-12 bg-[#0C8B44]/10 rounded-full flex items-center justify-center mb-4">
                <Mail className="h-5 w-5 text-[#0C8B44]" aria-hidden="true" />
              </div>
              <h3 className="font-medium mb-2">Email Us</h3>
              <p className="text-gray-600 break-all">elan.drivetestrental@gmail.com</p>
            </div>
          </div>
          <Link href="/contact-us">
            <Button className="bg-[#0C8B44] hover:bg-[#0C8B44]/90 text-white" size="lg">
              Contact Us
            </Button>
          </Link>
        </div>
      </section>
    </main>
  );
}
