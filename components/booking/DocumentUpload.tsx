"use client"

import React, { useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { Upload, AlertCircle, CheckCircle2, Loader2, FileCheck2, ExternalLink } from "lucide-react";

// An already-uploaded document, restored from booking state (e.g. when the
// user navigates back from the Payment step).
interface ExistingFile {
  name: string;
  size?: number;
  url?: string;
}

interface DocumentUploadProps {
  title: string;
  description: string;
  actionText: string;
  acceptedTypes?: string;
  onFileSelect?: (file: File) => void;
  className?: string;
  icon?: React.ReactNode;
  error?: string | null;
  success?: boolean;
  isUploading?: boolean;
  maxSizeMB?: number;
  existingFile?: ExistingFile | null;
}

// Format a byte count into a human-readable size (e.g. "1.2 MB", "340 KB").
const formatFileSize = (bytes?: number): string | null => {
  if (!bytes || bytes <= 0) return null;
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
};

export default function DocumentUpload({
  title,
  description,
  actionText,
  acceptedTypes = ".pdf,.jpg,.jpeg,.png",
  onFileSelect,
  className,
  icon,
  error,
  success,
  isUploading,
  maxSizeMB = 5,
  existingFile
}: DocumentUploadProps) {
  const [fileName, setFileName] = useState<string | null>(null);
  const [fileSize, setFileSize] = useState<number | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Clear previous errors
      setValidationError(null);

      // Validate file size (convert MB to bytes)
      const maxSizeBytes = maxSizeMB * 1024 * 1024;
      if (file.size > maxSizeBytes) {
        const fileSizeMB = (file.size / (1024 * 1024)).toFixed(2);
        setValidationError(`File size (${fileSizeMB} MB) exceeds the maximum allowed size of ${maxSizeMB} MB. Please choose a smaller file.`);
        // Reset the input
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
        return;
      }

      setFileName(file.name);
      setFileSize(file.size);
      onFileSelect?.(file);
    }
  };
  
  // Helper to format error messages - convert bytes to MB
  const formatErrorMessage = (errorMsg: string | null | undefined): string | null => {
    if (!errorMsg) return null;

    // Check if error message contains bytes
    const bytesMatch = errorMsg.match(/(\d+)\s*bytes?/i);
    if (bytesMatch) {
      const bytes = parseInt(bytesMatch[1]);
      const megabytes = (bytes / (1024 * 1024)).toFixed(2);
      // Replace bytes with MB in the message
      return errorMsg.replace(/(\d+)\s*bytes?/i, `${megabytes} MB`);
    }

    return errorMsg;
  };

  // Combine validation error with upload error, and format it
  const displayError = formatErrorMessage(validationError || error);

  // Resolve the document to display: a freshly selected file takes precedence,
  // otherwise fall back to the file already persisted in booking state. The
  // latter is what keeps the document visible after navigating back from Payment.
  const displayName = fileName || existingFile?.name || null;
  const displaySize = formatFileSize(fileSize ?? existingFile?.size ?? undefined);
  // Only the persisted file carries a viewable URL within this component.
  const viewUrl = !fileName ? existingFile?.url : undefined;

  return (
    <div className={cn("mb-6 p-5 border rounded-md", className)}>
      <div className="flex items-start gap-2 mb-2">
        <div className="flex-shrink-0 bg-gray-200 w-8 h-8 rounded-full flex items-center justify-center mt-1">
          {icon || <Upload className="h-4 w-4 text-gray-600" />}
        </div>
        <div className="flex-1">
          <h3 className="font-medium text-sm">{title}</h3>
          <p className="text-xs text-gray-600">{description}</p>
        </div>
      </div>

      {/* Attached document chip (shown when a file is selected or already
          uploaded), otherwise the upload prompt */}
      {displayName && !displayError ? (
        <div className="ml-10 mb-3 p-3 bg-green-50 border border-green-200 rounded-md flex items-center gap-3">
          <FileCheck2 className="h-5 w-5 text-green-600 flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-green-900 truncate" title={displayName}>
              {displayName}
            </p>
            <p className="text-xs text-green-700">
              {isUploading
                ? "Uploading..."
                : `Document attached${displaySize ? ` · ${displaySize}` : ""}`}
            </p>
          </div>
          {success && !isUploading && (
            <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0" />
          )}
          {viewUrl && (
            <a
              href={viewUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-shrink-0 inline-flex items-center gap-1 text-xs font-medium text-green-700 hover:text-green-900 hover:underline"
            >
              View <ExternalLink className="h-3 w-3" />
            </a>
          )}
        </div>
      ) : (
        <p className="text-sm text-gray-600 mb-2 ml-10">
          Please upload your document by scanning or taking a picture.
        </p>
      )}

      {/* Error message */}
      {displayError && (
        <div className="ml-10 mb-3 p-3 bg-red-50 border border-red-200 rounded-md flex items-start gap-2">
          <AlertCircle className="h-4 w-4 text-red-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm text-red-800 font-medium">Upload failed</p>
            <p className="text-xs text-red-700">{displayError}</p>
          </div>
        </div>
      )}

      <input
        type="file"
        ref={fileInputRef}
        accept={acceptedTypes}
        onChange={handleFileChange}
        className="hidden"
        disabled={isUploading}
      />

      <button
        onClick={handleClick}
        disabled={isUploading}
        className="ml-10 w-[calc(100%-2.5rem)] py-2 bg-black text-white rounded-md text-sm font-medium hover:bg-black/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {isUploading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Uploading...
          </>
        ) : (
          actionText
        )}
      </button>
    </div>
  );
}