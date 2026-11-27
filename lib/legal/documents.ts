// lib/legal/documents.ts
//
// Registry of the published legal documents. The text lives in
// `content/legal/*.md` and is the client-supplied wording, verbatim — only
// markup (headings, bullets) was added. The website copy is canonical.
//
// Changing a document's wording means a NEW version: add `<doc>.v2.md`, bump
// `version` and `lastUpdated` here. Customers accept a specific version, so
// never edit a published version's file in place — and tell the backend first:
// it validates the version string customers send.
//
// Unapproved wording goes in LEGAL_DRAFTS, which renders at <path>/draft
// (noindex, with a draft banner) for sign-off. Approving a draft = moving its
// entry into LEGAL_DOCUMENTS.
//
// URLs and section anchors (`#section-13-2`) are deep-linked from the
// instructor app — keep both stable.

export type LegalDocumentKey = "terms" | "privacy" | "provider";

export interface LegalDocumentMeta {
  key: LegalDocumentKey;
  path: string;
  file: string;
  version: string;
  title: string;
  /** Short description for <meta> and the page hero. Not part of the legal text. */
  summary: string;
  /** Publish date of this version. Shown as "Version 1 · Last updated <date>". */
  lastUpdated: string;
}

export const LEGAL_DOCUMENTS: Record<LegalDocumentKey, LegalDocumentMeta> = {
  terms: {
    key: "terms",
    path: "/terms",
    file: "terms-of-service.v1.md",
    version: "v1",
    title: "Terms of Service",
    summary:
      "The terms that govern bookings, vehicle use, payments, cancellations and refunds with Elan Road Test Car Solutions Inc.",
    lastUpdated: "November 27, 2026",
  },
  privacy: {
    key: "privacy",
    path: "/privacy",
    // v1.1 = client v1 + Elan-drafted §15 contact lines and §17 (instructors), approved by the lead.
    file: "privacy-policy.v1.1.md",
    version: "v1.1",
    title: "Privacy Policy",
    summary:
      "How Elan Road Test Car Solutions Inc. collects, uses, shares and protects your personal information.",
    lastUpdated: "November 27, 2026",
  },
  provider: {
    key: "provider",
    path: "/provider-agreement",
    file: "provider-agreement.v1.md",
    version: "v1",
    title: "Independent Vehicle Provider Agreement",
    summary:
      "The agreement between Elan and the driving instructors and vehicle providers registered in the Elan Instructor App.",
    lastUpdated: "November 27, 2026",
  },
};

/**
 * Drafts awaiting client sign-off, served at `<path>/draft`. Not linked from
 * the site, not indexed, never accepted by customers.
 */
export const LEGAL_DRAFTS: Partial<Record<LegalDocumentKey, LegalDocumentMeta>> = {};

/**
 * What a customer accepts at signup and at checkout. The Provider Agreement is
 * instructor-only by its own text and is accepted in the instructor app.
 */
export const CUSTOMER_REQUIRED_DOCUMENTS: LegalDocumentKey[] = ["terms", "privacy"];

export const versionLabel = (version: string) => `Version ${version.replace(/^v/, "")}`;

/** Wire keys agreed with the backend (and the instructor app). Not the same as our internal keys. */
const API_DOCUMENT_KEY: Record<LegalDocumentKey, string> = {
  terms: "terms_of_service",
  privacy: "privacy_policy",
  provider: "provider_agreement",
};

export interface LegalAcceptance {
  document: string;
  version: string;
}

/**
 * Payload for `legal_acceptances` on POST /auth/customer/email/register and
 * POST /bookings. The server stamps accepted_at, IP and user agent itself.
 * NOT YET SENT — wire it once the backend ships the field, or a strict
 * validator will reject the unknown property.
 */
export const customerLegalAcceptances = (): LegalAcceptance[] =>
  CUSTOMER_REQUIRED_DOCUMENTS.map((key) => ({
    document: API_DOCUMENT_KEY[key],
    version: LEGAL_DOCUMENTS[key].version,
  }));
