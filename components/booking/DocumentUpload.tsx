"use client"

import React, { useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { Upload } from "lucide-react";

interface DocumentUploadProps {
  title: string;
  description: string;
  actionText: string;
  acceptedTypes?: string;
  onFileSelect?: (file: File) => void;
  className?: string;
  icon?: React.ReactNode;
}

export default function DocumentUpload({
  title,
  description,
  actionText,
  acceptedTypes = ".pdf,.jpg,.jpeg,.png",
  onFileSelect,
  className,
  icon
}: DocumentUploadProps) {
  const [fileName, setFileName] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const handleClick = () => {
    fileInputRef.current?.click();
  };
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFileName(file.name);
      onFileSelect?.(file);
    }
  };
  
  return (
    <div className={cn("mb-6 p-5 border rounded-md", className)}>
      <div className="flex items-start gap-2 mb-2">
        <div className="flex-shrink-0 bg-gray-200 w-8 h-8 rounded-full flex items-center justify-center mt-1">
          {icon || <Upload className="h-4 w-4 text-gray-600" />}
        </div>
        <div>
          <h3 className="font-medium text-sm">{title}</h3>
          <p className="text-xs text-gray-600">{description}</p>
        </div>
      </div>
      
      <p className="text-sm text-gray-600 mb-2 ml-10">
        {fileName ? `Selected file: ${fileName}` : "Please upload your document by scanning or taking a picture."}
      </p>
      
      <input 
        type="file"
        ref={fileInputRef}
        accept={acceptedTypes}
        onChange={handleFileChange}
        className="hidden"
      />
      
      <button
        onClick={handleClick}
        className="ml-10 w-[calc(100%-2.5rem)] py-2 bg-black text-white rounded-md text-sm font-medium hover:bg-black/90 transition-colors"
      >
        {actionText}
      </button>
    </div>
  );
}