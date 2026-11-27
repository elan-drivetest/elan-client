// app/provider-agreement/page.tsx — text: content/legal/provider-agreement.v1.md (verbatim, client-supplied)
import LegalDocumentPage, { legalMetadata } from "@/components/legal/LegalDocumentPage";
import { LEGAL_DOCUMENTS } from "@/lib/legal/documents";

export const metadata = legalMetadata(LEGAL_DOCUMENTS.provider);

export default function ProviderAgreementPage() {
  return <LegalDocumentPage doc={LEGAL_DOCUMENTS.provider} />;
}
