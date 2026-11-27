// app/privacy/page.tsx — text: content/legal/privacy-policy.v1.md (verbatim, client-supplied)
import LegalDocumentPage, { legalMetadata } from "@/components/legal/LegalDocumentPage";
import { LEGAL_DOCUMENTS } from "@/lib/legal/documents";

export const metadata = legalMetadata(LEGAL_DOCUMENTS.privacy);

export default function PrivacyPage() {
  return <LegalDocumentPage doc={LEGAL_DOCUMENTS.privacy} />;
}
