"use client";

// Opens a booking's uploaded document. Document URLs in API responses are
// short-lived (1h) presigned S3 URLs once the uploads bucket is private, so a
// dashboard left open goes stale. On click we re-fetch the booking and open
// the fresh URL; the rendered href is only the fallback.
//
// The tab is opened synchronously and pointed at the URL afterwards, because
// browsers block window.open() calls made after an await.

import React from "react";
import { bookingApi } from "@/lib/api";

type DocField = "road_test_doc_url" | "g1_license_doc_url";

interface BookingDocumentLinkProps {
  bookingId: number;
  field: DocField;
  href: string;
  children: React.ReactNode;
  className?: string;
}

export default function BookingDocumentLink({ bookingId, field, href, children, className }: BookingDocumentLinkProps) {
  const handleClick = async (e: React.MouseEvent<HTMLAnchorElement>) => {
    // Let modified clicks (new tab via ctrl/cmd, etc.) behave natively.
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
    e.preventDefault();

    const tab = window.open("about:blank", "_blank");
    if (!tab) {
      window.location.href = href; // popup blocked: best effort in this tab
      return;
    }
    tab.opener = null;

    try {
      const res = await bookingApi.getBookingById(bookingId);
      const fresh = res.success ? (res.data as Record<DocField, string | undefined> | undefined)?.[field] : undefined;
      tab.location.href = fresh || href;
    } catch {
      tab.location.href = href;
    }
  };

  return (
    <a href={href} target="_blank" rel="noopener noreferrer" onClick={handleClick} className={className}>
      {children}
    </a>
  );
}
