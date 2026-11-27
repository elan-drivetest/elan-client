// app/terms/page.tsx — text: content/legal/terms-of-service.v1.md (verbatim, client-supplied)
import LegalDocumentPage, { legalMetadata } from "@/components/legal/LegalDocumentPage";
import { LEGAL_DOCUMENTS } from "@/lib/legal/documents";

export const metadata = legalMetadata(LEGAL_DOCUMENTS.terms);

export default function TermsPage() {
  return <LegalDocumentPage doc={LEGAL_DOCUMENTS.terms} />;
}
