// app/privacy/draft/page.tsx — Privacy Policy v1.1 draft for client sign-off.
// Not linked, not indexed. To publish: move LEGAL_DRAFTS.privacy into
// LEGAL_DOCUMENTS.privacy (with the real date) and delete this route.
import { notFound } from "next/navigation";
import LegalDocumentPage, { legalDraftMetadata } from "@/components/legal/LegalDocumentPage";
import { LEGAL_DRAFTS } from "@/lib/legal/documents";

const draft = LEGAL_DRAFTS.privacy;

export const metadata = draft ? legalDraftMetadata(draft) : {};

export default function PrivacyDraftPage() {
  if (!draft) notFound();
  return <LegalDocumentPage doc={draft} draft />;
}
